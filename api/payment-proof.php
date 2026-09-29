<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
requireApiAdmin();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    jsonResponse(['error' => 'Method tidak diizinkan'], 405);
}

$paymentId = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
if (!$paymentId) {
    jsonResponse(['error' => 'ID pembayaran tidak valid'], 422);
}

$statement = database()->prepare('SELECT proof_mime, proof_data FROM payments WHERE id = ?');
$statement->execute([$paymentId]);
$proof = $statement->fetch();
if (!$proof || !$proof['proof_mime'] || !$proof['proof_data']) {
    jsonResponse(['error' => 'Bukti pembayaran tidak ditemukan'], 404);
}

header('Content-Type: ' . $proof['proof_mime']);
header('Content-Length: ' . strlen($proof['proof_data']));
header('Cache-Control: private, no-store');
header('X-Content-Type-Options: nosniff');
echo $proof['proof_data'];