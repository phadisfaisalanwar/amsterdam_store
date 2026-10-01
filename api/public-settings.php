<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    jsonResponse(['error' => 'Method tidak diizinkan'], 405);
}

try {
    $settings = ['maintenanceMode' => false, 'taxRate' => 11];
    $statement = database()->query("SELECT setting_key, setting_value FROM store_settings WHERE setting_key IN ('maintenanceMode', 'taxRate')");
    foreach ($statement->fetchAll() as $row) {
        $settings[$row['setting_key']] = json_decode($row['setting_value'], true);
    }
    jsonResponse(['settings' => $settings]);
} catch (Throwable $error) {
    error_log($error->getMessage());
    jsonResponse(['error' => 'Pengaturan publik tidak dapat dimuat'], 500);
}