<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
$admin = requireApiAdmin();
$database = database();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    try {
        $categories = $database->query(
            'SELECT c.id, c.name, c.description, c.image_url, COUNT(p.id) AS product_count
             FROM categories c LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
             GROUP BY c.id, c.name, c.description, c.image_url ORDER BY c.name'
        )->fetchAll();
        foreach ($categories as &$category) {
            $category['id'] = (int) $category['id'];
            $category['productCount'] = (int) $category['product_count'];
            $category['image'] = $category['image_url'] ?? '';
            unset($category['product_count'], $category['image_url']);
        }
        unset($category);
        jsonResponse(['categories' => $categories]);
    } catch (Throwable $error) {
        error_log($error->getMessage());
        jsonResponse(['error' => 'Kategori tidak dapat dimuat'], 500);
    }
}

if (!in_array($method, ['POST', 'PUT', 'DELETE'], true)) {
    jsonResponse(['error' => 'Method tidak diizinkan'], 405);
}

$body = jsonBody();
$id = filter_var($_GET['id'] ?? $body['id'] ?? null, FILTER_VALIDATE_INT);

if ($method === 'DELETE') {
    if (!$id) {
        jsonResponse(['error' => 'ID kategori tidak valid'], 422);
    }
    try {
        $database->beginTransaction();
        $query = $database->prepare('SELECT name FROM categories WHERE id = ? FOR UPDATE');
        $query->execute([$id]);
        $category = $query->fetch();
        if (!$category) {
            throw new DomainException('Kategori tidak ditemukan');
        }
        $count = $database->prepare('SELECT COUNT(*) FROM products WHERE category_id = ? AND is_active = 1');
        $count->execute([$id]);
        if ((int) $count->fetchColumn() > 0) {
            throw new DomainException('Kategori masih digunakan produk. Pindahkan produk sebelum menghapus kategori');
        }
        $database->prepare('DELETE FROM categories WHERE id = ?')->execute([$id]);
        $audit = $database->prepare('INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES (?, \'delete\', \'category\', ?, ?, ?)');
        $audit->execute([$admin['id'], (string) $id, $category['name'], $_SERVER['REMOTE_ADDR'] ?? null]);
        $database->commit();
        jsonResponse(['ok' => true]);
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
        jsonResponse(['error' => 'Kategori tidak dapat dihapus'], 500);
    }
}

$name = trim((string) ($body['name'] ?? ''));
$description = trim((string) ($body['description'] ?? ''));
$image = trim((string) ($body['image'] ?? ''));
if ($name === '' || strlen($name) > 100 || strlen($image) > 255) {
    jsonResponse(['error' => 'Nama kategori wajib diisi dan URL gambar maksimal 255 karakter'], 422);
}

try {
    if ($method === 'POST') {
        $statement = $database->prepare('INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)');
        $statement->execute([$name, $description ?: null, $image ?: null]);
        $id = (int) $database->lastInsertId();
        $action = 'create';
    } else {
        if (!$id) {
            jsonResponse(['error' => 'ID kategori tidak valid'], 422);
        }
        $statement = $database->prepare('UPDATE categories SET name = ?, description = ?, image_url = ? WHERE id = ?');
        $statement->execute([$name, $description ?: null, $image ?: null, $id]);
        if ($statement->rowCount() === 0) {
            $exists = $database->prepare('SELECT id FROM categories WHERE id = ?');
            $exists->execute([$id]);
            if (!$exists->fetch()) {
                jsonResponse(['error' => 'Kategori tidak ditemukan'], 404);
            }
        }
        $action = 'update';
    }

    $audit = $database->prepare('INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES (?, ?, \'category\', ?, ?, ?)');
    $audit->execute([$admin['id'], $action, (string) $id, $name, $_SERVER['REMOTE_ADDR'] ?? null]);
    $query = $database->prepare('SELECT c.id, c.name, c.description, c.image_url, COUNT(p.id) AS product_count FROM categories c LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1 WHERE c.id = ? GROUP BY c.id, c.name, c.description, c.image_url');
    $query->execute([$id]);
    $category = $query->fetch();
    $category['id'] = (int) $category['id'];
    $category['productCount'] = (int) $category['product_count'];
    $category['image'] = $category['image_url'] ?? '';
    unset($category['product_count'], $category['image_url']);
    jsonResponse(['category' => $category], $method === 'POST' ? 201 : 200);
} catch (PDOException $error) {
    error_log($error->getMessage());
    jsonResponse(['error' => $error->getCode() === '23000' ? 'Nama kategori sudah digunakan' : 'Kategori tidak dapat disimpan'], $error->getCode() === '23000' ? 409 : 500);
}