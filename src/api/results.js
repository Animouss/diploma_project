import { request } from './client';

const authHeaders = (token) => ({ Authorization: `Token ${token}` });

export const getMyResultsRequest = (token) =>
    request('/results/me/', {
        headers: authHeaders(token)
    });

export const getResultsOverviewRequest = (token, filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.set(key, value);
        }
    });

    const query = params.toString();

    return request(`/results/overview/${query ? `?${query}` : ''}`, {
        headers: authHeaders(token)
    });
};

export const getResultDetailRequest = (token, resultId) =>
    request(`/results/${resultId}/`, {
        headers: authHeaders(token)
    });
