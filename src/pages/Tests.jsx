import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { getMyTestsRequest } from '../api/tests';

const mockTests = [
    {
        id: 1,
        title: 'Лексика и грамматика. Базовый уровень',
        level: 'A2',
        status: 'Не начат',
        duration: '30 мин'
    },
    {
        id: 2,
        title: 'Понимание текста. Техническая тематика',
        level: 'B1',
        status: 'В процессе',
        duration: '40 мин'
    },
    {
        id: 3,
        title: 'Комплексный тест по русскому языку',
        level: 'B2',
        status: 'Завершён',
        duration: '60 мин'
    }
];

const Tests = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [tests, setTests] = useState(mockTests);
    const [hint, setHint] = useState('');

    useEffect(() => {
        const loadTests = async () => {
            if (!token || token.startsWith('demo-token-')) {
                setHint('Показаны демо-данные (backend не подключен).');
                return;
            }

            try {
                const apiTests = await getMyTestsRequest(token);
                if (apiTests.length > 0) {
                    setTests(apiTests);
                    setHint('Данные загружены с backend API.');
                } else {
                    setTests([]);
                    setHint('У вас пока нет назначенных тестов.');
                }
            } catch {
                setTests(mockTests);
                setHint('Не удалось загрузить API-данные. Показаны демо-данные.');
            }
        };

        loadTests();
    }, [token]);

    const handleStart = (id) => {
        navigate(`/tests/${id}`);
    };

    return (
        <div className="page">
            <h1 className="page__title">Мои тесты</h1>
            <p className="page__subtitle">
                Выберите тест, чтобы начать или продолжить выполнение.
            </p>

            {hint && <p className="page__hint">{hint}</p>}

            <table className="table">
                <thead>
                <tr>
                    <th>Название теста</th>
                    <th>Уровень</th>
                    <th>Статус</th>
                    <th>Время</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {tests.map((test) => (
                    <tr key={test.id}>
                        <td>{test.title}</td>
                        <td>{test.level}</td>
                        <td>{test.status}</td>
                        <td>{test.duration}</td>
                        <td>
                            <button
                                className="btn-primary"
                                onClick={() => handleStart(test.id)}
                            >
                                {test.status === 'В процессе' ? 'Продолжить' : 'Начать'}
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Tests;
