<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
startApiSession();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? '';

if ($method === 'GET' && $action === 'me') {
    $userId = $_SESSION['user_id'] ?? null;
    if (!$userId) {
        jsonResponse(['user' => null]);
    }

    $statement = database()->prepare('SELECT id, name, email, phone, address, role FROM users WHERE id = ?');
    $statement->execute([(int) $userId]);
    $user = $statement->fetch();
    jsonResponse(['user' => $user ? publicUser($user) : null]);
}

if ($method === 'GET' && $action === 'config') {
    jsonResponse(['googleClientId' => googleClientId()]);
}

if ($method !== 'POST') {
    jsonResponse(['error' => 'Method tidak diizinkan'], 405);
}

$body = jsonBody();
$action = $body['action'] ?? '';

try {
    if ($action === 'logout') {
        $_SESSION = [];
        session_destroy();
        jsonResponse(['ok' => true]);
    }

    if ($action === 'register') {
        $name = trim((string) ($body['name'] ?? ''));
        $email = strtolower(trim((string) ($body['email'] ?? '')));
        $phone = trim((string) ($body['phone'] ?? ''));
        $password = (string) ($body['password'] ?? '');

        if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8) {
            jsonResponse(['error' => 'Nama, email valid, dan password minimal 8 karakter wajib diisi'], 422);
        }

        $statement = database()->prepare('INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, \'customer\')');
        try {
            $statement->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT), $phone]);
        } catch (PDOException $error) {
            if ($error->getCode() === '23000') {
                jsonResponse(['error' => 'Email sudah terdaftar'], 409);
            }
            throw $error;
        }

        session_regenerate_id(true);
        $_SESSION['user_id'] = (int) database()->lastInsertId();
        $user = database()->prepare('SELECT id, name, email, phone, address, role FROM users WHERE id = ?');
        $user->execute([$_SESSION['user_id']]);
        jsonResponse(['user' => publicUser($user->fetch())], 201);
    }

    if ($action === 'login') {
        $email = strtolower(trim((string) ($body['email'] ?? '')));
        $password = (string) ($body['password'] ?? '');
        $statement = database()->prepare('SELECT id, name, email, password, phone, address, role FROM users WHERE email = ?');
        $statement->execute([$email]);
        $user = $statement->fetch();

        $passwordIsHashed = is_string($user['password'] ?? null) && password_verify($password, $user['password']);
        $passwordIsLegacy = is_string($user['password'] ?? null) && hash_equals($user['password'], $password);
        if (!$user || (!$passwordIsHashed && !$passwordIsLegacy)) {
            jsonResponse(['error' => 'Email atau password salah'], 401);
        }

        if (!$passwordIsHashed || password_needs_rehash($user['password'], PASSWORD_DEFAULT)) {
            $update = database()->prepare('UPDATE users SET password = ? WHERE id = ?');
            $update->execute([password_hash($password, PASSWORD_DEFAULT), $user['id']]);
        }

        session_regenerate_id(true);
        $_SESSION['user_id'] = (int) $user['id'];
        jsonResponse(['user' => publicUser($user)]);
    }

    if ($action === 'reset-password-google') {
        $email = strtolower(trim((string) ($body['email'] ?? '')));
        $password = (string) ($body['password'] ?? '');
        $claims = verifiedGoogleClaims((string) ($body['credential'] ?? ''));
        $googleEmail = strtolower((string) $claims['email']);

        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !hash_equals($email, $googleEmail)) {
            jsonResponse(['error' => 'Email akun harus sama dengan email Google terverifikasi'], 403);
        }
        if (strlen($password) < 8) {
            jsonResponse(['error' => 'Password baru minimal 8 karakter'], 422);
        }

        $statement = database()->prepare('SELECT id, google_sub FROM users WHERE email = ?');
        $statement->execute([$email]);
        $user = $statement->fetch();
        if (!$user) {
            jsonResponse(['error' => 'Akun Amsterdam Store tidak ditemukan'], 404);
        }
        if (!empty($user['google_sub']) && !hash_equals((string) $user['google_sub'], (string) $claims['sub'])) {
            jsonResponse(['error' => 'Email sudah terhubung ke akun Google lain'], 409);
        }

        $update = database()->prepare('UPDATE users SET password = ?, google_sub = ? WHERE id = ?');
        $update->execute([password_hash($password, PASSWORD_DEFAULT), (string) $claims['sub'], $user['id']]);
        session_regenerate_id(true);
        $_SESSION['user_id'] = (int) $user['id'];

        $profile = database()->prepare('SELECT id, name, email, phone, address, role FROM users WHERE id = ?');
        $profile->execute([$user['id']]);
        jsonResponse(['user' => publicUser($profile->fetch())]);
    }

    jsonResponse(['error' => 'Aksi tidak dikenal'], 400);
} catch (Throwable $error) {
    error_log($error->getMessage());
    jsonResponse(['error' => 'Permintaan tidak dapat diproses'], 500);
}