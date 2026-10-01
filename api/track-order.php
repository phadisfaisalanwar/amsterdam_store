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
    "SELECT o.id, o.status AS order_status, o.shipping_address, o.shipping_method, p.payment_method,
            s.courier, s.tracking_number, s.status AS shipment_status,
            s.shipped_at, s.delivered_at
    FROM orders o LEFT JOIN shipments s ON s.order_id = o.id
    LEFT JOIN payments p ON p.order_id = o.id
    WHERE (o.id = :order_id OR o.tracking_number = :order_tracking OR s.tracking_number = :shipment_tracking)
    ORDER BY p.id DESC LIMIT 1"
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

$status = $order['shipment_status'] ?? match ($order['order_status']) {
    'processing' => 'processing',
    'completed' => 'review',
    default => $order['order_status'],
};
$statusLabels = [
    'pending' => 'Menunggu pembayaran',
    'processing' => 'Diproses',
    'preparing' => 'Dikemas',
    'shipped' => 'Dikirim',
    'delivered' => 'Diterima',
    'review' => 'Perlu ditinjau',
];
$steps = [
    ['status' => 'Menunggu pembayaran', 'desc' => 'Pembayaran sedang menunggu konfirmasi'],
    ['status' => 'Diproses', 'desc' => 'Pembayaran dikonfirmasi dan pesanan diproses'],
    ['status' => 'Dikemas', 'desc' => 'Pesanan disiapkan untuk dikirim'],
    ['status' => 'Dikirim', 'desc' => 'Paket sudah diserahkan kepada kurir'],
    ['status' => 'Diterima', 'desc' => 'Paket berhasil diterima'],
];
$currentIndex = match ($status) {
    'processing' => 1,
    'preparing' => 2,
    'shipped' => 3,
    'delivered' => 4,
    'review' => 1,
    default => 0,
};
$timeline = array_map(static function (array $step, int $index) use ($currentIndex, $order, $status): array {
    $done = $index < $currentIndex;
    $current = $index === $currentIndex && $status !== 'review';
    $time = $done && $index === 3 && $order['shipped_at'] ? $order['shipped_at'] : ($done && $index === 4 && $order['delivered_at'] ? $order['delivered_at'] : ($done ? 'Sudah diperbarui' : 'Menunggu'));
    return ['status' => $step['status'], 'desc' => $step['desc'], 'time' => $time, 'done' => $done, 'current' => $current];
}, $steps, array_keys($steps));

$orderReference = 'AMS-' . str_pad((string) $order['id'], 6, '0', STR_PAD_LEFT);
$courier = trim((string) ($order['courier'] ?? ''));
$tracking = trim((string) ($order['tracking_number'] ?? ''));
$destination = trim((string) ($order['shipping_address'] ?? ''));
$isCod = ($order['payment_method'] ?? '') === 'cod';
$courier = $courier !== '' ? $courier : ($isCod ? 'Kurir toko (COD)' : 'Kurir ditentukan saat paket dikirim');
$tracking = $tracking !== '' ? $tracking : ($isCod ? 'AMS-COD-' . str_pad((string) $order['id'], 6, '0', STR_PAD_LEFT) : 'Belum tersedia');
$estimatedArrival = in_array($status, ['delivered', 'completed'], true)
    ? 'Sudah tiba'
    : match ($status) {
        'pending' => 'Menunggu konfirmasi pembayaran',
        'shipped' => 'Menunggu pembaruan kurir',
        'review' => 'Pesanan perlu ditinjau admin',
        default => 'Estimasi tersedia setelah paket dikirim',
    };

jsonResponse([
    'id' => $orderReference,
    'status' => $status,
    'statusLabel' => $statusLabels[$status] ?? 'Perlu ditinjau',
    'courier' => $courier,
    'tracking' => $tracking,
    'destination' => $destination !== '' ? $destination : 'Alamat tujuan belum tersedia',
    'estimasi' => $estimatedArrival,
    'timeline' => $timeline,
]);
