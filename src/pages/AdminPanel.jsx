import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/auth-context';
import {
    assignTestToGroups,
    createAdminTest,
    createGroup,
    createOption,
    createQuestion,
    createUser,
    getAdminTests,
    getAssignments,
    getGroups,
    getOptions,
    getQuestions,
    getUsers,
    updateAdminTest,
    updateUser,
    deleteAdminTest,
    deleteOption,
    deleteQuestion,
    updateQuestion,
} from '../api/admin';

const AdminPanel = () => {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [tests, setTests] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [options, setOptions] = useState([]);
    const [assignments, setAssignments] = useState([]);

    const [selectedTestId, setSelectedTestId] = useState('');
    const [selectedQuestionId, setSelectedQuestionId] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [newUser, setNewUser] = useState({
        username: '',
        full_name: '',
        password: '',
        role: 'student',
        student_group_id: ''
    });

    const [newGroup, setNewGroup] = useState({ name: '', code: '' });
    const [newTest, setNewTest] = useState({ title: '', level: 'A2', duration_minutes: 30, is_published: false });
    const [newQuestion, setNewQuestion] = useState({ question_type: 'single_choice', text: '', order: 1, points: 1, passage_text: '' });
    const [newOption, setNewOption] = useState({ text: '', is_correct: false, order: 1 });
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [assignmentGroupIds, setAssignmentGroupIds] = useState([]);

    const showSuccess = (text) => {
        setMessage(text);
        setError('');
    };

    const showError = (err) => {
        const backendDetail = err?.message || err?.detail;
        setError(backendDetail || 'Ошибка запроса');
        setMessage('');
    };

    const loadBaseData = useCallback(async () => {
        if (!token || token.startsWith('demo-token-')) {
            setError('Для управления данными необходим backend и вход под реальным администратором.');
            return;
        }

        try {
            const [usersData, groupsData, testsData] = await Promise.all([
                getUsers(token),
                getGroups(token),
                getAdminTests(token)
            ]);
            setUsers(usersData);
            setGroups(groupsData);
            setTests(testsData);
        } catch (err) {
            showError(err);
        }
    }, [token]);

    useEffect(() => {
        const timer = setTimeout(() => {
            void loadBaseData();
        }, 0);

        return () => clearTimeout(timer);
    }, [loadBaseData]);

    useEffect(() => {
        const loadTestDetails = async () => {
            if (!selectedTestId) {
                setQuestions([]);
                setAssignments([]);
                return;
            }

            try {
                const [qData, aData] = await Promise.all([
                    getQuestions(token, selectedTestId),
                    getAssignments(token, selectedTestId)
                ]);
                setQuestions(qData);
                setAssignments(aData);
            } catch (err) {
                showError(err);
            }
        };

        if (token) {
            loadTestDetails();
        }
    }, [selectedTestId, token]);

    useEffect(() => {
        const loadQuestionOptions = async () => {
            if (!selectedQuestionId) {
                setOptions([]);
                return;
            }

            try {
                const data = await getOptions(token, selectedQuestionId);
                setOptions(data);
            } catch (err) {
                showError(err);
            }
        };

        if (token) {
            loadQuestionOptions();
        }
    }, [selectedQuestionId, token]);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (!newUser.username || !newUser.password || !newUser.full_name) {
            setError('Заполните обязательные поля пользователя.');
            return;
        }

        if (newUser.password.length < 6) {
            setError('Пароль должен содержать минимум 6 символов.');
            return;
        }

        try {
            await createUser(token, {
                ...newUser,
                student_group_id: newUser.student_group_id || null
            });
            setNewUser({ username: '', full_name: '', password: '', role: 'student', student_group_id: '' });
            showSuccess('Пользователь создан и может войти в систему.');
            await loadBaseData();
        } catch (err) {
            showError(err);
        }
    };

    const handleUserRoleChange = async (userId, role) => {
        try {
            await updateUser(token, userId, { role });
            showSuccess('Роль пользователя обновлена.');
            await loadBaseData();
        } catch (err) {
            showError(err);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!newGroup.name || !newGroup.code) {
            setError('Введите название и код группы.');
            return;
        }

        try {
            await createGroup(token, newGroup);
            setNewGroup({ name: '', code: '' });
            showSuccess('Группа создана.');
            await loadBaseData();
        } catch (err) {
            showError(err);
        }
    };

    const handleCreateTest = async (e) => {
        e.preventDefault();
        if (!newTest.title) {
            setError('Введите название теста.');
            return;
        }

        try {
            await createAdminTest(token, newTest);
            setNewTest({ title: '', level: 'A2', duration_minutes: 30, is_published: false });
            showSuccess('Тест создан.');
            await loadBaseData();
        } catch (err) {
            showError(err);
        }
    };

    const handleTestPublishToggle = async (testId, value) => {
        try {
            await updateAdminTest(token, testId, { is_published: value });
            showSuccess('Статус публикации обновлён.');
            await loadBaseData();
        } catch (err) {
            showError(err);
        }
    };

    const handleCreateQuestion = async (e) => {
        e.preventDefault();
        if (!selectedTestId || !newQuestion.text) {
            setError('Выберите тест и заполните текст вопроса.');
            return;
        }

        try {
            const payload = { ...newQuestion, test: Number(selectedTestId), order: Number(newQuestion.order), points: Number(newQuestion.points) };
            if (editingQuestionId) {
                await updateQuestion(token, editingQuestionId, payload);
            } else {
                await createQuestion(token, payload);
            }
            setNewQuestion({ question_type: 'single_choice', text: '', order: 1, points: 1, passage_text: '' });
            setEditingQuestionId(null);
            showSuccess(editingQuestionId ? 'Вопрос обновлён.' : 'Вопрос добавлен.');
            const qData = await getQuestions(token, selectedTestId);
            setQuestions(qData);
        } catch (err) {
            showError(err);
        }
    };

    const handleCreateOption = async (e) => {
        e.preventDefault();
        if (!selectedQuestionId || !newOption.text) {
            setError('Выберите вопрос и заполните вариант ответа.');
            return;
        }

        try {
            await createOption(token, {
                ...newOption,
                question: Number(selectedQuestionId),
                order: Number(newOption.order)
            });
            setNewOption({ text: '', is_correct: false, order: 1 });
            showSuccess('Вариант ответа добавлен.');
            const data = await getOptions(token, selectedQuestionId);
            setOptions(data);
        } catch (err) {
            showError(err);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!selectedTestId || assignmentGroupIds.length === 0) {
            setError('Выберите тест и хотя бы одну группу.');
            return;
        }

        try {
            await assignTestToGroups(token, {
                test_id: Number(selectedTestId),
                group_ids: assignmentGroupIds
            });
            showSuccess('Тест назначен выбранным группам.');
            const data = await getAssignments(token, selectedTestId);
            setAssignments(data);
        } catch (err) {
            showError(err);
        }
    };

    return (
        <div className="page">
            <h1 className="page__title">Административная панель</h1>
            <p className="page__subtitle">Управление пользователями, группами, тестами, вопросами и назначениями.</p>

            {message && <div className="admin-message">{message}</div>}
            {error && <div className="admin-message">{error}</div>}

            <div className="admin-grid">
                <div className="admin-card">
                    <h2 className="admin-card__title">Пользователи</h2>
                    <form className="admin-form" onSubmit={handleCreateUser}>
                        <div className="admin-field"><label>Логин</label><input value={newUser.username} onChange={(e) => setNewUser((p) => ({ ...p, username: e.target.value }))} /></div>
                        <div className="admin-field"><label>ФИО</label><input value={newUser.full_name} onChange={(e) => setNewUser((p) => ({ ...p, full_name: e.target.value }))} /></div>
                        <div className="admin-field"><label>Пароль</label><input type="password" value={newUser.password} onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))} /></div>
                        <div className="admin-field"><label>Роль</label><select value={newUser.role} onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))}><option value="student">Студент</option><option value="teacher">Преподаватель</option><option value="admin">Администратор</option></select></div>
                        <div className="admin-field"><label>Группа</label><select value={newUser.student_group_id} onChange={(e) => setNewUser((p) => ({ ...p, student_group_id: e.target.value }))}><option value="">—</option>{groups.map((g) => <option key={g.id} value={g.id}>{g.code}</option>)}</select></div>
                        <button className="btn-primary admin-submit" type="submit">Создать пользователя</button>
                    </form>
                    <div className="admin-table-wrapper">
                        <table className="table admin-table">
                            <thead><tr><th>Логин</th><th>ФИО</th><th>Роль</th><th>Группа</th></tr></thead>
                            <tbody>{users.map((u) => (<tr key={u.id}><td>{u.username}</td><td>{u.full_name}</td><td><select value={u.role} onChange={(e) => handleUserRoleChange(u.id, e.target.value)}><option value="student">Студент</option><option value="teacher">Преподаватель</option><option value="admin">Администратор</option></select></td><td>{u.group}</td></tr>))}</tbody>
                        </table>
                    </div>
                </div>

                <div className="admin-card">
                    <h2 className="admin-card__title">Группы и тесты</h2>
                    <form className="admin-form" onSubmit={handleCreateGroup}>
                        <div className="admin-field"><label>Название группы</label><input value={newGroup.name} onChange={(e) => setNewGroup((p) => ({ ...p, name: e.target.value }))} /></div>
                        <div className="admin-field"><label>Код группы</label><input value={newGroup.code} onChange={(e) => setNewGroup((p) => ({ ...p, code: e.target.value }))} /></div>
                        <button className="btn-secondary" type="submit">Создать группу</button>
                    </form>

                    <form className="admin-form" onSubmit={handleCreateTest}>
                        <div className="admin-field"><label>Название теста</label><input value={newTest.title} onChange={(e) => setNewTest((p) => ({ ...p, title: e.target.value }))} /></div>
                        <div className="admin-field"><label>Уровень</label><input value={newTest.level} onChange={(e) => setNewTest((p) => ({ ...p, level: e.target.value }))} /></div>
                        <div className="admin-field"><label>Длительность (мин)</label><input type="number" value={newTest.duration_minutes} onChange={(e) => setNewTest((p) => ({ ...p, duration_minutes: Number(e.target.value) }))} /></div>
                        <button className="btn-primary" type="submit">Создать тест</button>
                    </form>
                    {editingQuestionId && <button type="button" className="btn-secondary" onClick={() => { setEditingQuestionId(null); setNewQuestion({ question_type: 'single_choice', text: '', order: 1, points: 1, passage_text: '' }); }}>Отмена редактирования</button>}

                    <div className="admin-table-wrapper">
                        <table className="table admin-table">
                            <thead><tr><th>Тест</th><th>Уровень</th><th>Публикация</th><th>Видимость для студента</th><th></th></tr></thead>
                            <tbody>{tests.map((t) => (<tr key={t.id}><td><button className="btn-secondary" type="button" onClick={() => setSelectedTestId(String(t.id))}>{t.title}</button></td><td>{t.level}</td><td><input type="checkbox" checked={t.is_published} onChange={(e) => handleTestPublishToggle(t.id, e.target.checked)} /></td><td>{t.is_published ? 'Доступен (при назначении)' : 'Скрыт от студентов'}</td><td><button className="btn-secondary" type="button" onClick={async () => { if (!window.confirm('Вы уверены, что хотите удалить весь тест? Все вопросы тестирования также будут удалены.')) return; await deleteAdminTest(token, t.id); await loadBaseData(); if (String(t.id) === String(selectedTestId)) { setSelectedTestId(''); setSelectedQuestionId(''); setQuestions([]); setOptions([]); setAssignments([]);} }}>Удалить</button></td></tr>))}</tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="admin-grid">
                <div className="admin-card">
                    <h2 className="admin-card__title">Вопросы и варианты</h2>
                    <p className="admin-card__subtitle">Выбранный тест: {tests.find((t) => String(t.id) === String(selectedTestId))?.title || '—'}</p>
                    <form className="admin-form" onSubmit={handleCreateQuestion}>
                        <div className="admin-field"><label>Тип вопроса</label><select value={newQuestion.question_type} onChange={(e) => setNewQuestion((p) => ({ ...p, question_type: e.target.value }))}><option value="single_choice">Single choice</option><option value="reading_single_choice">Reading single choice</option></select></div>
                        <div className="admin-field"><label>Текст вопроса</label><input value={newQuestion.text} onChange={(e) => setNewQuestion((p) => ({ ...p, text: e.target.value }))} /></div>
                        <div className="admin-field"><label>Текст для чтения (опционально)</label><textarea value={newQuestion.passage_text} onChange={(e) => setNewQuestion((p) => ({ ...p, passage_text: e.target.value }))} /></div>
                        <button className="btn-primary" type="submit">{editingQuestionId ? 'Обновить вопрос' : 'Добавить вопрос'}</button>
                    </form>
                    {editingQuestionId && <button type="button" className="btn-secondary" onClick={() => { setEditingQuestionId(null); setNewQuestion({ question_type: 'single_choice', text: '', order: 1, points: 1, passage_text: '' }); }}>Отмена редактирования</button>}

                    <div className="admin-table-wrapper">
                        <table className="table admin-table">
                            <thead><tr><th>ID</th><th>Вопрос</th><th>Тип</th><th>Действия</th></tr></thead>
                            <tbody>{questions.map((q) => (<tr key={q.id}><td>{q.id}</td><td><button className="btn-secondary" type="button" onClick={() => setSelectedQuestionId(String(q.id))}>{q.text}</button></td><td>{q.question_type}</td><td><button className="btn-secondary" type="button" onClick={() => { setEditingQuestionId(q.id); setNewQuestion({ question_type: q.question_type, text: q.text, order: q.order, points: q.points, passage_text: q.passage_text || '' }); }}>Редактировать</button> <button className="btn-secondary" type="button" onClick={async () => { if (!window.confirm('Вы уверены, что хотите удалить вопрос?')) return; await deleteQuestion(token, q.id); const qData = await getQuestions(token, selectedTestId); setQuestions(qData); if (String(q.id) === selectedQuestionId) { setSelectedQuestionId(''); setOptions([]); } }}>Удалить</button></td></tr>))}</tbody>
                        </table>
                    </div>

                    <form className="admin-form" onSubmit={handleCreateOption}>
                        <div className="admin-field"><label>Вариант ответа</label><input value={newOption.text} onChange={(e) => setNewOption((p) => ({ ...p, text: e.target.value }))} /></div>
                        <div className="admin-field"><label><input type="checkbox" checked={newOption.is_correct} onChange={(e) => setNewOption((p) => ({ ...p, is_correct: e.target.checked }))} /> Правильный</label></div>
                        <button className="btn-secondary" type="submit">Добавить вариант</button>
                    </form>
                    {editingQuestionId && <button type="button" className="btn-secondary" onClick={() => { setEditingQuestionId(null); setNewQuestion({ question_type: 'single_choice', text: '', order: 1, points: 1, passage_text: '' }); }}>Отмена редактирования</button>}

                    <div className="admin-table-wrapper">
                        <table className="table admin-table">
                            <thead><tr><th>Текст</th><th>Правильный</th><th></th></tr></thead>
                            <tbody>{options.map((o) => (<tr key={o.id}><td>{o.text}</td><td>{o.is_correct ? 'Да' : 'Нет'}</td><td><button type="button" className="btn-secondary" onClick={async () => { if (!window.confirm('Вы уверены, что хотите удалить вариант ответа?')) return; await deleteOption(token, o.id); const data = await getOptions(token, selectedQuestionId); setOptions(data); }}>Удалить</button></td></tr>))}</tbody>
                        </table>
                    </div>
                </div>

                <div className="admin-card">
                    <h2 className="admin-card__title">Назначения тестов группам</h2>
                    <form className="admin-form" onSubmit={handleAssign}>
                        <div className="admin-field"><label>Тест</label><select value={selectedTestId} onChange={(e) => setSelectedTestId(e.target.value)}><option value="">Выберите тест</option>{tests.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select></div>
                        <div className="admin-field">
                            <label>Группы</label>
                            <div className="admin-checkboxes">
                                {groups.map((g) => (
                                    <label key={g.id}>
                                        <input
                                            type="checkbox"
                                            checked={assignmentGroupIds.includes(g.id)}
                                            onChange={(e) => {
                                                setAssignmentGroupIds((prev) => e.target.checked ? [...prev, g.id] : prev.filter((id) => id !== g.id));
                                            }}
                                        /> {g.code}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <button className="btn-primary" type="submit">Назначить тест</button>
                    </form>
                    {editingQuestionId && <button type="button" className="btn-secondary" onClick={() => { setEditingQuestionId(null); setNewQuestion({ question_type: 'single_choice', text: '', order: 1, points: 1, passage_text: '' }); }}>Отмена редактирования</button>}

                    <div className="admin-table-wrapper">
                        <table className="table admin-table">
                            <thead><tr><th>Тест</th><th>Группа</th><th>Дата</th></tr></thead>
                            <tbody>{assignments.map((a) => (<tr key={a.id}><td>{a.test_title}</td><td>{a.group_code}</td><td>{new Date(a.assigned_at).toLocaleDateString('ru-RU')}</td></tr>))}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
