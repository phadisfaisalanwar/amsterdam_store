<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET' || ($_GET['action'] ?? '') !== 'dashboard') {
    jsonResponse(['error' => 'Permintaan tidak valid'], 404);
}

requireApiAdmin();

try {
    $database = database();
    $stats = [
        'revenueThisMonth' => (float) $database->query("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'success' AND payment_date >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')")->fetchColumn(),
        'ordersToday' => (int) $database->query('SELECT COUNT(*) FROM orders WHERE DATE(order_date) = CURRENT_DATE AND status <> \'cancelled\'')->fetchColumn(),
        'newCustomersThisMonth' => (int) $database->query("SELECT COUNT(*) FROM users WHERE role = 'customer' AND created_at >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')")->fetchColumn(),
        'lowStockProducts' => (int) $database->query('SELECT COUNT(*) FROM products WHERE stock <= 10')->fetchColumn(),
    ];

    $recentOrders = $database->query(
        "SELECT o.id, COALESCE(NULLIF(o.customer_name, ''), u.name, 'Pelanggan') AS customer,
                GROUP_CONCAT(CONCAT(p.name, ' x', oi.quantity) ORDER BY p.name SEPARATOR ', ') AS products,
                o.total_amount AS total, o.status, DATE_FORMAT(o.order_date, '%Y-%m-%d') AS date
         FROM orders o
         LEFT JOIN users u ON u.id = o.user_id
         LEFT JOIN order_items oi ON oi.order_id = o.id
         LEFT JOIN products p ON p.id = oi.product_id
         GROUP BY o.id, customer, o.total_amount, o.status, o.order_date
         ORDER BY o.order_date DESC LIMIT 8"
    )->fetchAll();

    $topProducts = $database->query(
        "SELECT p.name, SUM(oi.quantity) AS sold, SUM(oi.quantity * oi.price) AS revenue
         FROM order_items oi
         JOIN products p ON p.id = oi.product_id
         JOIN orders o ON o.id = oi.order_id
         WHERE o.status IN ('shipped', 'completed')
         GROUP BY p.id, p.name
         ORDER BY sold DESC LIMIT 5"
    )->fetchAll();

    foreach ($recentOrders as &$order) {
        $order['id'] = 'AMS-' . str_pad((string) $order['id'], 6, '0', STR_PAD_LEFT);
        $order['total'] = (float) $order['total'];
    }
    unset($order);
    foreach ($topProducts as &$product) {
        $product['sold'] = (int) $product['sold'];
        $product['revenue'] = (float) $product['revenue'];
    }
    unset($product);

    jsonResponse(['stats' => $stats, 'recentOrders' => $recentOrders, 'topProducts' => $topProducts]);
} catch (Throwable $error) {
    error_log($error->getMessage());
    jsonResponse(['error' => 'Data dashboard tidak dapat dimuat'], 500);
}