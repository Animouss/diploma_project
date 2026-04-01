import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

const roleLabels = {
    student: 'Студент',
    teacher: 'Преподаватель',
    admin: 'Администратор'
};

const Sidebar = () => {
    const { user } = useAuth();

    const initials = user?.fullName
        ?.split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('') || '??';

    return (
        <aside className="sidebar">
            <div className="sidebar__profile">
                <div className="sidebar__avatar">
                    <span>{initials.toUpperCase()}</span>
                </div>
                <div>
                    <div className="sidebar__name">{user?.fullName || 'Пользователь'}</div>
                    <div className="sidebar__role">{roleLabels[user?.role] || 'Роль не указана'}</div>
                    <div className="sidebar__level">Уровень: {user?.level || '—'}</div>
                </div>
            </div>

            <nav className="sidebar__nav">
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                        'sidebar__link' + (isActive ? ' sidebar__link--active' : '')
                    }
                >
                    🏠 Главная
                </NavLink>

                <NavLink
                    to="/tests"
                    className={({ isActive }) =>
                        'sidebar__link' + (isActive ? ' sidebar__link--active' : '')
                    }
                >
                    🧪 Мои тесты
                </NavLink>

                <NavLink
                    to="/results"
                    className={({ isActive }) =>
                        'sidebar__link' + (isActive ? ' sidebar__link--active' : '')
                    }
                >
                    📊 Результаты
                </NavLink>

                {user?.role === 'admin' && (
                    <NavLink
                        to="/admin"
                        className={({ isActive }) =>
                            'sidebar__link' + (isActive ? ' sidebar__link--active' : '')
                        }
                    >
                        ⚙️ Админ-панель
                    </NavLink>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;
