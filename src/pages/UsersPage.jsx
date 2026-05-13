import React, { useEffect, useMemo, useState } from 'react';
import { deleteUser, getGroups, getUsers } from '../api/admin';
import { useAuth } from '../context/auth-context';

const roleLabels = { student: 'Студент', teacher: 'Преподаватель', admin: 'Администратор' };

const UsersPage = () => {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [group, setGroup] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [u, g] = await Promise.all([getUsers(token), getGroups(token)]);
      setUsers(u || []); setGroups(g || []);
    } catch (e) { setError(e.message || 'Ошибка загрузки пользователей'); }
  };

  useEffect(() => { if (token) load(); }, [token]);

  const filtered = useMemo(() => users.filter((u) => {
    const q = query.trim().toLowerCase();
    const okQ = !q || `${u.username} ${u.full_name || ''}`.toLowerCase().includes(q);
    const okR = !role || u.role === role;
    const okG = !group || String(u.student_group_id || '') === group;
    return okQ && okR && okG;
  }), [users, query, role, group]);

  const onDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить пользователя без возможности восстановления?')) return;
    try { await deleteUser(token, id); await load(); } catch (e) { setError(e.message || 'Ошибка удаления'); }
  };

  return <div className="page"><h1 className="page__title">Все пользователи</h1>{error && <p className="page__hint">{error}</p>}
    <div className="admin-grid" style={{gridTemplateColumns:'2fr 1fr 1fr'}}>
      <div className="admin-field"><label>Поиск</label><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Логин или ФИО"/></div>
      <div className="admin-field"><label>Роль</label><select value={role} onChange={(e)=>setRole(e.target.value)}><option value="">Все</option><option value="student">Студент</option><option value="teacher">Преподаватель</option><option value="admin">Администратор</option></select></div>
      <div className="admin-field"><label>Группа</label><select value={group} onChange={(e)=>setGroup(e.target.value)}><option value="">Все</option>{groups.map((g)=><option key={g.id} value={g.id}>{g.code}</option>)}</select></div>
    </div>
    <div className="admin-table-wrapper"><table className="table admin-table"><thead><tr><th>Логин</th><th>ФИО</th><th>Роль</th><th>Группа</th><th></th></tr></thead><tbody>{filtered.map((u)=><tr key={u.id}><td>{u.username}</td><td>{u.full_name}</td><td>{roleLabels[u.role] || u.role}</td><td>{u.group}</td><td>{u.id!==user?.id && <button className="btn-secondary" onClick={()=>onDelete(u.id)}>Удалить</button>}</td></tr>)}</tbody></table></div>
  </div>;
};

export default UsersPage;
