import { request } from './client';

const mapTest = (test) => ({
    id: test.id,
    title: test.title,
    level: test.level,
    status: test.status || 'Не начат',
    duration: test.duration || `${test.duration_minutes} мин`
});

export const getMyTestsRequest = async (token) => {
    const payload = await request('/tests/', {
        headers: {
            Authorization: `Token ${token}`
        }
    });

    if (!Array.isArray(payload)) {
        return [];
    }

    return payload.map(mapTest);
};
