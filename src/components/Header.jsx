import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

const Header = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="header__title">Система тестирования по русскому языку</div>

            <div className="header__right">
                <input className="header__search" type="text" placeholder="Поиск..." />
                <button className="header__button" onClick={handleLogout}>Выйти</button>
            </div>
        </header>
    );
};

export default Header;
