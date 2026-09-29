<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
$admin = requireApiSuperAdmin();
$database = database();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$validRoles = ['super_admin', 'staff_gudang', 'customer'];

if ($method === 'GET') {
    try {
        $users = $database->query(
            'SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC, id DESC'
        )->fetchAll();
        foreach ($users as &$user) {
            $user['id'] = (int) $user['id'];
            $user['lastLogin'] = null;
            $user['status'] = 'Aktif';
            $user['permissions'] = $user['role'] === 'super_admin' ? ['Semua akses'] : ($user['role'] === 'staff_gudang' ? ['Akses operasional'] : ['Pelanggan']);
        }
        unset($user);
        jsonResponse(['users' => $users, 'currentUserId' => (int) $admin['id']]);
    } catch (Throwable $error) {
        error_log($error->getMessage());
        jsonResponse(['error' => 'Daftar pengguna tidak dapat dimuat'], 500);
    }
}

$body = jsonBody();
$id = filter_var($_GET['id'] ?? $body['id'] ?? null, FILTER_VALIDATE_INT);

if ($method === 'POST') {
    $name = trim((string) ($body['name'] ?? ''));
    $email = strtolower(trim((string) ($body['email'] ?? '')));
    $password = (string) ($body['password'] ?? '');
    $role = (string) ($body['role'] ?? 'staff_gudang');
    if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8 || !in_array($role, $validRoles, true)) {
        jsonResponse(['error' => 'Nama, email, password minimal 8 karakter, dan role valid wajib diisi'], 422);
    }

    try {
        $statement = $database->prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
        $statement->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT), $role]);
        $newId = (int) $database->lastInsertId();
        $audit = $database->prepare('INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES (?, \'create\', \'user\', ?, ?, ?)');
        $audit->execute([$admin['id'], (string) $newId, json_encode(['email' => $email, 'role' => $role], JSON_UNESCAPED_UNICODE), $_SERVER['REMOTE_ADDR'] ?? null]);
        jsonResponse(['ok' => true, 'id' => $newId], 201);
    } catch (PDOException $error) {
        error_log($error->getMessage());
        jsonResponse(['error' => $error->getCode() === '23000' ? 'Email sudah digunakan' : 'Akun tidak dapat dibuat'], $error->getCode() === '23000' ? 409 : 500);
    }
}

if ($method === 'PUT') {
    $role = (string) ($body['role'] ?? '');
    if (!$id || !in_array($role, $validRoles, true)) {
        jsonResponse(['error' => 'ID atau role tidak valid'], 422);
    }
    if ($id === (int) $admin['id'] && $role !== 'super_admin') {
        jsonResponse(['error' => 'Role akun yang sedang digunakan tidak dapat diturunkan'], 409);
    }

    try {
        $database->beginTransaction();
        $query = $database->prepare('SELECT role FROM users WHERE id = ? FOR UPDATE');
        $query->execute([$id]);
        $target = $query->fetch();
        if (!$target) {
            throw new DomainException('Pengguna tidak ditemukan');
        }
        if ($target['role'] === 'super_admin' && $role !== 'super_admin') {
            $count = (int) $database->query("SELECT COUNT(*) FROM users WHERE role = 'super_admin'")->fetchColumn();
            if ($count <= 1) {
                throw new DomainException('Super admin terakhir tidak dapat diturunkan rolenya');
            }
        }
        $database->prepare('UPDATE users SET role = ? WHERE id = ?')->execute([$role, $id]);
        $audit = $database->prepare('INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES (?, \'change_role\', \'user\', ?, ?, ?)');
        $audit->execute([$admin['id'], (string) $id, json_encode(['from' => $target['role'], 'to' => $role], JSON_UNESCAPED_UNICODE), $_SERVER['REMOTE_ADDR'] ?? null]);
        $database->commit();
        jsonResponse(['ok' => true, 'id' => $id, 'role' => $role]);
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
        jsonResponse(['error' => 'Role tidak dapat diperbarui'], 500);
    }
}

if ($method === 'DELETE') {
    if (!$id) {
        jsonResponse(['error' => 'ID pengguna tidak valid'], 422);
    }
    if ($id === (int) $admin['id']) {
        jsonResponse(['error' => 'Akun yang sedang digunakan tidak dapat dihapus'], 409);
    }

    try {
        $database->beginTransaction();
        $query = $database->prepare('SELECT role, email FROM users WHERE id = ? FOR UPDATE');
        $query->execute([$id]);
        $target = $query->fetch();
        if (!$target) {
            throw new DomainException('Pengguna tidak ditemukan');
        }
        if ($target['role'] === 'super_admin') {
            $count = (int) $database->query("SELECT COUNT(*) FROM users WHERE role = 'super_admin'")->fetchColumn();
            if ($count <= 1) {
                throw new DomainException('Super admin terakhir tidak dapat dihapus');
            }
        }
        $database->prepare('DELETE FROM users WHERE id = ?')->execute([$id]);
        $audit = $database->prepare('INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES (?, \'delete\', \'user\', ?, ?, ?)');
        $audit->execute([$admin['id'], (string) $id, $target['email'], $_SERVER['REMOTE_ADDR'] ?? null]);
        $database->commit();
        jsonResponse(['ok' => true]);
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
        jsonResponse(['error' => 'Pengguna tidak dapat dihapus'], 500);
    }
}

jsonResponse(['error' => 'Method tidak diizinkan'], 405);