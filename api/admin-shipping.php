<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
$admin = requireApiAdmin();
$database = database();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    try {
        $shipments = $database->query(
                "SELECT o.id AS order_id, o.customer_name AS customer, o.shipping_address AS destination,
                    o.shipping_cost, o.shipping_method, o.status AS order_status, p.payment_method, p.status AS payment_status,
                    s.courier, s.tracking_number,
                    s.status AS shipment_status, DATE_FORMAT(s.shipped_at, '%Y-%m-%d') AS shipped_date,
                    DATE_FORMAT(s.customer_confirmed_at, '%Y-%m-%d %H:%i') AS customer_confirmed_at
                 FROM orders o LEFT JOIN payments p ON p.order_id = o.id LEFT JOIN shipments s ON s.order_id = o.id
             WHERE o.status IN ('processing', 'shipped', 'completed')
             ORDER BY o.order_date DESC LIMIT 200"
        )->fetchAll();

        foreach ($shipments as &$shipment) {
            $shipment['orderId'] = 'AMS-' . str_pad((string) $shipment['order_id'], 6, '0', STR_PAD_LEFT);
            $shipment['cost'] = (float) $shipment['shipping_cost'];
            $shipment['shippingMethod'] = $shipment['shipping_method'];
            $shipment['canReopen'] = $shipment['order_status'] === 'completed' && $shipment['shipment_status'] === null;
            $shipment['status'] = $shipment['shipment_status'] ?? match ($shipment['order_status']) {
                'processing' => 'preparing',
                'shipped' => 'shipped',
                'completed' => 'review',
                default => 'review',
            };
            $shipment['courier'] = $shipment['courier'] ?? '';
            $shipment['tracking'] = $shipment['tracking_number'] ?? '';
            $shipment['isCod'] = ($shipment['payment_method'] ?? '') === 'cod';
            $shipment['paymentStatus'] = $shipment['payment_status'] ?? 'pending';
            $shipment['customerConfirmedAt'] = $shipment['customer_confirmed_at'];
            unset($shipment['shipping_cost'], $shipment['shipping_method'], $shipment['shipment_status'], $shipment['tracking_number'], $shipment['payment_method'], $shipment['payment_status'], $shipment['customer_confirmed_at']);
        }
        unset($shipment);
        jsonResponse(['shipments' => $shipments]);
    } catch (Throwable $error) {
        error_log($error->getMessage());
        jsonResponse(['error' => 'Daftar pengiriman tidak dapat dimuat'], 500);
    }
}

if ($method !== 'POST') {
    jsonResponse(['error' => 'Method tidak diizinkan'], 405);
}

$body = jsonBody();
$orderId = filter_var($body['orderId'] ?? null, FILTER_VALIDATE_INT);
$status = (string) ($body['status'] ?? '');
$courier = trim((string) ($body['courier'] ?? ''));
$tracking = trim((string) ($body['tracking'] ?? ''));
if (!$orderId || !in_array($status, ['shipped', 'delivered', 'reopen'], true)) {
    jsonResponse(['error' => 'Data pengiriman tidak valid'], 422);
}
try {
    $database->beginTransaction();
    $query = $database->prepare(
        'SELECT o.status, o.shipping_cost, o.shipping_method, p.id AS payment_id, p.payment_method, p.status AS payment_status, s.status AS shipment_status
         FROM orders o LEFT JOIN payments p ON p.order_id = o.id LEFT JOIN shipments s ON s.order_id = o.id
         WHERE o.id = ? ORDER BY p.id DESC LIMIT 1 FOR UPDATE'
    );
    $query->execute([$orderId]);
    $order = $query->fetch();
    if (!$order) {
        throw new DomainException('Pesanan tidak ditemukan');
    }

    if ($status === 'shipped') {
        if (!in_array($order['status'], ['processing', 'shipped'], true)) {
            throw new DomainException('Pesanan harus diproses sebelum dikirim');
        }
        if (($order['payment_method'] ?? '') !== 'cod' && ($order['payment_status'] ?? '') !== 'success') {
            throw new DomainException('Konfirmasi pembayaran terlebih dahulu');
        }

        if (($order['payment_method'] ?? '') === 'cod') {
            $courier = 'Kurir toko (COD)';
            $tracking = 'AMS-COD-' . str_pad((string) $orderId, 6, '0', STR_PAD_LEFT);
        } else {
            if ($courier === '' || $tracking === '') {
                throw new DomainException('Kurir dan nomor resi wajib diisi sebelum menandai pesanan dikirim');
            }
        }
        $upsert = $database->prepare(
            "INSERT INTO shipments (order_id, courier, tracking_number, status, shipping_cost, shipped_at)
             VALUES (?, ?, ?, 'shipped', ?, CURRENT_TIMESTAMP)
             ON DUPLICATE KEY UPDATE courier = VALUES(courier), tracking_number = VALUES(tracking_number),
                 status = 'shipped', shipped_at = COALESCE(shipped_at, CURRENT_TIMESTAMP)"
        );
        $upsert->execute([$orderId, $courier, $tracking, $order['shipping_cost']]);
        $updateOrder = $database->prepare("UPDATE orders SET status = 'shipped', tracking_number = ? WHERE id = ?");
        $updateOrder->execute([$tracking, $orderId]);
    } elseif ($status === 'reopen') {
        if ($order['status'] !== 'completed' || $order['shipment_status'] !== null) {
            throw new DomainException('Hanya pesanan selesai tanpa data pengiriman yang dapat dibuka kembali');
        }
        $database->prepare("UPDATE orders SET status = 'processing' WHERE id = ?")->execute([$orderId]);
    } else {
        if ($order['status'] !== 'shipped' || $order['shipment_status'] !== 'shipped') {
            throw new DomainException('Pesanan harus sudah dikirim untuk ditandai diterima');
        }
        $database->prepare("UPDATE shipments SET status = 'delivered', delivered_at = CURRENT_TIMESTAMP WHERE order_id = ?")->execute([$orderId]);
        $database->prepare("UPDATE orders SET status = 'completed' WHERE id = ?")->execute([$orderId]);

        if (($order['payment_method'] ?? '') === 'cod' && ($order['payment_status'] ?? '') === 'pending') {
            $database->prepare("UPDATE payments SET status = 'success', payment_date = CURRENT_TIMESTAMP WHERE id = ?")->execute([$order['payment_id']]);
            $paymentAudit = $database->prepare('INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES (?, \'confirm_cod_delivery\', \'payment\', ?, ?, ?)');
            $paymentAudit->execute([$admin['id'], (string) $order['payment_id'], json_encode(['order_id' => $orderId, 'source' => 'delivery_received'], JSON_UNESCAPED_UNICODE), $_SERVER['REMOTE_ADDR'] ?? null]);
        }
    }

    $audit = $database->prepare('INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES (?, ?, \'shipment\', ?, ?, ?)');
    $audit->execute([$admin['id'], $status, (string) $orderId, json_encode(['courier' => $courier, 'tracking' => $tracking], JSON_UNESCAPED_UNICODE), $_SERVER['REMOTE_ADDR'] ?? null]);
    $database->commit();
    jsonResponse([
        'ok' => true,
        'status' => $status,
        'courier' => $courier,
        'tracking' => $tracking,
        'paymentStatus' => $status === 'delivered' && ($order['payment_method'] ?? '') === 'cod' ? 'success' : ($order['payment_status'] ?? 'pending'),
    ]);
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
    jsonResponse(['error' => 'Data pengiriman tidak dapat disimpan'], 500);
}