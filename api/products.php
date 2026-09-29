<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method tidak diizinkan'], 405);
}

try {
    $query = database()->query(
        'SELECT p.id, p.sku, p.name, p.description, p.price, p.original_price, p.cogs, p.stock, p.weight,
            p.capacity, p.material, p.color, p.image_url,
                c.name AS category
         FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         WHERE p.is_active = 1
         ORDER BY p.id ASC'
    );

    $products = array_map(static function (array $product): array {
        $image = $product['image_url'] ?: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop&auto=format';
        $capacity = $product['capacity'] ?: ($product['weight'] ? ((int) $product['weight'] . 'g') : 'Standard');

        return [
            'id' => (int) $product['id'],
            'name' => $product['name'],
            'category' => $product['category'] ?: 'Lainnya',
            'price' => (float) $product['price'],
            'originalPrice' => $product['original_price'] !== null ? (float) $product['original_price'] : null,
            'cogs' => (float) $product['cogs'],
            'description' => $product['description'] ?: '',
            'longDescription' => $product['description'] ?: '',
            'capacity' => $capacity,
            'material' => $product['material'] ?: 'Stainless Steel',
            'color' => $product['color'] ?: 'Default',
            'imageUrl' => $product['image_url'] ?: '',
            'image' => $image,
            'images' => [$image],
            'stock' => (int) $product['stock'],
            'rating' => 0,
            'reviewCount' => 0,
            'features' => [],
            'sku' => $product['sku'] ?: 'AMS-' . str_pad((string) $product['id'], 4, '0', STR_PAD_LEFT),
        ];
    }, $query->fetchAll());

    jsonResponse(['products' => $products]);
} catch (Throwable $error) {
    jsonResponse(['error' => 'Database tidak dapat diakses'], 500);
}