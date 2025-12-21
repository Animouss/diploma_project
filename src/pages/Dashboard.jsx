import React from 'react';

const Dashboard = () => {
    return (
        <div className="page">
            <h1 className="page__title">Добро пожаловать!</h1>
            <p className="page__subtitle">
                Здесь вы можете проходить тесты и смотреть результаты.
            </p>

            <div className="cards">
                <div className="card">
                    <div className="card__title">Активные тесты</div>
                    <div className="card__value">3</div>
                </div>

                <div className="card">
                    <div className="card__title">Завершённые</div>
                    <div className="card__value">7</div>
                </div>

                <div className="card">
                    <div className="card__title">Текущий уровень</div>
                    <div className="card__value">B1</div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
