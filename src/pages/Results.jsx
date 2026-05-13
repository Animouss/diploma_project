import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/auth-context';
import { getAdminTests, getGroups, getUsers } from '../api/admin';
import {
    getMyResultsRequest,
    getResultDetailRequest,
    getResultsOverviewRequest,
} from '../api/results';

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

    const [tests, setTests] = useState([]);
    const [groups, setGroups] = useState([]);
    const [filters, setFilters] = useState({ test_id: '', group_id: '', student_search: '' });
    const [searchInput, setSearchInput] = useState('');

    const [selectedResult, setSelectedResult] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const isStudent = user?.role === 'student';

    useEffect(() => {
        const loadFilterData = async () => {
            if (isStudent || !token || token.startsWith('demo-token-')) {
                return;
            }

            try {
                const [testsData, groupsData, usersData] = await Promise.all([
                    getAdminTests(token),
                    getGroups(token),
                    getUsers(token)
                ]);

                setTests(testsData || []);
                setGroups(groupsData || []);
                
            } catch {
                // filters are optional for UX; keep page usable without blocking
            }
        };

        loadFilterData();
    }, [isStudent, token]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters((prev) => ({ ...prev, student_search: searchInput.trim() }));
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            setSelectedResult(null);

            if (!token || token.startsWith('demo-token-')) {
                setRows([]);
                setLoading(false);
                return;
            }

            try {
                const data = isStudent
                    ? await getMyResultsRequest(token)
                    : await getResultsOverviewRequest(token, filters);
                setRows(data || []);
            } catch (err) {
                setError(err.message || 'Не удалось загрузить результаты.');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [token, isStudent, filters]);

    const openResultDetail = async (resultId) => {
        if (!token || token.startsWith('demo-token-')) {
            return;
        }

        setDetailLoading(true);
        try {
            const detail = await getResultDetailRequest(token, resultId);
            setSelectedResult(detail);
        } catch (err) {
            setError(err.message || 'Не удалось загрузить детали результата.');
        } finally {
            setDetailLoading(false);
        }
    };

    if (loading) {
        return <div className="page">Загрузка результатов...</div>;
    }

    return (
        <div className="page">
            <h1 className="page__title">Результаты</h1>

            {error && <p className="page__hint">{error}</p>}

            {!isStudent && (
                <div className="admin-card" style={{ marginBottom: '12px' }}>
                    <h2 className="admin-card__title">Фильтры</h2>
                    <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                        <div className="admin-field">
                            <label>Тест</label>
                            <select
                                value={filters.test_id}
                                onChange={(e) => setFilters((prev) => ({ ...prev, test_id: e.target.value }))}
                            >
                                <option value="">Все</option>
                                {tests.map((test) => (
                                    <option key={test.id} value={test.id}>{test.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="admin-field">
                            <label>Группа</label>
                            <select
                                value={filters.group_id}
                                onChange={(e) => setFilters((prev) => ({ ...prev, group_id: e.target.value }))}
                            >
                                <option value="">Все</option>
                                {groups.map((group) => (
                                    <option key={group.id} value={group.id}>{group.code}</option>
                                ))}
                            </select>
                        </div>
                        <div className="admin-field">
                            <label>Студент</label>
                            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Введите ФИО или логин студента" />
                        </div>
                    </div>
                </div>
            )}

            {!error && rows.length === 0 && <p className="page__hint">Результаты не найдены.</p>}

            <table className="table">
                <thead>
                <tr>
                    <th>Дата</th>
                    {!isStudent && <th>Студент</th>}
                    <th>Тест</th>
                    <th>Результат</th>
                    <th>Уровень</th>
                    <th>Уровень подготовки</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {rows.map((row) => (
                    <tr key={row.id}>
                        <td>{formatDate(row.finished_at || row.created_at)}</td>
                        {!isStudent && <td>{row.user_full_name || row.username || '—'}</td>}
                        <td>{row.test_title}</td>
                        <td>{row.score_percent}%</td>
                        <td>{row.level_result}</td>
                        <td>{row.preparation_level || '—'}</td>
                        <td>
                            <button className="btn-secondary" type="button" onClick={() => openResultDetail(row.id)}>
                                Открыть
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {detailLoading && <p className="page__hint">Загрузка деталей результата...</p>}

            {selectedResult && !detailLoading && (
                <div className="admin-card" style={{ marginTop: '14px' }}>
                    <h2 className="admin-card__title">Детали результата</h2>
                    <p className="admin-card__subtitle">
                        {selectedResult.student_name} · {selectedResult.test_title} · {selectedResult.score_percent}%
                    </p>

                    <table className="table admin-table">
                        <thead>
                        <tr>
                            <th>Вопрос</th>
                            <th>Ваш ответ</th>
                            <th>Правильный ответ</th>
                            <th>Итог</th>
                        </tr>
                        </thead>
                        <tbody>
                        {selectedResult.questions.map((question) => (
                            <tr key={question.question_id}>
                                <td>{question.question_text}</td>
                                <td>{question.selected_option_text || '—'}</td>
                                <td>{question.correct_option_text || '—'}</td>
                                <td>{question.is_correct ? 'Верно' : 'Ошибка'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Results;
