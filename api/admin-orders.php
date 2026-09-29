<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
$admin = requireApiAdmin();
$database = database();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function orderStatusLabel(string $status): string
{
    return [
        'pending' => 'Menunggu',
        'processing' => 'Diproses',
        'shipped' => 'Dikirim',
        'completed' => 'Selesai',
        'cancelled' => 'Dibatalkan',
    ][$status] ?? $status;
}

function orderPaymentLabel(?string $method): string
{
    return [
        'bca' => 'Transfer BCA',
        'mandiri' => 'Transfer Mandiri',
        'gopay' => 'GoPay',
        'ovo' => 'OVO',
        'cod' => 'COD',
    ][$method ?? ''] ?? ($method ?? 'Belum ada');
}

function fetchOrder(PDO $database, int $id): array
{
    $statement = $database->prepare(
        "SELECT o.id, o.customer_name, o.customer_email, o.customer_phone, o.shipping_address,
                o.shipping_method, o.tracking_number, o.shipping_cost, o.total_amount, o.status,
                DATE_FORMAT(o.order_date, '%Y-%m-%d %H:%i') AS order_date,
                  p.payment_method, p.status AS payment_status,
                  r.return_status, r.return_type
              FROM orders o
              LEFT JOIN payments p ON p.order_id = o.id
              LEFT JOIN (
                  SELECT order_id,
                      GROUP_CONCAT(DISTINCT status ORDER BY created_at DESC SEPARATOR ',') AS return_status,
                      GROUP_CONCAT(DISTINCT request_type ORDER BY created_at DESC SEPARATOR ',') AS return_type
                  FROM returns GROUP BY order_id
              ) r ON r.order_id = o.id
              WHERE o.id = ? ORDER BY p.id DESC LIMIT 1"
    );
    $statement->execute([$id]);
    $order = $statement->fetch();
    if (!$order) {
        jsonResponse(['error' => 'Pesanan tidak ditemukan'], 404);
    }

    $itemsQuery = $database->prepare(
        'SELECT p.name, COALESCE(NULLIF(oi.selected_color, \'\'), p.color) AS color, oi.quantity AS qty, oi.price
         FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ? ORDER BY oi.id'
    );
    $itemsQuery->execute([$id]);
    $order['items'] = array_map(static fn(array $item): array => [
        'name' => $item['name'],
        'color' => $item['color'],
        'qty' => (int) $item['qty'],
        'price' => (float) $item['price'],
    ], $itemsQuery->fetchAll());
    $order['id'] = 'AMS-' . str_pad((string) $order['id'], 6, '0', STR_PAD_LEFT);
    $order['customer'] = $order['customer_name'];
    $order['email'] = $order['customer_email'];
    $order['phone'] = $order['customer_phone'];
    $order['address'] = $order['shipping_address'];
    $order['total'] = (float) $order['total_amount'];
    $order['courier'] = $order['shipping_method'];
    $order['tracking'] = $order['tracking_number'] ?? '';
    $order['date'] = $order['order_date'];
    $order['payment'] = orderPaymentLabel($order['payment_method'] ?? null);
    $order['paymentStatus'] = $order['payment_status'] ?? 'pending';
    $order['returnStatus'] = $order['return_status'] ?? '';
    $order['returnType'] = $order['return_type'] ?? '';
    unset($order['customer_name'], $order['customer_email'], $order['customer_phone'], $order['shipping_address'], $order['shipping_method'], $order['tracking_number'], $order['shipping_cost'], $order['total_amount'], $order['order_date'], $order['payment_method'], $order['return_status'], $order['return_type']);
    return $order;
}

if ($method === 'GET') {
    try {
        $ids = $database->query('SELECT id FROM orders ORDER BY order_date DESC, id DESC LIMIT 200')->fetchAll(PDO::FETCH_COLUMN);
        jsonResponse(['orders' => array_map(static fn($id): array => fetchOrder($database, (int) $id), $ids)]);
    } catch (Throwable $error) {
        error_log($error->getMessage());
        jsonResponse(['error' => 'Daftar pesanan tidak dapat dimuat'], 500);
    }
}

if ($method !== 'POST') {
    jsonResponse(['error' => 'Method tidak diizinkan'], 405);
}

$body = jsonBody();
$id = filter_var($body['id'] ?? null, FILTER_VALIDATE_INT);
$nextStatus = (string) ($body['status'] ?? '');
if (!$id || !in_array($nextStatus, ['pending', 'processing', 'shipped', 'completed', 'cancelled'], true)) {
    jsonResponse(['error' => 'Data status pesanan tidak valid'], 422);
}

try {
    $database->beginTransaction();
    $query = $database->prepare(
        "SELECT o.status, o.tracking_number, p.payment_method, p.status AS payment_status
         FROM orders o LEFT JOIN payments p ON p.order_id = o.id WHERE o.id = ? ORDER BY p.id DESC LIMIT 1 FOR UPDATE"
    );
    $query->execute([$id]);
    $current = $query->fetch();
    if (!$current) {
        throw new DomainException('Pesanan tidak ditemukan');
    }

    $allowed = [
        'pending' => ['processing', 'cancelled'],
        'processing' => ['shipped', 'cancelled'],
        'shipped' => ['completed'],
        'completed' => [],
        'cancelled' => [],
    ];
    if (!in_array($nextStatus, $allowed[$current['status']] ?? [], true)) {
        throw new DomainException('Perubahan status pesanan tidak diizinkan');
    }
    if ($nextStatus === 'processing' && ($current['payment_method'] ?? '') !== 'cod' && ($current['payment_status'] ?? '') !== 'success') {
        throw new DomainException('Konfirmasi pembayaran terlebih dahulu sebelum memproses pesanan');
    }
    if ($nextStatus === 'cancelled' && ($current['payment_status'] ?? '') === 'success') {
        throw new DomainException('Pembayaran sudah diterima. Proses refund sebelum membatalkan pesanan');
    }

    $update = $database->prepare('UPDATE orders SET status = ? WHERE id = ?');
    $update->execute([$nextStatus, $id]);

    if ($nextStatus === 'cancelled') {
        $items = $database->prepare('SELECT product_id, quantity, price FROM order_items WHERE order_id = ?');
        $items->execute([$id]);
        $restore = $database->prepare('UPDATE products SET stock = stock + ? WHERE id = ?');
        $movement = $database->prepare(
            'INSERT INTO inventory_movements (product_id, user_id, order_id, movement_type, quantity, unit_cost, note)
             VALUES (?, ?, ?, \'return\', ?, ?, \'Stok dipulihkan karena pesanan dibatalkan\')'
        );
        foreach ($items->fetchAll() as $item) {
            $restore->execute([$item['quantity'], $item['product_id']]);
            $movement->execute([$item['product_id'], $admin['id'], $id, $item['quantity'], $item['price']]);
        }
    }

    $audit = $database->prepare('INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES (?, ?, \'order\', ?, ?, ?)');
    $audit->execute([$admin['id'], 'status_' . $nextStatus, (string) $id, json_encode(['from' => $current['status']], JSON_UNESCAPED_UNICODE), $_SERVER['REMOTE_ADDR'] ?? null]);
    $database->commit();
    jsonResponse(['order' => fetchOrder($database, (int) $id)]);
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
    jsonResponse(['error' => 'Status pesanan tidak dapat disimpan'], 500);
}