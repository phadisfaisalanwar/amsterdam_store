<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
$admin = requireApiAdmin();
$database = database();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    try {
        $products = $database->query(
            'SELECT p.id, p.name, p.sku, p.stock, p.cogs, p.image_url, c.name AS category
             FROM products p LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.is_active = 1 ORDER BY p.name'
        )->fetchAll();
        foreach ($products as &$product) {
            $product['id'] = (int) $product['id'];
            $product['stock'] = (int) $product['stock'];
            $product['cogs'] = (float) $product['cogs'];
        }
        unset($product);
        jsonResponse(['products' => $products]);
    } catch (Throwable $error) {
        error_log($error->getMessage());
        jsonResponse(['error' => 'Data stok tidak dapat dimuat'], 500);
    }
}

if ($method !== 'POST') {
    jsonResponse(['error' => 'Method tidak diizinkan'], 405);
}

$body = jsonBody();
$productId = filter_var($body['productId'] ?? null, FILTER_VALIDATE_INT);
$delta = filter_var($body['delta'] ?? null, FILTER_VALIDATE_INT);
$note = trim((string) ($body['note'] ?? 'Penyesuaian stok oleh admin'));
if (!$productId || $delta === false || $delta === 0 || abs($delta) > 100000) {
    jsonResponse(['error' => 'Produk dan jumlah penyesuaian tidak valid'], 422);
}

try {
    $database->beginTransaction();
    $query = $database->prepare('SELECT stock, cogs FROM products WHERE id = ? AND is_active = 1 FOR UPDATE');
    $query->execute([$productId]);
    $product = $query->fetch();
    if (!$product) {
        throw new DomainException('Produk tidak ditemukan');
    }
    $newStock = (int) $product['stock'] + $delta;
    if ($newStock < 0) {
        throw new DomainException('Stok tidak mencukupi untuk pengurangan tersebut');
    }

    $update = $database->prepare('UPDATE products SET stock = ? WHERE id = ?');
    $update->execute([$newStock, $productId]);
    $movement = $database->prepare(
        "INSERT INTO inventory_movements (product_id, user_id, movement_type, quantity, unit_cost, note)
         VALUES (?, ?, 'adjustment', ?, ?, ?)"
    );
    $movement->execute([$productId, $admin['id'], $delta, $product['cogs'], mb_substr($note, 0, 255)]);
    $audit = $database->prepare('INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES (?, \'adjust_stock\', \'product\', ?, ?, ?)');
    $audit->execute([$admin['id'], (string) $productId, json_encode(['delta' => $delta, 'stock' => $newStock, 'note' => $note], JSON_UNESCAPED_UNICODE), $_SERVER['REMOTE_ADDR'] ?? null]);
    $database->commit();

    jsonResponse(['productId' => $productId, 'stock' => $newStock]);
} catch (DomainException $error) {
    if ($database->inTransaction()) {
        $database->rollBack();
    }
    jsonResponse(['error' => $error->getMessage()], 409);
} catch (Throwable $error) {
    if ($database->inTransaction()) {
        $database->rollBack();
    }
    error_log($error->getMessage());
    jsonResponse(['error' => 'Stok tidak dapat disesuaikan'], 500);
}