<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
$admin = requireApiAdmin();
$database = database();
$allowedKeys = [
    'siteName', 'tagline', 'email', 'phone', 'whatsapp', 'address',
    'minFreeShipping', 'defaultCourier', 'maintenanceMode', 'allowCOD', 'taxRate', 'currency',
];

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
    try {
        $settings = [];
        foreach ($database->query('SELECT setting_key, setting_value FROM store_settings')->fetchAll() as $row) {
            $settings[$row['setting_key']] = json_decode($row['setting_value'], true);
        }
        jsonResponse(['settings' => $settings]);
    } catch (Throwable $error) {
        error_log($error->getMessage());
        jsonResponse(['error' => 'Pengaturan tidak dapat dimuat'], 500);
    }
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    jsonResponse(['error' => 'Method tidak diizinkan'], 405);
}

$body = jsonBody();
$settings = $body['settings'] ?? null;
if (!is_array($settings)) {
    jsonResponse(['error' => 'Format pengaturan tidak valid'], 422);
}

$defaults = [
    'siteName' => 'Amsterdam Store',
    'tagline' => 'Premium Tumbler untuk Gaya Hidup Aktifmu',
    'email' => 'hello@amsterdam.store',
    'phone' => '087711263928',
    'whatsapp' => '087711263928',
    'address' => 'Jalan Kampung Sawah Gang Angsana, Kota Bekasi',
    'minFreeShipping' => 200000,
    'defaultCourier' => 'JNE',
    'maintenanceMode' => false,
    'allowCOD' => true,
    'taxRate' => 11,
    'currency' => 'IDR',
];

foreach ($settings as $key => $value) {
    if (!in_array($key, $allowedKeys, true) || !array_key_exists($key, $defaults)) {
        jsonResponse(['error' => 'Kunci pengaturan tidak diizinkan'], 422);
    }
    if (is_bool($defaults[$key]) ? !is_bool($value) : (is_numeric($defaults[$key]) ? (!is_numeric($value) || $value < 0 || ($key === 'taxRate' && $value > 100)) : (!is_string($value) || trim($value) === ''))) {
        jsonResponse(['error' => 'Nilai pengaturan ' . $key . ' tidak valid'], 422);
    }
}

try {
    $database->beginTransaction();
    $save = $database->prepare(
        'INSERT INTO store_settings (setting_key, setting_value, updated_by)
         VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by)'
    );
    foreach ($settings as $key => $value) {
        $save->execute([$key, json_encode($value, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR), $admin['id']]);
    }
    $audit = $database->prepare('INSERT INTO audit_logs (user_id, action, entity_type, details, ip_address) VALUES (?, \'update\', \'settings\', ?, ?)');
    $audit->execute([$admin['id'], json_encode(array_keys($settings), JSON_UNESCAPED_UNICODE), $_SERVER['REMOTE_ADDR'] ?? null]);
    $database->commit();
    jsonResponse(['settings' => $settings]);
} catch (Throwable $error) {
    if ($database->inTransaction()) {
        $database->rollBack();
    }
    error_log($error->getMessage());
    jsonResponse(['error' => 'Pengaturan tidak dapat disimpan'], 500);
}