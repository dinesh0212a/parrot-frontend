import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../utils/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/users').then(res => { setUsers(res.data); setLoading(false); });
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-header">
          <h1>👥 Users</h1>
          <span style={{ fontSize: 13, color: '#888' }}>{users.length} registered users</span>
        </div>

        {loading ? <div className="loading">🦜</div> : (
          <div className="admin-table">
            <table>
              <thead>
                <tr><th>#</th><th>Name</th><th>Email</th><th>Location</th><th>Role</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u._id}>
                    <td>{i + 1}</td>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>{u.location || 'SRM University, Potheri'}</td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-orange' : 'badge-green'}`}>{u.role}</span></td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
