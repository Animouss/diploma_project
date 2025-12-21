import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        // Пока без настоящей авторизации — просто переходим на главную.
        // Потом здесь можно будет добавить запрос к Django.
        if (login.trim() && password.trim()) {
            navigate("/");
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h1 className="login-title">Система тестирования по русскому языку</h1>
                <p className="login-subtitle">
                    Введите логин и пароль для входа в систему.
                </p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-field">
                        <label htmlFor="login">Логин</label>
                        <input
                            id="login"
                            type="text"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            placeholder="Введите логин"
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="password">Пароль</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Введите пароль"
                        />
                    </div>

                    <button type="submit" className="btn-primary login-button">
                        Войти
                    </button>
                </form>


            </div>
        </div>
    );
};

export default Login;
