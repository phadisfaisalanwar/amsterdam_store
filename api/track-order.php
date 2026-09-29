<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    jsonResponse(['error' => 'Method tidak diizinkan'], 405);
}

$body = jsonBody();
$identifier = strtoupper(trim((string) ($body['identifier'] ?? '')));
if ($identifier === '') {
    jsonResponse(['error' => 'Masukkan nomor pesanan atau nomor resi'], 422);
}

$orderId = null;
if (preg_match('/^AMS-?(\d+)$/', $identifier, $matches)) {
    $orderId = (int) $matches[1];
}

$database = database();
$query = $database->prepare(
    "SELECT o.id, o.status AS order_status, o.shipping_address, o.shipping_method,
            s.courier, s.tracking_number, s.status AS shipment_status,
            s.shipped_at, s.delivered_at
     FROM orders o LEFT JOIN shipments s ON s.order_id = o.id
    WHERE (o.id = :order_id OR o.tracking_number = :order_tracking OR s.tracking_number = :shipment_tracking)
     LIMIT 1"
);
$query->execute([
    'order_id' => $orderId,
    'order_tracking' => $identifier,
    'shipment_tracking' => $identifier,
]);
$order = $query->fetch();
if (!$order) {
    jsonResponse(['error' => 'Nomor pesanan atau resi tidak ditemukan'], 404);
}

$status = $order['shipment_status'] ?? $order['order_status'];
$steps = [
    ['key' => 'confirmed', 'status' => 'Pesanan Dikonfirmasi', 'desc' => 'Pesanan Anda telah dikonfirmasi dan sedang diproses'],
    ['key' => 'processing', 'status' => 'Sedang Diproses', 'desc' => 'Produk sedang dikemas di gudang kami'],
    ['key' => 'shipped', 'status' => 'Sedang Dikirim', 'desc' => 'Paket telah diserahkan kepada kurir'],
    ['key' => 'transit', 'status' => 'Dalam Perjalanan', 'desc' => 'Paket dalam perjalanan menuju kota tujuan'],
    ['key' => 'delivered', 'status' => 'Diterima', 'desc' => 'Paket berhasil diterima'],
];
$progress = match ($status) {
    'pending' => 0,
    'preparing', 'processing' => 1,
    'shipped' => 3,
    'delivered', 'completed' => 5,
    default => 0,
};
$timeline = array_map(static function (array $step, int $index) use ($progress, $order): array {
    $done = $index < $progress;
    $time = $done && $index === 2 && $order['shipped_at'] ? $order['shipped_at'] : ($done && $index === 4 && $order['delivered_at'] ? $order['delivered_at'] : ($done ? 'Sudah diperbarui' : 'Menunggu'));
    return ['status' => $step['status'], 'desc' => $step['desc'], 'time' => $time, 'done' => $done];
}, $steps, array_keys($steps));

jsonResponse([
    'id' => 'AMS-' . str_pad((string) $order['id'], 6, '0', STR_PAD_LEFT),
    'status' => $status,
    'courier' => $order['courier'] ?? 'Menunggu kurir',
    'tracking' => $order['tracking_number'] ?? '',
    'destination' => $order['shipping_address'],
    'estimasi' => $status === 'delivered' || $status === 'completed' ? 'Sudah tiba' : 'Menunggu pembaruan kurir',
    'timeline' => $timeline,
]);
