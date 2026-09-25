<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method tidak diizinkan'], 405);
}

try {
    $query = database()->query(
        'SELECT p.id, p.name, p.description, p.price, p.stock, p.weight, p.image_url,
                c.name AS category
         FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         ORDER BY p.id ASC'
    );

    $products = array_map(static function (array $product): array {
        $image = $product['image_url'] ?: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop&auto=format';
        $capacity = $product['weight'] ? ((int) $product['weight'] . 'g') : 'Standard';

        return [
            'id' => (int) $product['id'],
            'name' => $product['name'],
            'category' => $product['category'] ?: 'Lainnya',
            'price' => (float) $product['price'],
            'description' => $product['description'] ?: '',
            'longDescription' => $product['description'] ?: '',
            'capacity' => $capacity,
            'material' => 'Stainless Steel',
            'color' => 'Default',
            'image' => $image,
            'images' => [$image],
            'stock' => (int) $product['stock'],
            'rating' => 0,
            'reviewCount' => 0,
            'features' => [],
            'sku' => 'AMS-' . str_pad((string) $product['id'], 4, '0', STR_PAD_LEFT),
        ];
    }, $query->fetchAll());

    jsonResponse(['products' => $products]);
} catch (Throwable $error) {
    jsonResponse(['error' => 'Database tidak dapat diakses'], 500);
}