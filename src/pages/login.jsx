import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [loginValue, setLoginValue] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(loginValue.trim(), password.trim());
            navigate('/');
        } catch (err) {
            const message = err?.message || 'Ошибка входа. Проверьте данные.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h1 className="login-title">Система тестирования по русскому языку</h1>
                <p className="login-subtitle">Введите логин и пароль для входа в систему.</p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-field">
                        <label htmlFor="login">Логин</label>
                        <input
                            id="login"
                            type="text"
                            value={loginValue}
                            onChange={(e) => setLoginValue(e.target.value)}
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

                    <button type="submit" className="btn-primary login-button" disabled={isLoading}>
                        {isLoading ? 'Вход...' : 'Войти'}
                    </button>
                </form>

                {error && <p className="page__hint">{error}</p>}
                <p className="page__hint">
                    Демо-доступ: student / student123, teacher / teacher123, admin / admin123.
                </p>
            </div>
        </div>
    );
};

export default Login;
