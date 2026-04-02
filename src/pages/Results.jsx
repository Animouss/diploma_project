import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/auth-context';
import { getMyResultsRequest, getResultsOverviewRequest } from '../api/results';

const formatDate = (value) => {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleDateString('ru-RU');
};

const Results = () => {
    const { token, user } = useAuth();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');

            if (!token || token.startsWith('demo-token-')) {
                setRows([]);
                setLoading(false);
                return;
            }

            try {
                const data =
                    user?.role === 'student'
                        ? await getMyResultsRequest(token)
                        : await getResultsOverviewRequest(token);
                setRows(data || []);
            } catch (err) {
                setError(err.message || 'Не удалось загрузить результаты.');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [token, user?.role]);

    if (loading) {
        return <div className="page">Загрузка результатов...</div>;
    }

    return (
        <div className="page">
            <h1 className="page__title">Результаты</h1>

            {error && <p className="page__hint">{error}</p>}
            {!error && rows.length === 0 && <p className="page__hint">Результаты пока отсутствуют.</p>}

            <table className="table">
                <thead>
                <tr>
                    <th>Дата</th>
                    {user?.role !== 'student' && <th>Студент</th>}
                    <th>Тест</th>
                    <th>Результат</th>
                    <th>Уровень</th>
                    <th>Статус</th>
                </tr>
                </thead>
                <tbody>
                {rows.map((row) => (
                    <tr key={row.id}>
                        <td>{formatDate(row.finished_at || row.created_at)}</td>
                        {user?.role !== 'student' && (
                            <td>{row.user_full_name || row.username || '—'}</td>
                        )}
                        <td>{row.test_title}</td>
                        <td>{row.score_percent}%</td>
                        <td>{row.level_result}</td>
                        <td>{row.passed ? 'Зачёт' : 'Незачёт'}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Results;
