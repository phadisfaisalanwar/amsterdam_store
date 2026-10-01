<?php

declare(strict_types=1);

$localConfig = [];
$localConfigFile = __DIR__ . '/config.local.php';
if (is_file($localConfigFile)) {
    $loadedConfig = require $localConfigFile;
    if (is_array($loadedConfig)) {
        $localConfig = $loadedConfig;
    }
}

foreach ([
    'RESEND_API_KEY' => 'resend_api_key',
    'PASSWORD_RESET_FROM_EMAIL' => 'password_reset_from_email',
    'TWILIO_ACCOUNT_SID' => 'twilio_account_sid',
    'TWILIO_AUTH_TOKEN' => 'twilio_auth_token',
    'TWILIO_FROM_NUMBER' => 'twilio_from_number',
] as $environmentName => $configKey) {
    if (getenv($environmentName) === false && !empty($localConfig[$configKey])) {
        putenv($environmentName . '=' . $localConfig[$configKey]);
    }
}

function database(): PDO
{
    static $connection;

    if ($connection instanceof PDO) {
        return $connection;
    }

    global $localConfig;
    $host = (string) ($localConfig['db_host'] ?? (getenv('AMSTERDAM_DB_HOST') ?: '127.0.0.1'));
    $database = (string) ($localConfig['db_name'] ?? (getenv('AMSTERDAM_DB_NAME') ?: 'amsterdam'));
    $username = (string) ($localConfig['db_user'] ?? (getenv('AMSTERDAM_DB_USER') ?: 'root'));
    $password = (string) ($localConfig['db_password'] ?? (getenv('AMSTERDAM_DB_PASSWORD') ?: ''));
    $dsn = "mysql:host={$host};dbname={$database};charset=utf8mb4";

    $connection = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $connection;
}

function jsonResponse(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}

function configureApi(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowedOrigins = array_filter(array_map('trim', explode(',', getenv('AMSTERDAM_FRONTEND_ORIGINS') ?: 'http://localhost:5173,http://localhost:8443,http://127.0.0.1:5173,http://127.0.0.1:8443')));

    if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
        header('Vary: Origin');
    }

    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function startApiSession(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    session_name('amsterdam_session');
    session_set_cookie_params([
        'httponly' => true,
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'samesite' => 'Lax',
        'path' => '/',
    ]);
    session_start();
}

function jsonBody(): array
{
    $body = json_decode(file_get_contents('php://input') ?: '', true);
    return is_array($body) ? $body : [];
}

function publicUser(array $user): array
{
    return [
        'id' => (int) $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'phone' => $user['phone'] ?? '',
        'role' => in_array($user['role'], ['super_admin', 'staff_gudang'], true) ? 'admin' : 'customer',
        'address' => $user['address'] ?? null,
        'city' => null,
    ];
}

function requireApiUser(): array
{
    startApiSession();
    $userId = $_SESSION['user_id'] ?? null;
    if (!$userId) {
        jsonResponse(['error' => 'Silakan masuk terlebih dahulu'], 401);
    }

    $statement = database()->prepare('SELECT id, name, email, phone, address, role FROM users WHERE id = ?');
    $statement->execute([(int) $userId]);
    $user = $statement->fetch();

    if (!$user) {
        session_destroy();
        jsonResponse(['error' => 'Sesi tidak valid'], 401);
    }

    return $user;
}

function requireApiAdmin(): array
{
    $user = requireApiUser();
    if (!in_array($user['role'], ['super_admin', 'staff_gudang'], true)) {
        jsonResponse(['error' => 'Akses admin diperlukan'], 403);
    }

    return $user;
}

function requireApiSuperAdmin(): array
{
    $user = requireApiUser();
    if ($user['role'] !== 'super_admin') {
        jsonResponse(['error' => 'Akses super admin diperlukan'], 403);
    }

    return $user;
}

function googleClientId(): string
{
    return trim(getenv('GOOGLE_CLIENT_ID') ?: '');
}

function verifiedGoogleClaims(string $credential): array
{
    $clientId = googleClientId();
    if ($clientId === '' || $credential === '') {
        jsonResponse(['error' => 'Login Google belum dikonfigurasi'], 503);
    }

    $context = stream_context_create(['http' => ['timeout' => 5, 'ignore_errors' => true]]);
    $response = file_get_contents('https://oauth2.googleapis.com/tokeninfo?id_token=' . rawurlencode($credential), false, $context);
    $claims = $response ? json_decode($response, true) : null;
    if (!is_array($claims) || !hash_equals($clientId, (string) ($claims['aud'] ?? '')) || !in_array($claims['email_verified'] ?? null, ['true', true], true)) {
        jsonResponse(['error' => 'Token Google tidak valid'], 401);
    }

    if (!filter_var($claims['email'] ?? '', FILTER_VALIDATE_EMAIL) || trim((string) ($claims['sub'] ?? '')) === '') {
        jsonResponse(['error' => 'Identitas Google tidak valid'], 401);
    }

    return $claims;
}

configureApi();