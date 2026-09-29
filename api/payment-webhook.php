<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/payment-status.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    jsonResponse(['error' => 'Method tidak diizinkan'], 405);
}

$secret = getenv('PAYMENT_WEBHOOK_SECRET') ?: '';
$signature = $_SERVER['HTTP_X_PAYMENT_SIGNATURE'] ?? '';
$rawBody = file_get_contents('php://input') ?: '';
if ($secret === '' || $signature === '' || !hash_equals(hash_hmac('sha256', $rawBody, $secret), $signature)) {
    jsonResponse(['error' => 'Tanda tangan sistem tidak valid'], 401);
}

$body = json_decode($rawBody, true);
$paymentId = filter_var($body['paymentId'] ?? null, FILTER_VALIDATE_INT);
if (!$paymentId) {
    jsonResponse(['error' => 'ID pembayaran tidak valid'], 422);
}

try {
    jsonResponse(setPaymentStatus(database(), $paymentId, (string) ($body['status'] ?? ''), null, 'webhook'));
} catch (DomainException $error) {
    jsonResponse(['error' => $error->getMessage()], 409);
} catch (Throwable $error) {
    error_log($error->getMessage());
    jsonResponse(['error' => 'Status pembayaran tidak dapat diproses'], 500);
}