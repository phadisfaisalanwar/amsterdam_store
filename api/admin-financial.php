<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
requireApiAdmin();

try {
    $database = database();
    $summary = $database->query(
        "SELECT
            COALESCE((SELECT SUM(amount) FROM finances WHERE transaction_type = 'income' AND transaction_date >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')), 0)
              + COALESCE((SELECT SUM(amount) FROM payments WHERE status = 'success' AND payment_date >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')), 0) AS income,
            COALESCE((SELECT SUM(amount) FROM finances WHERE transaction_type = 'expense' AND transaction_date >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')), 0) AS expenses"
    )->fetch();
    $income = (float) $summary['income'];
    $expenses = (float) $summary['expenses'];

    $finances = $database->query(
        "SELECT CONCAT('FIN-', LPAD(id, 6, '0')) AS id,
                DATE_FORMAT(transaction_date, '%Y-%m-%d') AS date,
                IF(transaction_type = 'income', 'Pendapatan', 'Pengeluaran') AS type,
                COALESCE(description, 'Transaksi keuangan') AS description,
                'Operasional' AS category,
                IF(transaction_type = 'income', amount, -amount) AS amount
         FROM finances"
    )->fetchAll();
    $payments = $database->query(
        "SELECT CONCAT('PAY-', LPAD(p.id, 6, '0')) AS id,
                DATE_FORMAT(p.payment_date, '%Y-%m-%d') AS date,
                'Pendapatan' AS type,
                CONCAT('Pembayaran pesanan AMS-', LPAD(o.id, 6, '0')) AS description,
                'Penjualan' AS category,
                p.amount AS amount
         FROM payments p JOIN orders o ON o.id = p.order_id WHERE p.status = 'success'"
    )->fetchAll();
    $transactions = array_merge($finances, $payments);
    usort($transactions, static fn(array $left, array $right): int => strcmp($right['date'], $left['date']) ?: strcmp($right['id'], $left['id']));
    $transactions = array_slice($transactions, 0, 500);
    foreach ($transactions as &$transaction) {
        $transaction['amount'] = (float) $transaction['amount'];
    }
    unset($transaction);

    jsonResponse([
        'summary' => [
            'income' => $income,
            'expenses' => $expenses,
            'profit' => $income - $expenses,
            'margin' => $income > 0 ? round((($income - $expenses) / $income) * 100, 1) : 0,
        ],
        'transactions' => $transactions,
    ]);
} catch (Throwable $error) {
    error_log($error->getMessage());
    jsonResponse(['error' => 'Laporan keuangan tidak dapat dimuat'], 500);
}