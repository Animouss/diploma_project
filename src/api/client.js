const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '');

export class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

export const getApiBaseUrl = () => API_BASE_URL;

export const request = async (path, options = {}) => {
    const url = `${API_BASE_URL}${path}`;
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        ...options
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
        const message = payload?.detail || payload?.message || 'Ошибка запроса к API';
        throw new ApiError(message, response.status);
    }

    return payload;
};
