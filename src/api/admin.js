import { request } from './client';

const authHeaders = (token) => ({
    Authorization: `Token ${token}`
});

export const getUsers = (token) => request('/admin/users/', { headers: authHeaders(token) });
export const createUser = (token, payload) => request('/admin/users/', { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payload) });
export const updateUser = (token, id, payload) => request(`/admin/users/${id}/`, { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify(payload) });
export const deactivateUser = (token, id) => request(`/admin/users/${id}/`, { method: 'DELETE', headers: authHeaders(token) });

export const getGroups = (token) => request('/admin/groups/', { headers: authHeaders(token) });
export const createGroup = (token, payload) => request('/admin/groups/', { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payload) });
export const updateGroup = (token, id, payload) => request(`/admin/groups/${id}/`, { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify(payload) });

export const getAdminTests = (token) => request('/admin/tests/', { headers: authHeaders(token) });
export const createAdminTest = (token, payload) => request('/admin/tests/', { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payload) });
export const updateAdminTest = (token, id, payload) => request(`/admin/tests/${id}/`, { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify(payload) });

export const getQuestions = (token, testId) => request(`/admin/questions/?test_id=${testId}`, { headers: authHeaders(token) });
export const createQuestion = (token, payload) => request('/admin/questions/', { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payload) });
export const updateQuestion = (token, id, payload) => request(`/admin/questions/${id}/`, { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify(payload) });

export const getOptions = (token, questionId) => request(`/admin/options/?question_id=${questionId}`, { headers: authHeaders(token) });
export const createOption = (token, payload) => request('/admin/options/', { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payload) });

export const getAssignments = (token, testId) => request(`/admin/assignments/?test_id=${testId}`, { headers: authHeaders(token) });
export const assignTestToGroups = (token, payload) => request('/admin/assignments/', { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payload) });
