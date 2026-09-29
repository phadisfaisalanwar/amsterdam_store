<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/payment-status.php';
requireApiAdmin();
$database = database();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    try {
        $payments = $database->query(
            "SELECT p.id, p.order_id, COALESCE(NULLIF(o.customer_name, ''), u.name, 'Pelanggan') AS customer,
                    COALESCE(p.payment_method, 'Lainnya') AS method, p.amount, p.status,
                    p.proof_mime IS NOT NULL AS has_proof,
                    DATE_FORMAT(p.payment_date, '%Y-%m-%d %H:%i') AS date
             FROM payments p JOIN orders o ON o.id = p.order_id
             LEFT JOIN users u ON u.id = o.user_id
             ORDER BY p.payment_date DESC, p.id DESC"
        )->fetchAll();
        foreach ($payments as &$payment) {
            $payment['id'] = (int) $payment['id'];
            $payment['orderId'] = 'AMS-' . str_pad((string) $payment['order_id'], 6, '0', STR_PAD_LEFT);
            unset($payment['order_id']);
            $payment['amount'] = (float) $payment['amount'];
            $payment['proofAvailable'] = (bool) $payment['has_proof'];
            unset($payment['has_proof']);
        }
        unset($payment);
        jsonResponse(['payments' => $payments]);
    } catch (Throwable $error) {
        error_log($error->getMessage());
        jsonResponse(['error' => 'Daftar pembayaran tidak dapat dimuat'], 500);
    }
}

if ($method !== 'POST') {
    jsonResponse(['error' => 'Method tidak diizinkan'], 405);
}

$body = jsonBody();
$paymentId = filter_var($body['paymentId'] ?? null, FILTER_VALIDATE_INT);
$status = (string) ($body['status'] ?? '');
if (!$paymentId) {
    jsonResponse(['error' => 'ID pembayaran tidak valid'], 422);
}

try {
    jsonResponse(setPaymentStatus($database, $paymentId, $status, (int) requireApiUser()['id'], 'admin'));
} catch (DomainException $error) {
    jsonResponse(['error' => $error->getMessage()], 409);
} catch (Throwable $error) {
    error_log($error->getMessage());
    jsonResponse(['error' => 'Status pembayaran tidak dapat disimpan'], 500);
}