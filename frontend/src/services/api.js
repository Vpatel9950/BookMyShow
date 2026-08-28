const API_BASE = import.meta.env.VITE_API_URL || '/api';

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

export async function apiGet(path) {
  const response = await fetch(`${API_BASE}${path}`);
  return handleResponse(response);
}

export async function apiPost(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse(response);
}

export async function apiPut(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse(response);
}

export async function apiDelete(path) {
  const response = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
  return handleResponse(response);
}

// Users
export const registerUser = (data) => apiPost('/users/register', data);
export const loginUser = (data) => apiPost('/users/login', data);
export const getUserById = (id) => apiGet(`/users/${id}`);

// Movies
export const getMovies = () => apiGet('/movies');
export const getMovieById = (id) => apiGet(`/movies/${id}`);
export const getMoviesByGenre = (genre) => apiGet(`/movies/genre/${genre}`);
export const createMovie = (data) => apiPost('/movies', data);
export const updateMovie = (id, data) => apiPut(`/movies/${id}`, data);
export const deleteMovie = (id) => apiDelete(`/movies/${id}`);

// Shows
export const getShowsByMovie = (movieId) => apiGet(`/shows/movie/${movieId}`);
export const getShowById = (id) => apiGet(`/shows/${id}`);
export const createShow = (data) => apiPost('/shows', data);

// Theaters
export const getTheaters = () => apiGet('/theaters');
export const getScreens = () => apiGet('/screens');

// Bookings
export const createBooking = (data) => apiPost('/bookings', data);
export const confirmBooking = (id) => apiPost(`/bookings/${id}/confirm`);
export const cancelBooking = (id) => apiPut(`/bookings/${id}/cancel`);
export const getBookingsByUser = (userId) => apiGet(`/bookings/user/${userId}`);

export default API_BASE;
