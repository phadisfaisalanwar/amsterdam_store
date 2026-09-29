<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
$admin = requireApiAdmin();
$database = database();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    try {
        $returns = $database->query(
            "SELECT r.id, r.order_id, COALESCE(NULLIF(o.customer_name, ''), u.name, 'Pelanggan') AS customer,
                COALESCE(p.name, (SELECT GROUP_CONCAT(p2.name ORDER BY p2.name SEPARATOR ', ')
                         FROM order_items oi2 JOIN products p2 ON p2.id = oi2.product_id
                         WHERE oi2.order_id = r.order_id), '—') AS products,
                    r.reason, r.status, r.request_type, r.proof_mime, r.proof_data,
                    r.product_id, r.quantity, o.total_amount AS amount,
                DATE_FORMAT(r.created_at, '%Y-%m-%d') AS date
             FROM returns r
             LEFT JOIN orders o ON o.id = r.order_id
             LEFT JOIN users u ON u.id = o.user_id
             LEFT JOIN products p ON p.id = r.product_id
             ORDER BY r.created_at DESC"
        )->fetchAll();
        foreach ($returns as &$item) {
            $item['id'] = 'RET-' . str_pad((string) $item['id'], 6, '0', STR_PAD_LEFT);
            $item['orderId'] = $item['order_id'] ? 'AMS-' . str_pad((string) $item['order_id'], 6, '0', STR_PAD_LEFT) : '—';
            $item['product'] = $item['products'] ?: '—';
            $item['amount'] = (float) ($item['amount'] ?? 0);
            $item['type'] = $item['request_type'] === 'exchange' ? 'Penukaran' : 'Refund';
            $item['proof'] = $item['proof_data'] !== null
                ? 'data:' . $item['proof_mime'] . ';base64,' . base64_encode($item['proof_data'])
                : null;
            $item['productId'] = $item['product_id'] ? (int) $item['product_id'] : null;
            $item['quantity'] = (int) $item['quantity'];
            unset($item['order_id'], $item['products'], $item['request_type'], $item['proof_mime'], $item['proof_data'], $item['product_id']);
        }
        unset($item);
        jsonResponse(['returns' => $returns]);
    } catch (Throwable $error) {
        error_log($error->getMessage());
        jsonResponse(['error' => 'Pengembalian tidak dapat dimuat'], 500);
    }
}

if ($method !== 'POST') {
    jsonResponse(['error' => 'Method tidak diizinkan'], 405);
}

$body = jsonBody();
$id = filter_var($body['id'] ?? null, FILTER_VALIDATE_INT);
$status = (string) ($body['status'] ?? '');
$allowed = [
    'pending' => ['approved', 'rejected'],
    'approved' => ['completed'],
    'rejected' => [],
    'completed' => [],
];
if (!$id || !in_array($status, ['approved', 'rejected', 'completed'], true)) {
    jsonResponse(['error' => 'Status pengembalian tidak valid'], 422);
}

try {
    $database->beginTransaction();
    $query = $database->prepare('SELECT status, order_id, product_id, quantity, request_type FROM returns WHERE id = ? FOR UPDATE');
    $query->execute([$id]);
    $current = $query->fetch();
    if (!$current) {
        throw new DomainException('Pengembalian tidak ditemukan');
    }
    if (!in_array($status, $allowed[$current['status']] ?? [], true)) {
        throw new DomainException('Perubahan status pengembalian tidak diizinkan');
    }
    $database->prepare('UPDATE returns SET status = ? WHERE id = ?')->execute([$status, $id]);
    if ($status === 'completed' && $current['product_id'] !== null) {
        $restore = $database->prepare('UPDATE products SET stock = stock + ? WHERE id = ?');
        $restore->execute([(int) $current['quantity'], (int) $current['product_id']]);
        $product = $database->prepare('SELECT cogs FROM products WHERE id = ?');
        $product->execute([(int) $current['product_id']]);
        $unitCost = (float) ($product->fetchColumn() ?: 0);
        $movement = $database->prepare(
            'INSERT INTO inventory_movements (product_id, user_id, order_id, movement_type, quantity, unit_cost, note)
             VALUES (?, ?, ?, \'return\', ?, ?, ?)'
        );
        $movement->execute([(int) $current['product_id'], $admin['id'], (int) $current['order_id'], (int) $current['quantity'], $unitCost, 'Stok bertambah dari pengembalian/refund']);
    }
    $audit = $database->prepare('INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES (?, ?, \'return\', ?, ?, ?)');
    $audit->execute([$admin['id'], $status, (string) $id, json_encode(['from' => $current['status']], JSON_UNESCAPED_UNICODE), $_SERVER['REMOTE_ADDR'] ?? null]);
    $database->commit();
    jsonResponse(['id' => $id, 'status' => $status]);
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
    jsonResponse(['error' => 'Status pengembalian tidak dapat disimpan'], 500);
}