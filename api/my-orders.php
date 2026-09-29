<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

$user = requireApiUser();
$database = database();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    try {
        $ordersQuery = $database->prepare(
            "SELECT o.id, o.total_amount, o.status, o.tracking_number,
                    DATE_FORMAT(o.order_date, '%Y-%m-%d %H:%i') AS date,
                    s.courier, s.status AS shipment_status, s.customer_confirmed_at
             FROM orders o
             LEFT JOIN shipments s ON s.order_id = o.id
             WHERE o.user_id = ?
             ORDER BY o.order_date DESC, o.id DESC
             LIMIT 100"
        );
        $ordersQuery->execute([(int) $user['id']]);
        $orders = $ordersQuery->fetchAll();
        $itemsQuery = $database->prepare(
            'SELECT oi.order_id, oi.product_id, p.name, COALESCE(NULLIF(oi.selected_color, \'\'), p.color) AS color, oi.quantity, oi.price
             FROM order_items oi JOIN products p ON p.id = oi.product_id
             WHERE oi.order_id = ? ORDER BY oi.id'
        );

        foreach ($orders as &$order) {
            $itemsQuery->execute([(int) $order['id']]);
            $order['items'] = array_map(static fn(array $item): array => [
                'productId' => (int) $item['product_id'],
                'name' => $item['name'],
                'color' => $item['color'] ?? '',
                'quantity' => (int) $item['quantity'],
                'price' => (float) $item['price'],
            ], $itemsQuery->fetchAll());
            $order['orderId'] = 'AMS-' . str_pad((string) $order['id'], 6, '0', STR_PAD_LEFT);
            $order['total'] = (float) $order['total_amount'];
            $order['tracking'] = $order['tracking_number'] ?? '';
            $order['courier'] = $order['courier'] ?? '';
            $order['customerConfirmed'] = $order['customer_confirmed_at'] !== null;
            unset($order['id'], $order['total_amount'], $order['tracking_number'], $order['shipment_status'], $order['customer_confirmed_at']);
        }
        unset($order);

        jsonResponse(['orders' => $orders]);
    } catch (Throwable $error) {
        error_log($error->getMessage());
        jsonResponse(['error' => 'Riwayat pesanan tidak dapat dimuat'], 500);
    }
}

if ($method !== 'POST') {
    jsonResponse(['error' => 'Method tidak diizinkan'], 405);
}

$body = jsonBody();
$orderId = filter_var($body['orderId'] ?? null, FILTER_VALIDATE_INT);
if (!$orderId) {
    jsonResponse(['error' => 'Nomor pesanan tidak valid'], 422);
}

try {
    $database->beginTransaction();
    $query = $database->prepare(
        'SELECT o.status AS order_status, s.status AS shipment_status, s.customer_confirmed_at
         FROM orders o LEFT JOIN shipments s ON s.order_id = o.id
         WHERE o.id = ? AND o.user_id = ? FOR UPDATE'
    );
    $query->execute([(int) $orderId, (int) $user['id']]);
    $order = $query->fetch();
    if (!$order) {
        throw new DomainException('Pesanan tidak ditemukan');
    }
    if ($order['order_status'] !== 'shipped' || $order['shipment_status'] !== 'shipped') {
        throw new DomainException('Pesanan belum berstatus sedang dikirim');
    }

    if ($order['customer_confirmed_at'] === null) {
        $database->prepare('UPDATE shipments SET customer_confirmed_at = CURRENT_TIMESTAMP WHERE order_id = ?')->execute([$orderId]);
        $audit = $database->prepare(
            'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
             VALUES (?, \'customer_confirmed_delivery\', \'shipment\', ?, ?, ?)'
        );
        $audit->execute([
            $user['id'],
            (string) $orderId,
            json_encode(['order_id' => (int) $orderId], JSON_UNESCAPED_UNICODE),
            $_SERVER['REMOTE_ADDR'] ?? null,
        ]);
    }

    $database->commit();
    jsonResponse(['ok' => true, 'customerConfirmed' => true]);
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
    jsonResponse(['error' => 'Konfirmasi penerimaan tidak dapat disimpan'], 500);
}