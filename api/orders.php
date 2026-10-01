<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    jsonResponse(['error' => 'Method tidak diizinkan'], 405);
}

$authenticatedUser = requireApiUser();
$database = database();
$maintenanceStatement = $database->prepare('SELECT setting_value FROM store_settings WHERE setting_key = ?');
$maintenanceStatement->execute(['maintenanceMode']);
$maintenanceMode = json_decode((string) ($maintenanceStatement->fetchColumn() ?: 'false'), true) === true;
if ($maintenanceMode && !in_array($authenticatedUser['role'], ['super_admin', 'staff_gudang'], true)) {
    jsonResponse(['error' => 'Toko sedang dalam perbaikan dan belum dapat menerima pesanan'], 503);
}

$body = jsonBody();
$customer = $body['customer'] ?? [];
$items = $body['items'] ?? [];
$shippingMethod = (string) ($body['shippingMethod'] ?? '');
$paymentMethod = trim((string) ($body['paymentMethod'] ?? ''));
$proofMime = null;
$proofData = null;
$shippingPrices = ['regular' => 25000, 'express' => 45000, 'sameday' => 65000];
$paymentMethods = ['bca', 'mandiri', 'gopay', 'ovo', 'cod'];
$couponRates = ['FLASH99' => 0.30, 'HEMAT10' => 0.10, 'WELCOME' => 0.15, 'FREEONGKIR' => 0.0, 'BUNDLE3' => 0.15];

if (!is_array($customer) || !is_array($items) || count($items) === 0 || count($items) > 50) {
    jsonResponse(['error' => 'Data pesanan tidak valid'], 422);
}
if (!isset($shippingPrices[$shippingMethod]) || !in_array($paymentMethod, $paymentMethods, true)) {
    jsonResponse(['error' => 'Metode pengiriman atau pembayaran tidak valid'], 422);
}
if ($paymentMethod !== 'cod') {
    $proofDataUrl = $body['paymentProof'] ?? null;
    if (!is_string($proofDataUrl) || !preg_match('/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+\/=]+)$/D', $proofDataUrl, $proofMatches)) {
        jsonResponse(['error' => 'Bukti pembayaran wajib berupa gambar JPG, PNG, atau WebP'], 422);
    }
    $proofData = base64_decode($proofMatches[2], true);
    if ($proofData === false || strlen($proofData) > 5 * 1024 * 1024) {
        jsonResponse(['error' => 'Ukuran bukti pembayaran maksimal 5 MB'], 422);
    }
    $imageInfo = getimagesizefromstring($proofData);
    $proofMime = 'image/' . $proofMatches[1];
    if (!is_array($imageInfo) || ($imageInfo['mime'] ?? '') !== $proofMime) {
        jsonResponse(['error' => 'File bukti pembayaran bukan gambar yang valid'], 422);
    }
}

$name = trim((string) ($customer['name'] ?? ''));
$email = strtolower(trim((string) ($customer['email'] ?? '')));
$phone = trim((string) ($customer['phone'] ?? ''));
$address = trim((string) ($customer['address'] ?? ''));
$city = trim((string) ($customer['city'] ?? ''));
$province = trim((string) ($customer['province'] ?? ''));
$postalCode = trim((string) ($customer['zip'] ?? ''));

if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $phone === '' || $address === '' || $city === '') {
    jsonResponse(['error' => 'Nama, email, telepon, alamat, dan kota wajib diisi'], 422);
}

$quantities = [];
$orderLines = [];
foreach ($items as $item) {
    $productId = filter_var($item['productId'] ?? null, FILTER_VALIDATE_INT);
    $quantity = filter_var($item['quantity'] ?? null, FILTER_VALIDATE_INT);
    $color = trim((string) ($item['color'] ?? ''));
    if (!$productId || !$quantity || $quantity < 1 || $quantity > 100 || $color === '') {
        jsonResponse(['error' => 'Produk atau jumlah barang tidak valid'], 422);
    }
    $quantities[$productId] = ($quantities[$productId] ?? 0) + $quantity;
    $orderLines[] = ['productId' => $productId, 'quantity' => $quantity, 'color' => $color];
}

try {
    $database->beginTransaction();
    $placeholders = implode(',', array_fill(0, count($quantities), '?'));
    $statement = $database->prepare("SELECT id, name, price, cogs, stock, capacity, color FROM products WHERE is_active = 1 AND id IN ({$placeholders}) FOR UPDATE");
    $statement->execute(array_keys($quantities));
    $products = [];
    foreach ($statement->fetchAll() as $product) {
        $products[(int) $product['id']] = $product;
    }

    if (count($products) !== count($quantities)) {
        throw new DomainException('Salah satu produk tidak tersedia');
    }

    $subtotal = 0.0;
    foreach ($quantities as $productId => $quantity) {
        $product = $products[$productId];
        if ((int) $product['stock'] < $quantity) {
            throw new DomainException('Stok ' . $product['name'] . ' tidak mencukupi');
        }
        $subtotal += (float) $product['price'] * $quantity;
    }

    $allowedColorsByCapacity = [
        '500ml' => ['Hitam', 'Silver'],
        '750ml' => ['Hitam', 'Silver'],
        '900ml' => ['Hitam', 'Putih', 'Hijau'],
        '710ml' => ['Putih', 'Hitam', 'Pink', 'Biru'],
    ];
    foreach ($orderLines as $line) {
        $product = $products[$line['productId']];
        $capacity = (string) ($product['capacity'] ?? '');
        $allowedColors = $allowedColorsByCapacity[$capacity] ?? [(string) ($product['color'] ?? '')];
        if (!in_array($line['color'], $allowedColors, true)) {
            throw new DomainException('Warna ' . $line['color'] . ' tidak tersedia untuk ' . $product['name']);
        }
    }

    $coupon = strtoupper(trim((string) ($body['couponCode'] ?? '')));
    if ($coupon !== '' && !array_key_exists($coupon, $couponRates)) {
        throw new DomainException('Kode promo tidak valid');
    }
    if ($coupon === 'BUNDLE3' && $subtotal < 500000) {
        throw new DomainException('Kode BUNDLE3 berlaku untuk minimum pembelian Rp500.000');
    }
    $subtotal *= 1 - ($couponRates[$coupon] ?? 0);
    $shippingCost = $shippingPrices[$shippingMethod];
    if ($coupon === 'FREEONGKIR' && $subtotal >= 200000) {
        $shippingCost = 0;
    }
    $total = $subtotal + $shippingCost;
    $shippingAddress = implode(', ', array_filter([$address, $city, $province, $postalCode]));

    $userId = (int) $authenticatedUser['id'];
    $profile = $database->prepare('UPDATE users SET phone = ?, address = ? WHERE id = ?');
    $profile->execute([$phone, $shippingAddress, $userId]);
    $order = $database->prepare(
        'INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, shipping_address, shipping_method, shipping_cost, total_amount, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, \'pending\')'
    );
    $order->execute([$userId, $name, $email, $phone, $shippingAddress, $shippingMethod, $shippingCost, $total]);
    $orderId = (int) $database->lastInsertId();

    $orderItem = $database->prepare('INSERT INTO order_items (order_id, product_id, quantity, price, selected_color) VALUES (?, ?, ?, ?, ?)');
    $stockUpdate = $database->prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?');
    $movement = $database->prepare(
        'INSERT INTO inventory_movements (product_id, user_id, order_id, movement_type, quantity, unit_cost, note)
         VALUES (?, ?, ?, \'sale\', ?, ?, ?)'
    );
    foreach ($orderLines as $line) {
        $productId = $line['productId'];
        $quantity = $line['quantity'];
        $product = $products[$productId];
        $orderItem->execute([$orderId, $productId, $quantity, $product['price'], $line['color']]);
    }
    foreach ($quantities as $productId => $quantity) {
        $product = $products[$productId];
        $stockUpdate->execute([$quantity, $productId, $quantity]);
        if ($stockUpdate->rowCount() !== 1) {
            throw new DomainException('Stok berubah. Silakan coba lagi');
        }
        $movement->execute([$productId, $userId, $orderId, -$quantity, $product['cogs'], 'Pesanan AMS-' . $orderId]);
    }

    $payment = $database->prepare('INSERT INTO payments (order_id, payment_method, amount, status, proof_mime, proof_data) VALUES (?, ?, ?, \'pending\', ?, ?)');
    $payment->execute([$orderId, $paymentMethod, $total, $proofMime, $proofData]);
    $database->commit();

    jsonResponse([
        'orderId' => $orderId,
        'orderNumber' => 'AMS-' . str_pad((string) $orderId, 6, '0', STR_PAD_LEFT),
        'total' => $total,
    ], 201);
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
    jsonResponse(['error' => 'Pesanan tidak dapat disimpan'], 500);
}