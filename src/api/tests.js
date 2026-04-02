import { request } from './client';

const authHeaders = (token) => ({
    Authorization: `Token ${token}`
});

const mapTest = (test) => ({
    id: test.id,
    title: test.title,
    level: test.level,
    status: test.status || 'Не начат',
    duration: test.duration || `${test.duration_minutes} мин`
});

const mapQuestion = (question) => ({
    id: question.id,
    text: question.text,
    questionType: question.question_type,
    passageText: question.passage_text || '',
    options: (question.options || []).map((option) => ({
        id: option.id,
        text: option.text
    }))
});

export const getMyTestsRequest = async (token) => {
    const payload = await request('/tests/', {
        headers: authHeaders(token)
    });

    if (!Array.isArray(payload)) {
        return [];
    }

    return payload.map(mapTest);
};

export const getTestDetailRequest = async (token, testId) => {
    const payload = await request(`/tests/${testId}/`, {
        headers: authHeaders(token)
    });

    return {
        id: payload.id,
        title: payload.title,
        durationMinutes: payload.duration_minutes,
        questions: (payload.questions || []).map(mapQuestion)
    };
};
