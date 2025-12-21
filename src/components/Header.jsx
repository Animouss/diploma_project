import React from 'react';

const Header = () => {
    return (
        <header className="header">
            <div className="header__title">Система тестирования по русскому языку</div>

            <div className="header__right">
                <input
                    className="header__search"
                    type="text"
                    placeholder="Поиск..."
                />
                <button className="header__button">Выйти</button>
            </div>
        </header>
    );
};

export default Header;
