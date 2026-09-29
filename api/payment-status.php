<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

function setPaymentStatus(PDO $database, int $paymentId, string $status, ?int $adminId, string $source): array
{
    if (!in_array($status, ['success', 'failed'], true)) {
        jsonResponse(['error' => 'Status pembayaran tidak valid'], 422);
    }

    $database->beginTransaction();
    try {
        $query = $database->prepare(
            'SELECT p.id, p.order_id, p.status AS payment_status, p.payment_method, o.status AS order_status
             FROM payments p JOIN orders o ON o.id = p.order_id WHERE p.id = ? FOR UPDATE'
        );
        $query->execute([$paymentId]);
        $payment = $query->fetch();
        if (!$payment) {
            throw new DomainException('Pembayaran tidak ditemukan');
        }
        if ($payment['payment_status'] === 'success' && $status === 'failed') {
            throw new DomainException('Pembayaran sukses tidak dapat diubah menjadi gagal');
        }
        if ($payment['order_status'] === 'cancelled' && $status === 'success') {
            throw new DomainException('Pesanan dibatalkan; pembayaran tidak dapat disahkan');
        }
        if ($source === 'admin' && $status === 'success' && ($payment['payment_method'] ?? '') === 'cod') {
            throw new DomainException('Pembayaran COD baru dikonfirmasi setelah paket diterima');
        }

        if ($payment['payment_status'] !== $status) {
            $update = $database->prepare('UPDATE payments SET status = ? WHERE id = ?');
            $update->execute([$status, $paymentId]);
        }
        if ($status === 'success' && $payment['order_status'] === 'pending') {
            $order = $database->prepare('UPDATE orders SET status = \'processing\' WHERE id = ?');
            $order->execute([$payment['order_id']]);
        }

        $audit = $database->prepare(
            'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
             VALUES (?, ?, \'payment\', ?, ?, ?)'
        );
        $audit->execute([
            $adminId,
            'confirm_' . $status,
            (string) $paymentId,
            json_encode(['source' => $source, 'order_id' => (int) $payment['order_id']], JSON_UNESCAPED_UNICODE),
            $_SERVER['REMOTE_ADDR'] ?? null,
        ]);

        $database->commit();
        return ['paymentId' => $paymentId, 'status' => $status, 'orderId' => (int) $payment['order_id']];
    } catch (Throwable $error) {
        if ($database->inTransaction()) {
            $database->rollBack();
        }
        throw $error;
    }
}