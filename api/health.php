<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

try {
    $productCount = (int) database()->query('SELECT COUNT(*) FROM products')->fetchColumn();
    jsonResponse([
        'ok' => true,
        'database' => 'amsterdam',
        'products' => $productCount,
    ]);
} catch (Throwable $error) {
    jsonResponse([
        'ok' => false,
        'error' => 'Database tidak dapat diakses',
    ], 500);
}