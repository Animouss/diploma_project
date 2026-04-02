const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '');

export class ApiError extends Error {
    constructor(message, status, payload = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.payload = payload;
    }
}

export const getApiBaseUrl = () => API_BASE_URL;

const extractErrorMessage = (payload) => {
    if (!payload) return 'Ошибка запроса к API';

    if (typeof payload.detail === 'string') return payload.detail;
    if (typeof payload.message === 'string') return payload.message;
    if (typeof payload.error === 'string') return payload.error;

    if (Array.isArray(payload.non_field_errors) && payload.non_field_errors.length) {
        return payload.non_field_errors[0];
    }

    for (const value of Object.values(payload)) {
        if (Array.isArray(value) && value.length && typeof value[0] === 'string') {
            return value[0];
        }
        if (typeof value === 'string') {
            return value;
        }
    }

    return 'Ошибка запроса к API';
};

export const request = async (path, options = {}) => {
    const url = `${API_BASE_URL}${path}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
    });

    let payload = null;
    const text = await response.text();

    if (text) {
        try {
            payload = JSON.parse(text);
        } catch {
            payload = { detail: text };
        }
    }

    if (!response.ok) {
        throw new ApiError(extractErrorMessage(payload), response.status, payload);
    }

    return payload;
};