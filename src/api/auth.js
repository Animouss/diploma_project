import { request } from './client';

const DEMO_USERS = {
    student: {
        password: 'student123',
        user: {
            id: 101,
            fullName: 'Студент Демонстрационный',
            username: 'student',
            role: 'student',
            group: 'ИТ-21-01',
            level: 'B1'
        }
    },
    teacher: {
        password: 'teacher123',
        user: {
            id: 102,
            fullName: 'Преподаватель Демонстрационный',
            username: 'teacher',
            role: 'teacher',
            group: 'Кафедра русского языка',
            level: 'C1'
        }
    },
    admin: {
        password: 'admin123',
        user: {
            id: 1,
            fullName: 'Администратор Системы',
            username: 'admin',
            role: 'admin',
            group: 'Администрация',
            level: 'C2'
        }
    }
};

const loginByApi = async (login, password) => {
    const payload = await request('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username: login, password })
    });

    return {
        token: payload.access || payload.token,
        user: payload.user
    };
};

const loginByDemo = (login, password) => {
    const demo = DEMO_USERS[login];
    if (!demo || demo.password !== password) {
        throw new Error('Неверный логин или пароль');
    }

    return {
        token: `demo-token-${login}`,
        user: demo.user,
        mode: 'demo'
    };
};

export const loginRequest = async (login, password) => {
    try {
        return await loginByApi(login, password);
    } catch {
        return loginByDemo(login, password);
    }
};

export const getCurrentUserRequest = async (token) => {
    if (!token) {
        throw new Error('Токен отсутствует');
    }

    if (token.startsWith('demo-token-')) {
        const login = token.replace('demo-token-', '');
        return DEMO_USERS[login]?.user || null;
    }

    const payload = await request('/auth/me/', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return payload?.user || payload;
};
