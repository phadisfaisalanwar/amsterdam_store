<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
$user = requireApiUser();
$database = database();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $query = $database->prepare(
        "SELECT r.id, r.order_id, r.request_type, r.reason, r.status, r.quantity,
                p.name AS product, DATE_FORMAT(r.created_at, '%Y-%m-%d') AS date
         FROM returns r
         LEFT JOIN products p ON p.id = r.product_id
         WHERE r.user_id = ? ORDER BY r.created_at DESC"
    );
    $query->execute([(int) $user['id']]);
    $requests = array_map(static function (array $request): array {
        return [
            'id' => 'RET-' . str_pad((string) $request['id'], 6, '0', STR_PAD_LEFT),
            'orderId' => 'AMS-' . str_pad((string) $request['order_id'], 6, '0', STR_PAD_LEFT),
            'type' => $request['request_type'],
            'product' => $request['product'] ?? 'Semua produk',
            'quantity' => (int) $request['quantity'],
            'reason' => $request['reason'],
            'status' => $request['status'],
            'date' => $request['date'],
        ];
    }, $query->fetchAll());
    jsonResponse(['returns' => $requests]);
}

if ($method !== 'POST') {
    jsonResponse(['error' => 'Method tidak diizinkan'], 405);
}

$body = jsonBody();
$orderId = filter_var($body['orderId'] ?? null, FILTER_VALIDATE_INT);
$productId = filter_var($body['productId'] ?? null, FILTER_VALIDATE_INT);
$quantity = filter_var($body['quantity'] ?? 1, FILTER_VALIDATE_INT);
$type = (string) ($body['type'] ?? '');
$reason = trim((string) ($body['reason'] ?? ''));
$proofData = null;
$proofMime = null;
$proofDataUrl = $body['proof'] ?? null;

if (!is_string($proofDataUrl) || !preg_match('/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+\/=]+)$/D', $proofDataUrl, $proofMatches)) {
    jsonResponse(['error' => 'Bukti gambar wajib berupa JPG, PNG, atau WebP'], 422);
}
$proofData = base64_decode($proofMatches[2], true);
$proofMime = 'image/' . $proofMatches[1];
if ($proofData === false || strlen($proofData) > 5 * 1024 * 1024 || !is_array(getimagesizefromstring($proofData))) {
    jsonResponse(['error' => 'Bukti gambar tidak valid atau berukuran lebih dari 5 MB'], 422);
}

if (!$orderId || !$productId || !$quantity || $quantity < 1 || !in_array($type, ['refund', 'exchange'], true) || $reason === '' || strlen($reason) > 1000) {
    jsonResponse(['error' => 'Data pengembalian atau penukaran tidak valid'], 422);
}

try {
    $database->beginTransaction();
    $orderQuery = $database->prepare(
        "SELECT o.id, o.status, s.status AS shipment_status
         FROM orders o LEFT JOIN shipments s ON s.order_id = o.id
         WHERE o.id = ? AND o.user_id = ? FOR UPDATE"
    );
    $orderQuery->execute([$orderId, $user['id']]);
    $order = $orderQuery->fetch();
    if (!$order) {
        throw new DomainException('Pesanan tidak ditemukan atau bukan milik akun ini');
    }
    if (!in_array($order['status'], ['shipped', 'completed'], true) && !in_array($order['shipment_status'], ['shipped', 'delivered'], true)) {
        throw new DomainException('Pengajuan hanya tersedia setelah pesanan dikirim');
    }

    $itemQuery = $database->prepare('SELECT quantity FROM order_items WHERE order_id = ? AND product_id = ?');
    $itemQuery->execute([$orderId, $productId]);
    $item = $itemQuery->fetch();
    if (!$item || $quantity > (int) $item['quantity']) {
        throw new DomainException('Produk atau jumlah barang tidak sesuai dengan pesanan');
    }

    $duplicateQuery = $database->prepare("SELECT id FROM returns WHERE order_id = ? AND product_id = ? AND status IN ('pending', 'approved')");
    $duplicateQuery->execute([$orderId, $productId]);
    if ($duplicateQuery->fetch()) {
        throw new DomainException('Permintaan untuk produk ini masih sedang diproses');
    }

    $insert = $database->prepare('INSERT INTO returns (order_id, user_id, request_type, product_id, quantity, reason, proof_mime, proof_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    $insert->execute([$orderId, $user['id'], $type, $productId, $quantity, $reason, $proofMime, $proofData]);
    $returnId = (int) $database->lastInsertId();
    $database->commit();
    jsonResponse(['id' => 'RET-' . str_pad((string) $returnId, 6, '0', STR_PAD_LEFT), 'status' => 'pending'], 201);
} catch (DomainException $error) {
    if ($database->inTransaction()) $database->rollBack();
    jsonResponse(['error' => $error->getMessage()], 409);
} catch (Throwable $error) {
    if ($database->inTransaction()) $database->rollBack();
    error_log($error->getMessage());
    jsonResponse(['error' => 'Permintaan pengembalian tidak dapat disimpan'], 500);
}
