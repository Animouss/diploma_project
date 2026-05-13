const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '');

export class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

const extractErrorMessage = (payload) => {
    if (!payload) return null;
    if (typeof payload === 'string') return payload;
    if (Array.isArray(payload)) return payload[0];
    if (payload.non_field_errors?.[0]) return payload.non_field_errors[0];
    if (payload.detail) return payload.detail;
    if (payload.message) return payload.message;
    const first = Object.values(payload).find((v) => Array.isArray(v) ? v.length : v);
    if (Array.isArray(first)) return first[0];
    if (typeof first === 'string') return first;
    return null;
};

export const getApiBaseUrl = () => API_BASE_URL;

export const request = async (path, options = {}) => {
    const url = `${API_BASE_URL}${path}`;
    const headers = { ...(options.headers || {}) };
    const hasBody = Object.prototype.hasOwnProperty.call(options, 'body') && options.body !== undefined && options.body !== null;
    if (hasBody && !(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, { ...options, headers });

    let payload = null;
    const text = await response.text();
    if (text) {
        try { payload = JSON.parse(text); } catch { payload = { detail: text }; }
    }

    if (!response.ok) {
        const message = extractErrorMessage(payload) || 'Ошибка запроса к API';
        throw new ApiError(message, response.status);
    }

    return payload;
};
