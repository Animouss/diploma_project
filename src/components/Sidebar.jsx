import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

const roleLabels = { student: 'Студент', teacher: 'Преподаватель', admin: 'Администратор' };

const groupLabelByRole = (user) => {
    if (!user) return '—';
    if (user.role === 'student') return user.group || '—';
    if (user.role === 'teacher') return 'Кафедра русского языка';
    return '—';
};

const Sidebar = () => {
    const { user } = useAuth();
    const initials = user?.fullName?.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('') || '??';

    return (
        <aside className="sidebar">
            <div className="sidebar__profile"><div className="sidebar__avatar"><span>{initials.toUpperCase()}</span></div><div><div className="sidebar__name">{user?.fullName || 'Пользователь'}</div><div className="sidebar__role">{roleLabels[user?.role] || 'Роль не указана'}</div><div className="sidebar__level">Группа: {groupLabelByRole(user)}</div></div></div>
            <nav className="sidebar__nav">
                <NavLink to="/" end className={({ isActive }) => 'sidebar__link' + (isActive ? ' sidebar__link--active' : '')}>🏠 Главная</NavLink>
                <NavLink to="/tests" className={({ isActive }) => 'sidebar__link' + (isActive ? ' sidebar__link--active' : '')}>🧪 Мои тесты</NavLink>
                <NavLink to="/results" className={({ isActive }) => 'sidebar__link' + (isActive ? ' sidebar__link--active' : '')}>📊 Результаты</NavLink>
                {(user?.role === 'admin' || user?.role === 'teacher') && (
                    <NavLink to="/admin" className={({ isActive }) => 'sidebar__link' + (isActive ? ' sidebar__link--active' : '')}>⚙️ {user?.role === 'teacher' ? 'Тесты' : 'Админ-панель'}</NavLink>
                )}
                {user?.role === 'admin' && (
                    <NavLink to="/users" className={({ isActive }) => 'sidebar__link' + (isActive ? ' sidebar__link--active' : '')}>👥 Все пользователи</NavLink>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;
