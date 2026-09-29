<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
requireApiAdmin();

try {
    $database = database();
    $range = $database->query(
        "SELECT
            COALESCE((SELECT SUM(amount) FROM payments WHERE status = 'success' AND payment_date >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')), 0) AS revenue,
            (SELECT COUNT(*) FROM orders WHERE status <> 'cancelled' AND order_date >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')) AS orders,
            (SELECT COUNT(*) FROM users WHERE role = 'customer' AND created_at >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')) AS customers"
    )->fetch();

    $monthlyRows = $database->query(
        "SELECT DATE_FORMAT(payment_date, '%Y-%m') AS month_key, SUM(amount) AS revenue
         FROM payments WHERE status = 'success' AND payment_date >= DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL 5 MONTH), '%Y-%m-01')
         GROUP BY month_key ORDER BY month_key"
    )->fetchAll();
    $monthlyRevenue = [];
    foreach ($monthlyRows as $row) {
        $monthlyRevenue[$row['month_key']] = (float) $row['revenue'];
    }

    $monthlyOrderRows = $database->query(
        "SELECT DATE_FORMAT(order_date, '%Y-%m') AS month_key, COUNT(*) AS orders
         FROM orders WHERE status <> 'cancelled' AND order_date >= DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL 5 MONTH), '%Y-%m-01')
         GROUP BY month_key"
    )->fetchAll();
    $monthlyOrders = [];
    foreach ($monthlyOrderRows as $row) {
        $monthlyOrders[$row['month_key']] = (int) $row['orders'];
    }

    $months = [];
    $monthStart = new DateTimeImmutable('first day of this month');
    for ($offset = 5; $offset >= 0; $offset--) {
        $month = $monthStart->modify('-' . $offset . ' months');
        $key = $month->format('Y-m');
        $months[] = [
            'month' => $month->format('M'),
            'revenue' => $monthlyRevenue[$key] ?? 0,
            'orders' => $monthlyOrders[$key] ?? 0,
        ];
    }

    $categoryRows = $database->query(
        "SELECT COALESCE(c.name, 'Lainnya') AS name, SUM(oi.quantity) AS sold,
                SUM(oi.quantity * oi.price) AS revenue
         FROM order_items oi JOIN orders o ON o.id = oi.order_id
         JOIN payments pay ON pay.order_id = o.id AND pay.status = 'success'
         JOIN products p ON p.id = oi.product_id LEFT JOIN categories c ON c.id = p.category_id
         WHERE o.status IN ('shipped', 'completed')
         GROUP BY c.id, c.name ORDER BY revenue DESC LIMIT 8"
    )->fetchAll();
    $categoryTotal = array_sum(array_map(static fn(array $row): float => (float) $row['revenue'], $categoryRows));
    $categories = array_map(static fn(array $row): array => [
        'name' => $row['name'],
        'sold' => (int) $row['sold'],
        'revenue' => (float) $row['revenue'],
        'pct' => $categoryTotal > 0 ? round(((float) $row['revenue'] / $categoryTotal) * 100, 1) : 0,
    ], $categoryRows);

    $topProducts = $database->query(
        "SELECT p.name, SUM(oi.quantity) AS sold, SUM(oi.quantity * oi.price) AS revenue
         FROM order_items oi JOIN orders o ON o.id = oi.order_id
         JOIN payments pay ON pay.order_id = o.id AND pay.status = 'success'
         JOIN products p ON p.id = oi.product_id
         WHERE o.status IN ('shipped', 'completed')
         GROUP BY p.id, p.name ORDER BY sold DESC LIMIT 8"
    )->fetchAll();
    foreach ($topProducts as &$product) {
        $product['sold'] = (int) $product['sold'];
        $product['revenue'] = (float) $product['revenue'];
    }
    unset($product);

    $revenue = (float) $range['revenue'];
    $orderCount = (int) $range['orders'];
    jsonResponse([
        'overview' => [
            'revenue' => $revenue,
            'orders' => $orderCount,
            'averageOrderValue' => $orderCount > 0 ? round($revenue / $orderCount) : 0,
            'customers' => (int) $range['customers'],
        ],
        'monthly' => $months,
        'categories' => $categories,
        'topProducts' => $topProducts,
    ]);
} catch (Throwable $error) {
    error_log($error->getMessage());
    jsonResponse(['error' => 'Data analitik tidak dapat dimuat'], 500);
}