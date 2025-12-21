import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar__profile">
                <div className="sidebar__avatar">
                    <span>АК</span>
                </div>
                <div>
                    <div className="sidebar__name">Казабеев Андрей</div>
                    <div className="sidebar__role">Администратор</div>
                    <div className="sidebar__level">Уровень: C2</div>
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

                <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                        'sidebar__link' + (isActive ? ' sidebar__link--active' : '')
                    }
                >
                    ⚙️ Админ-панель
                </NavLink>
            </nav>
        </aside>
    );
};

export default Sidebar;
