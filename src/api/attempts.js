import { request } from './client';

const authHeaders = (token) => ({ Authorization: `Token ${token}` });

const mapQuestion = (question) => ({
    id: question.id,
    questionType: question.question_type,
    text: question.text,
    points: question.points,
    passageText: question.passage_text || '',
    options: (question.options || []).map((option) => ({ id: option.id, text: option.text }))
});

const mapAttemptPayload = (payload) => ({
    attemptId: payload.id,
    status: payload.status,
    startedAt: payload.started_at,
    finishedAt: payload.finished_at,
    test: {
        id: payload.test.id,
        title: payload.test.title,
        durationMinutes: payload.test.duration_minutes,
        questions: (payload.test.questions || []).map(mapQuestion)
    }
});

export const startAttemptRequest = async (token, testId) => {
    const payload = await request(`/tests/${testId}/start/`, {
        method: 'POST',
        headers: authHeaders(token)
    });

    return {
        ...mapAttemptPayload(payload),
        remainingSeconds: payload.remaining_seconds,
    };
};

export const getAttemptRequest = async (token, attemptId) => {
    const payload = await request(`/attempts/${attemptId}/`, {
        headers: authHeaders(token)
    });

    return mapAttemptPayload(payload);
};

export const saveAttemptAnswerRequest = async (token, attemptId, questionId, optionId) =>
    request(`/attempts/${attemptId}/answers/`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ question_id: questionId, option_id: optionId })
    });

export const finishAttemptRequest = async (token, attemptId) =>
    request(`/attempts/${attemptId}/finish/`, {
        method: 'POST',
        headers: authHeaders(token)
    });
