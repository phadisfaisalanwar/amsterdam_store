<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
$admin = requireApiAdmin();
$database = database();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function adminProduct(array $product): array
{
    $image = $product['image_url'] ?: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop&auto=format';
    return [
        'id' => (int) $product['id'],
        'name' => $product['name'],
        'category' => $product['category'] ?: 'Lainnya',
        'price' => (float) $product['price'],
        'originalPrice' => $product['original_price'] !== null ? (float) $product['original_price'] : null,
        'cogs' => (float) $product['cogs'],
        'description' => $product['description'] ?: '',
        'longDescription' => $product['description'] ?: '',
        'capacity' => $product['capacity'] ?: ($product['weight'] ? ((int) $product['weight'] . 'g') : 'Standard'),
        'material' => $product['material'] ?: 'Stainless Steel',
        'color' => $product['color'] ?: 'Default',
        'image' => $image,
        'imageUrl' => $product['image_url'] ?: '',
        'images' => [$image],
        'stock' => (int) $product['stock'],
        'rating' => 0,
        'reviewCount' => 0,
        'features' => [],
        'sku' => $product['sku'] ?: 'AMS-' . str_pad((string) $product['id'], 4, '0', STR_PAD_LEFT),
    ];
}

function fetchAdminProduct(PDO $database, int $id): array
{
    $statement = $database->prepare(
        'SELECT p.id, p.sku, p.name, p.description, p.price, p.original_price, p.cogs, p.stock, p.weight,
            p.capacity, p.material, p.color, p.image_url, c.name AS category
         FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = ? AND p.is_active = 1'
    );
    $statement->execute([$id]);
    $product = $statement->fetch();
    if (!$product) {
        jsonResponse(['error' => 'Produk tidak ditemukan'], 404);
    }
    return adminProduct($product);
}

if ($method === 'GET') {
    $products = $database->query(
        'SELECT p.id, p.sku, p.name, p.description, p.price, p.original_price, p.cogs, p.stock, p.weight,
            p.capacity, p.material, p.color, p.image_url, c.name AS category
         FROM products p LEFT JOIN categories c ON c.id = p.category_id
         WHERE p.is_active = 1 ORDER BY p.id ASC'
    )->fetchAll();
    jsonResponse(['products' => array_map('adminProduct', $products)]);
}

$body = jsonBody();
$id = filter_var($_GET['id'] ?? $body['id'] ?? null, FILTER_VALIDATE_INT);

if ($method === 'DELETE') {
    if (!$id) {
        jsonResponse(['error' => 'ID produk tidak valid'], 422);
    }
    $statement = $database->prepare('UPDATE products SET is_active = 0 WHERE id = ? AND is_active = 1');
    $statement->execute([$id]);
    if ($statement->rowCount() !== 1) {
        jsonResponse(['error' => 'Produk tidak ditemukan'], 404);
    }
    $audit = $database->prepare('INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address) VALUES (?, \'archive\', \'product\', ?, ?)');
    $audit->execute([$admin['id'], (string) $id, $_SERVER['REMOTE_ADDR'] ?? null]);
    jsonResponse(['ok' => true]);
}

if (!in_array($method, ['POST', 'PUT'], true)) {
    jsonResponse(['error' => 'Method tidak diizinkan'], 405);
}

$name = trim((string) ($body['name'] ?? ''));
$category = trim((string) ($body['category'] ?? ''));
$sku = trim((string) ($body['sku'] ?? ''));
$description = trim((string) ($body['description'] ?? ''));
$image = trim((string) ($body['image'] ?? $body['image_url'] ?? ''));
$price = filter_var($body['price'] ?? null, FILTER_VALIDATE_FLOAT);
$originalPrice = isset($body['originalPrice']) && $body['originalPrice'] !== '' ? filter_var($body['originalPrice'], FILTER_VALIDATE_FLOAT) : null;
$cogs = filter_var($body['cogs'] ?? null, FILTER_VALIDATE_FLOAT);
$stock = filter_var($body['stock'] ?? null, FILTER_VALIDATE_INT);
$material = trim((string) ($body['material'] ?? 'Stainless Steel 18/8'));
$color = trim((string) ($body['color'] ?? ''));
$weightDigits = preg_replace('/\D+/', '', (string) ($body['capacity'] ?? ''));
$weight = $weightDigits !== '' ? (int) $weightDigits : null;

if ($name === '' || $category === '' || $price === false || $price < 0 || ($originalPrice !== null && ($originalPrice === false || $originalPrice < 0)) || $cogs === false || $cogs < 0 || $stock === false || $stock < 0 || ($sku !== '' && strlen($sku) > 50)) {
    jsonResponse(['error' => 'Nama, kategori, harga, HPP, dan stok harus valid'], 422);
}

try {
    $database->beginTransaction();
    $categoryQuery = $database->prepare('SELECT id FROM categories WHERE name = ? LIMIT 1');
    $categoryQuery->execute([$category]);
    $categoryId = $categoryQuery->fetchColumn();
    if (!$categoryId) {
        $createCategory = $database->prepare('INSERT INTO categories (name) VALUES (?)');
        $createCategory->execute([$category]);
        $categoryId = (int) $database->lastInsertId();
    }

    if ($method === 'POST') {
        $insert = $database->prepare('INSERT INTO products (sku, category_id, name, description, price, original_price, cogs, stock, weight, capacity, material, color, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $insert->execute([$sku !== '' ? $sku : null, $categoryId, $name, $description, $price, $originalPrice, $cogs, $stock, $weight, trim((string) ($body['capacity'] ?? '')) ?: null, $material ?: null, $color ?: null, $image ?: null]);
        $id = (int) $database->lastInsertId();
        $auditAction = 'create';
    } else {
        if (!$id) {
            jsonResponse(['error' => 'ID produk tidak valid'], 422);
        }
        $previous = $database->prepare('SELECT stock FROM products WHERE id = ? AND is_active = 1 FOR UPDATE');
        $previous->execute([$id]);
        $previousStock = $previous->fetchColumn();
        if ($previousStock === false) {
            jsonResponse(['error' => 'Produk tidak ditemukan'], 404);
        }
        $update = $database->prepare('UPDATE products SET sku = ?, category_id = ?, name = ?, description = ?, price = ?, original_price = ?, cogs = ?, stock = ?, weight = ?, capacity = ?, material = ?, color = ?, image_url = ? WHERE id = ?');
        $update->execute([$sku !== '' ? $sku : null, $categoryId, $name, $description, $price, $originalPrice, $cogs, $stock, $weight, trim((string) ($body['capacity'] ?? '')) ?: null, $material ?: null, $color ?: null, $image ?: null, $id]);
        $auditAction = 'update';

        $difference = $stock - (int) $previousStock;
        if ($difference !== 0) {
            $movement = $database->prepare('INSERT INTO inventory_movements (product_id, user_id, movement_type, quantity, unit_cost, note) VALUES (?, ?, \'adjustment\', ?, ?, \'Penyesuaian dari manajemen produk\')');
            $movement->execute([$id, $admin['id'], $difference, $cogs]);
        }
    }

    if ($method === 'POST' && $stock > 0) {
        $movement = $database->prepare('INSERT INTO inventory_movements (product_id, user_id, movement_type, quantity, unit_cost, note) VALUES (?, ?, \'adjustment\', ?, ?, \'Stok awal produk\')');
        $movement->execute([$id, $admin['id'], $stock, $cogs]);
    }
    $audit = $database->prepare('INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES (?, ?, \'product\', ?, ?, ?)');
    $audit->execute([$admin['id'], $auditAction, (string) $id, json_encode(['name' => $name, 'stock' => $stock], JSON_UNESCAPED_UNICODE), $_SERVER['REMOTE_ADDR'] ?? null]);
    $database->commit();

    jsonResponse(['product' => fetchAdminProduct($database, (int) $id)], $method === 'POST' ? 201 : 200);
} catch (PDOException $error) {
    if ($database->inTransaction()) {
        $database->rollBack();
    }
    error_log($error->getMessage());
    jsonResponse(['error' => $error->getCode() === '23000' ? 'SKU atau kategori sudah digunakan' : 'Produk tidak dapat disimpan'], $error->getCode() === '23000' ? 409 : 500);
} catch (Throwable $error) {
    if ($database->inTransaction()) {
        $database->rollBack();
    }
    error_log($error->getMessage());
    jsonResponse(['error' => 'Produk tidak dapat disimpan'], 500);
}