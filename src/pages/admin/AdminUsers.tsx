import { useEffect, useState } from 'react';
import { apiRequest } from '../../data/api';

type UserRole = 'super_admin' | 'staff_gudang' | 'customer';
interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  created_at: string;
  permissions: string[];
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'staff_gudang' as UserRole });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadUsers = () => apiRequest<{ users: AdminUser[]; currentUserId: number }>('admin-users.php').then(payload => {
    setUsers(payload.users);
    setCurrentUserId(payload.currentUserId);
  });

  useEffect(() => {
    loadUsers().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Pengguna tidak dapat dimuat'));
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setNewUser({ name: '', email: '', password: '', role: 'staff_gudang' });
    setError('');
    setShowAdd(true);
  };

  const openEdit = (user: AdminUser) => {
    setEditingId(user.id);
    setNewUser({ name: user.name, email: user.email, password: '', role: user.role });
    setError('');
    setShowAdd(true);
  };

  const saveUser = async () => {
    setSaving(true);
    setError('');
    try {
      if (editingId !== null) {
        await apiRequest(`admin-users.php?id=${editingId}`, { method: 'PUT', body: JSON.stringify({ role: newUser.role }) });
      } else {
        await apiRequest('admin-users.php', { method: 'POST', body: JSON.stringify(newUser) });
      }
      await loadUsers();
      setShowAdd(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Pengguna tidak dapat disimpan');
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (user: AdminUser) => {
    if (!window.confirm(`Hapus akses akun ${user.email}? Pesanan lamanya tetap disimpan.`)) return;
    setError('');
    try {
      await apiRequest(`admin-users.php?id=${user.id}`, { method: 'DELETE' });
      setUsers(previous => previous.filter(item => item.id !== user.id));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Pengguna tidak dapat dihapus');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700 }} className="text-xl">Manajemen Pengguna & Admin</h2>
        <button onClick={openAdd} style={{ background: 'var(--accent)', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }} className="hover:opacity-90">+ Tambah Pengguna</button>
      </div>
      <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', marginBottom: '16px' }}>Pengguna baru mendapat password awal yang Anda tetapkan. Bagikan secara aman kepada pemilik akun.</p>
      {error && <p role="alert" style={{ color: '#b91c1c', marginBottom: '16px' }}>{error}</p>}

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                {['Nama', 'Email', 'Role', 'Hak Akses', 'Status', 'Login Terakhir', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div className="flex items-center gap-3">
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'var(--primary-foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>{u.name[0]}</div>
                      <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: '13px' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted-foreground)', fontSize: '13px' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: u.role === 'super_admin' ? 'var(--primary)' : u.role === 'staff_gudang' ? '#dbeafe' : 'var(--muted)', color: u.role === 'super_admin' ? 'var(--primary-foreground)' : u.role === 'staff_gudang' ? '#1e40af' : 'var(--muted-foreground)', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px' }}>{u.role === 'super_admin' ? 'Super Admin' : u.role === 'staff_gudang' ? 'Staff Gudang' : 'Customer'}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div className="flex flex-wrap gap-1">
                      {u.permissions.map(p => <span key={p} style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>{p}</span>)}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}><span style={{ background: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px' }}>{u.status}</span></td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted-foreground)', fontSize: '13px', whiteSpace: 'nowrap' }}>{new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(u.created_at))}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(u)} style={{ background: 'var(--muted)', color: 'var(--foreground)', padding: '5px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 600 }} className="hover:opacity-80">Ubah Role</button>
                      {u.id !== currentUserId && <button onClick={() => void deleteUser(u)} style={{ background: '#fee2e2', color: '#dc2626', padding: '5px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 600 }} className="hover:opacity-80">Hapus</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--card)', borderRadius: '20px', width: '100%', maxWidth: '440px' }} className="p-6">
            <div className="flex justify-between mb-5">
              <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700 }}>{editingId !== null ? 'Ubah Role Pengguna' : 'Tambah Pengguna'}</h3>
              <button onClick={() => setShowAdd(false)} style={{ color: 'var(--muted-foreground)', fontSize: '20px' }}>×</button>
            </div>
            <div className="space-y-4">
              {editingId === null && [{ key: 'name', label: 'Nama Lengkap', type: 'text' }, { key: 'email', label: 'Email', type: 'email' }, { key: 'password', label: 'Password Awal (min. 8 karakter)', type: 'password' }].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>{f.label}</label>
                  <input type={f.type} required value={(newUser as any)[f.key]} onChange={e => setNewUser(p => ({ ...p, [f.key]: e.target.value }))} style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }} className="px-4 py-3 rounded-xl text-sm outline-none" />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Role</label>
                <select value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))} style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }} className="px-4 py-3 rounded-xl text-sm outline-none">
                  {editingId === currentUserId ? (
                    <option value="super_admin">Super Admin</option>
                  ) : (
                    <>
                      <option value="staff_gudang">Staff Gudang</option>
                      <option value="super_admin">Super Admin</option>
                      {editingId === null && <option value="customer">Customer</option>}
                    </>
                  )}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} style={{ border: '1px solid var(--border)', flex: 1, borderRadius: '10px' }} className="py-3 hover:opacity-80">Batal</button>
              <button onClick={() => void saveUser()} disabled={saving} style={{ background: 'var(--accent)', color: '#fff', flex: 1, borderRadius: '10px' }} className="py-3 font-bold hover:opacity-90 disabled:opacity-60">{saving ? 'Menyimpan...' : editingId === null ? 'Tambahkan' : 'Simpan Role'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
