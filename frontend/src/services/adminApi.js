const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getAdminHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const stored = localStorage.getItem('cine_auth');
    if (stored) {
      const user = JSON.parse(stored);
      if (user?.id) headers['X-User-Id'] = String(user.id);
    }
  } catch { /* ignore */ }
  return headers;
}

async function handleResponse(response) {
  if (response.ok) {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }
  let message = 'Request failed';
  try {
    const err = await response.json();
    message = err.message || err.error || message;
  } catch {
    message = response.statusText || message;
  }
  throw new Error(message);
}

async function adminRequest(method, path, body) {
  const response = await fetch(`${API_BASE}/admin${path}`, {
    method,
    headers: getAdminHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse(response);
}

export const adminGet = (path) => adminRequest('GET', path);
export const adminPost = (path, body) => adminRequest('POST', path, body);
export const adminPut = (path, body) => adminRequest('PUT', path, body);
export const adminDelete = (path) => adminRequest('DELETE', path);

// Movies
export const adminGetMovies = () => adminGet('/movies');
export const adminCreateMovie = (data) => adminPost('/movies', data);
export const adminUpdateMovie = (id, data) => adminPut(`/movies/${id}`, data);
export const adminDeleteMovie = (id) => adminDelete(`/movies/${id}`);

// Theaters
export const adminGetTheaters = () => adminGet('/theaters');
export const adminCreateTheater = (data) => adminPost('/theaters', data);
export const adminUpdateTheater = (id, data) => adminPut(`/theaters/${id}`, data);
export const adminDeleteTheater = (id) => adminDelete(`/theaters/${id}`);

// Screens
export const adminGetScreens = () => adminGet('/screens');
export const adminGetScreensByTheater = (theaterId) => adminGet(`/screens/theater/${theaterId}`);
export const adminCreateScreen = (data) => adminPost('/screens', data);
export const adminUpdateScreen = (id, data) => adminPut(`/screens/${id}`, data);
export const adminDeleteScreen = (id) => adminDelete(`/screens/${id}`);

// Shows
export const adminGetShows = () => adminGet('/shows');
export const adminCreateShow = (data) => adminPost('/shows', data);
export const adminUpdateShow = (id, data) => adminPut(`/shows/${id}`, data);
export const adminDeleteShow = (id) => adminDelete(`/shows/${id}`);
