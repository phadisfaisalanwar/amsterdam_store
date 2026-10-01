<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

function normalizeResetPhone(string $phone): ?string
{
    $digits = preg_replace('/\D+/', '', $phone) ?? '';
    if (str_starts_with($digits, '0')) {
        $digits = '62' . substr($digits, 1);
    } elseif (str_starts_with($digits, '8')) {
        $digits = '62' . $digits;
    } elseif (!str_starts_with($digits, '62')) {
        return null;
    }

    return strlen($digits) >= 10 && strlen($digits) <= 15 ? '+' . $digits : null;
}

function findResetUser(PDO $database, string $channel, string $contact): ?array
{
    if ($channel === 'email') {
        $statement = $database->prepare('SELECT id, email, phone FROM users WHERE LOWER(email) = ? LIMIT 1');
        $statement->execute([strtolower($contact)]);
        $user = $statement->fetch();
        return $user ?: null;
    }

    $normalized = normalizeResetPhone($contact);
    if ($normalized === null) {
        return null;
    }

    $digits = substr($normalized, 1);
    $local = '0' . substr($digits, 2);
    $candidates = array_values(array_unique([$contact, $normalized, $digits, $local]));
    $placeholders = implode(', ', array_fill(0, count($candidates), '?'));
    $statement = $database->prepare("SELECT id, email, phone FROM users WHERE phone IN ({$placeholders}) LIMIT 1");
    $statement->execute($candidates);
    $user = $statement->fetch();
    return $user ?: null;
}

function sendResetCode(string $channel, string $destination, string $code): void
{
    if (!function_exists('curl_init')) {
        throw new RuntimeException('Layanan pengiriman kode belum tersedia di server.');
    }

    if ($channel === 'email') {
        $apiKey = trim(getenv('RESEND_API_KEY') ?: '');
        $from = trim(getenv('PASSWORD_RESET_FROM_EMAIL') ?: '');
        if ($apiKey === '' || $from === '') {
            throw new RuntimeException('Pengiriman email belum dikonfigurasi di server.');
        }

        $payload = json_encode([
            'from' => $from,
            'to' => [$destination],
            'subject' => 'Kode reset password Amsterdam Store',
            'text' => "Kode reset password Anda: {$code}. Kode berlaku 10 menit. Jangan bagikan kode ini kepada siapa pun.",
        ], JSON_THROW_ON_ERROR);
        $curl = curl_init('https://api.resend.com/emails');
        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $apiKey, 'Content-Type: application/json'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 12,
        ]);
    } else {
        $accountSid = trim(getenv('TWILIO_ACCOUNT_SID') ?: '');
        $authToken = trim(getenv('TWILIO_AUTH_TOKEN') ?: '');
        $from = trim(getenv('TWILIO_FROM_NUMBER') ?: '');
        if ($accountSid === '' || $authToken === '' || $from === '') {
            throw new RuntimeException('Pengiriman SMS belum dikonfigurasi di server.');
        }

        $curl = curl_init('https://api.twilio.com/2010-04-01/Accounts/' . rawurlencode($accountSid) . '/Messages.json');
        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query([
                'To' => $destination,
                'From' => $from,
                'Body' => "Kode reset password Amsterdam Store: {$code}. Berlaku 10 menit. Jangan bagikan kode ini.",
            ]),
            CURLOPT_USERPWD => $accountSid . ':' . $authToken,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 12,
        ]);
    }

    $response = curl_exec($curl);
    $httpStatus = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $failed = $response === false || $httpStatus < 200 || $httpStatus >= 300;
    curl_close($curl);

    if ($failed) {
        throw new RuntimeException('Kode gagal dikirim. Periksa konfigurasi layanan email atau SMS di server.');
    }
}

function resetRequestMessage(): string
{
    return 'Jika akun cocok, kode verifikasi sudah dikirim. Periksa email atau SMS Anda.';
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    jsonResponse(['error' => 'Method tidak diizinkan'], 405);
}

$body = jsonBody();
$action = (string) ($body['action'] ?? '');
$channel = (string) ($body['channel'] ?? '');
$contact = trim((string) ($body['contact'] ?? ''));
$database = database();

if (!in_array($channel, ['email', 'phone'], true)) {
    jsonResponse(['error' => 'Pilih metode email atau SMS yang valid.'], 422);
}

if ($action === 'request') {
    if (($channel === 'email' && !filter_var($contact, FILTER_VALIDATE_EMAIL)) || ($channel === 'phone' && normalizeResetPhone($contact) === null)) {
        jsonResponse(['error' => $channel === 'email' ? 'Masukkan alamat email yang valid.' : 'Masukkan nomor ponsel dengan kode negara yang valid.'], 422);
    }

    $ipHash = hash('sha256', (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
    $rateQuery = $database->prepare('SELECT COUNT(*) FROM password_reset_codes WHERE ip_hash = ? AND created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 15 MINUTE)');
    $rateQuery->execute([$ipHash]);
    if ((int) $rateQuery->fetchColumn() >= 6) {
        jsonResponse(['error' => 'Terlalu banyak permintaan. Coba lagi beberapa menit.'], 429);
    }

    $user = findResetUser($database, $channel, $contact);
    if (!$user) {
        jsonResponse(['message' => resetRequestMessage()]);
    }

    $recentQuery = $database->prepare('SELECT created_at FROM password_reset_codes WHERE user_id = ? AND channel = ? ORDER BY id DESC LIMIT 1');
    $recentQuery->execute([(int) $user['id'], $channel]);
    $lastRequest = $recentQuery->fetchColumn();
    if ($lastRequest && strtotime((string) $lastRequest) > time() - 60) {
        jsonResponse(['message' => resetRequestMessage()]);
    }

    $destination = $channel === 'email'
        ? strtolower((string) $user['email'])
        : normalizeResetPhone((string) $user['phone']);
    if (!$destination) {
        jsonResponse(['message' => resetRequestMessage()]);
    }

    $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $database->beginTransaction();
    try {
        $database->prepare('UPDATE password_reset_codes SET consumed_at = CURRENT_TIMESTAMP WHERE user_id = ? AND channel = ? AND consumed_at IS NULL')->execute([(int) $user['id'], $channel]);
        $insert = $database->prepare('INSERT INTO password_reset_codes (user_id, channel, code_hash, ip_hash, expires_at) VALUES (?, ?, ?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 10 MINUTE))');
        $insert->execute([(int) $user['id'], $channel, password_hash($code, PASSWORD_DEFAULT), $ipHash]);
        $codeId = (int) $database->lastInsertId();
        $database->commit();
    } catch (Throwable $error) {
        if ($database->inTransaction()) $database->rollBack();
        error_log('Password reset code storage failed: ' . $error->getMessage());
        jsonResponse(['error' => 'Kode reset tidak dapat dibuat. Coba lagi nanti.'], 500);
    }

    try {
        sendResetCode($channel, $destination, $code);
    } catch (Throwable $error) {
        $database->prepare('UPDATE password_reset_codes SET consumed_at = CURRENT_TIMESTAMP WHERE id = ?')->execute([$codeId]);
        error_log('Password reset delivery failed: ' . $error->getMessage());
        jsonResponse(['error' => $error->getMessage()], 503);
    }

    jsonResponse(['message' => resetRequestMessage()]);
}

if ($action === 'verify') {
    $code = trim((string) ($body['code'] ?? ''));
    $password = (string) ($body['password'] ?? '');
    if (!preg_match('/^\d{6}$/', $code)) {
        jsonResponse(['error' => 'Masukkan kode verifikasi 6 digit.'], 422);
    }
    if (strlen($password) < 8) {
        jsonResponse(['error' => 'Password baru minimal 8 karakter.'], 422);
    }

    $user = findResetUser($database, $channel, $contact);
    if (!$user) {
        jsonResponse(['error' => 'Kode salah atau sudah kedaluwarsa.'], 422);
    }

    $database->beginTransaction();
    try {
        $query = $database->prepare('SELECT id, code_hash, attempts, expires_at FROM password_reset_codes WHERE user_id = ? AND channel = ? AND consumed_at IS NULL ORDER BY id DESC LIMIT 1 FOR UPDATE');
        $query->execute([(int) $user['id'], $channel]);
        $reset = $query->fetch();
        if (!$reset || strtotime((string) $reset['expires_at']) < time() || (int) $reset['attempts'] >= 5) {
            $database->rollBack();
            jsonResponse(['error' => 'Kode salah atau sudah kedaluwarsa. Minta kode baru.'], 422);
        }
        if (!password_verify($code, (string) $reset['code_hash'])) {
            $database->prepare('UPDATE password_reset_codes SET attempts = attempts + 1 WHERE id = ?')->execute([(int) $reset['id']]);
            $database->commit();
            jsonResponse(['error' => 'Kode verifikasi salah.'], 422);
        }

        $database->prepare('UPDATE users SET password = ? WHERE id = ?')->execute([password_hash($password, PASSWORD_DEFAULT), (int) $user['id']]);
        $database->prepare('UPDATE password_reset_codes SET consumed_at = CURRENT_TIMESTAMP WHERE user_id = ? AND channel = ? AND consumed_at IS NULL')->execute([(int) $user['id'], $channel]);
        $database->commit();
        jsonResponse(['ok' => true, 'message' => 'Password berhasil diubah. Silakan masuk.']);
    } catch (Throwable $error) {
        if ($database->inTransaction()) $database->rollBack();
        error_log('Password reset verification failed: ' . $error->getMessage());
        jsonResponse(['error' => 'Password tidak dapat diubah. Coba lagi nanti.'], 500);
    }
}

jsonResponse(['error' => 'Aksi reset password tidak valid.'], 400);