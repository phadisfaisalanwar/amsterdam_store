import { useState } from 'react';

const users = [
  { id: 1, name: 'Admin Amsterdam', email: 'admin@amsterdam.store', role: 'Admin', status: 'Aktif', lastLogin: '19 Sep 2026', permissions: ['Semua Akses'] },
  { id: 2, name: 'Eko Prasetyo', email: 'eko@amsterdam.store', role: 'Manager', status: 'Aktif', lastLogin: '18 Sep 2026', permissions: ['Produk', 'Pesanan', 'Pelanggan'] },
  { id: 3, name: 'Putri Handayani', email: 'putri@amsterdam.store', role: 'CS', status: 'Aktif', lastLogin: '19 Sep 2026', permissions: ['Pesanan', 'Pelanggan', 'Chat'] },
  { id: 4, name: 'Arif Budiman', email: 'arif@amsterdam.store', role: 'Warehouse', status: 'Aktif', lastLogin: '15 Sep 2026', permissions: ['Stok', 'Produk'] },
];

export default function AdminUsers() {
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'CS' });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700 }} className="text-xl">Manajemen Pengguna & Admin</h2>
        <button onClick={() => setShowAdd(true)} style={{ background: 'var(--accent)', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }} className="hover:opacity-90">+ Tambah Admin</button>
      </div>

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
                    <span style={{ background: u.role === 'Admin' ? 'var(--primary)' : u.role === 'Manager' ? '#dbeafe' : 'var(--muted)', color: u.role === 'Admin' ? 'var(--primary-foreground)' : u.role === 'Manager' ? '#1e40af' : 'var(--muted-foreground)', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px' }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div className="flex flex-wrap gap-1">
                      {u.permissions.map(p => <span key={p} style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>{p}</span>)}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}><span style={{ background: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px' }}>{u.status}</span></td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted-foreground)', fontSize: '13px', whiteSpace: 'nowrap' }}>{u.lastLogin}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div className="flex gap-2">
                      <button style={{ background: 'var(--muted)', color: 'var(--foreground)', padding: '5px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 600 }} className="hover:opacity-80">Edit</button>
                      {u.id !== 1 && <button style={{ background: '#fee2e2', color: '#dc2626', padding: '5px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 600 }} className="hover:opacity-80">Hapus</button>}
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
              <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700 }}>Tambah Admin Baru</h3>
              <button onClick={() => setShowAdd(false)} style={{ color: 'var(--muted-foreground)', fontSize: '20px' }}>×</button>
            </div>
            <div className="space-y-4">
              {[{ key: 'name', label: 'Nama Lengkap', type: 'text' }, { key: 'email', label: 'Email', type: 'email' }].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>{f.label}</label>
                  <input type={f.type} value={(newUser as any)[f.key]} onChange={e => setNewUser(p => ({ ...p, [f.key]: e.target.value }))} style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }} className="px-4 py-3 rounded-xl text-sm outline-none" />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Role</label>
                <select value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))} style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }} className="px-4 py-3 rounded-xl text-sm outline-none">
                  {['Admin', 'Manager', 'CS', 'Warehouse'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} style={{ border: '1px solid var(--border)', flex: 1, borderRadius: '10px' }} className="py-3 hover:opacity-80">Batal</button>
              <button onClick={() => setShowAdd(false)} style={{ background: 'var(--accent)', color: '#fff', flex: 1, borderRadius: '10px' }} className="py-3 font-bold hover:opacity-90">Tambahkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
