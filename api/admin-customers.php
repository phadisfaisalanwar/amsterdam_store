<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
requireApiAdmin();

try {
    $customers = database()->query(
        "SELECT u.id, u.name, u.email, COALESCE(u.phone, '') AS phone, u.address,
                DATE_FORMAT(u.created_at, '%Y-%m-%d') AS joined,
                (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id AND o.status <> 'cancelled') AS orders,
                (SELECT COALESCE(SUM(p.amount), 0) FROM payments p JOIN orders o ON o.id = p.order_id
                 WHERE o.user_id = u.id AND p.status = 'success') AS total_spent,
                (SELECT DATE_FORMAT(MAX(o.order_date), '%Y-%m-%d') FROM orders o WHERE o.user_id = u.id AND o.status <> 'cancelled') AS last_order,
                (SELECT SUBSTRING_INDEX(SUBSTRING_INDEX(o.shipping_address, ', ', -3), ', ', 1)
                 FROM orders o WHERE o.user_id = u.id AND o.status <> 'cancelled' ORDER BY o.order_date DESC LIMIT 1) AS city
         FROM users u WHERE u.role = 'customer' ORDER BY u.created_at DESC"
    )->fetchAll();

    foreach ($customers as &$customer) {
        $customer['id'] = (int) $customer['id'];
        $customer['orders'] = (int) $customer['orders'];
        $customer['totalSpent'] = (float) $customer['total_spent'];
        $customer['city'] = $customer['city'] ?: 'Belum tercatat';
        $customer['status'] = $customer['orders'] > 0 ? 'Aktif' : 'Pelanggan Baru';
        unset($customer['total_spent']);
    }
    unset($customer);

    jsonResponse(['customers' => $customers]);
} catch (Throwable $error) {
    error_log($error->getMessage());
    jsonResponse(['error' => 'Data pelanggan tidak dapat dimuat'], 500);
}