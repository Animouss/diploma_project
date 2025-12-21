import React, { useState } from "react";

const initialUsers = [
    {
        id: 1,
        fullName: "Иванов Иван Иванович",
        login: "ivanov_i",
        role: "Студент",
        group: "ИТ-21-01"
    },
    {
        id: 2,
        fullName: "Петрова Анна Сергеевна",
        login: "petrova_a",
        role: "Преподаватель",
        group: "Кафедра русского языка"
    }
];

const AdminPanel = () => {
    const [users, setUsers] = useState(initialUsers);

    const [fullName, setFullName] = useState("");
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("Студент");
    const [group, setGroup] = useState("");
    const [message, setMessage] = useState("");

    const handleCreateUser = (e) => {
        e.preventDefault();

        if (!fullName.trim() || !login.trim() || !password.trim()) {
            setMessage("Заполните, пожалуйста, все обязательные поля.");
            return;
        }

        const newUser = {
            id: Date.now(),
            fullName,
            login,
            role,
            group: group || (role === "Студент" ? "—" : "—")
        };

        setUsers((prev) => [...prev, newUser]);
        setMessage("Аккаунт успешно создан!");

        // очищаем форму
        setFullName("");
        setLogin("");
        setPassword("");
        setRole("Студент");
        setGroup("");
    };

    return (
        <div className="page">
            <h1 className="page__title">Административная панель</h1>
            <p className="page__subtitle">
                Раздел предназначен для создания учётных записей студентов и преподавателей,
                а также для управления пользователями системы тестирования.
            </p>

            <div className="admin-grid">
                {/* Левая колонка — форма создания аккаунта */}
                <div className="admin-card">
                    <h2 className="admin-card__title">Создание аккаунта</h2>
                    <p className="admin-card__subtitle">
                        В демонстрационной версии данные сохраняются только на стороне клиента,
                        без записи в базу данных.
                    </p>

                    <form className="admin-form" onSubmit={handleCreateUser}>
                        <div className="admin-field">
                            <label htmlFor="fullName">ФИО пользователя</label>
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Например, Иванов Иван Иванович"
                            />
                        </div>

                        <div className="admin-field">
                            <label htmlFor="login">Логин</label>
                            <input
                                id="login"
                                type="text"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                                placeholder="ivanov_i"
                            />
                        </div>

                        <div className="admin-field">
                            <label htmlFor="password">Пароль</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Задайте пароль"
                            />
                        </div>

                        <div className="admin-field">
                            <label htmlFor="role">Роль</label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option>Студент</option>
                                <option>Преподаватель</option>
                                <option>Администратор</option>
                            </select>
                        </div>

                        <div className="admin-field">
                            <label htmlFor="group">
                                Группа / подразделение <span className="admin-field__optional">(необязательно)</span>
                            </label>
                            <input
                                id="group"
                                type="text"
                                value={group}
                                onChange={(e) => setGroup(e.target.value)}
                                placeholder="Например, ИТ-21-01"
                            />
                        </div>

                        <button type="submit" className="btn-primary admin-submit">
                            Создать аккаунт
                        </button>

                        {message && <div className="admin-message">{message}</div>}
                    </form>
                </div>

                {/* Правая колонка — список пользователей */}
                <div className="admin-card">
                    <h2 className="admin-card__title">Список пользователей</h2>
                    <div className="admin-table-wrapper">
                        <table className="table admin-table">
                            <thead>
                            <tr>
                                <th>ФИО</th>
                                <th>Логин</th>
                                <th>Роль</th>
                                <th>Группа / подразделение</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td>{u.fullName}</td>
                                    <td>{u.login}</td>
                                    <td>{u.role}</td>
                                    <td>{u.group}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
