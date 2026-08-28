import apiClient from './apiClient';

export const getAllShows = async () => {
  const response = await apiClient.get('/shows');
  return response.data;
};

export const getShowById = async (id) => {
  const response = await apiClient.get(`/shows/${id}`);
  return response.data;
};

export const getShowsByMovie = async (movieId) => {
  const response = await apiClient.get(`/shows/movie/${movieId}`);
  return response.data;
};

export const getShowsByMovieAndCity = async (movieId, city) => {
  const response = await apiClient.get(`/shows/movie/${movieId}/city/${city}`);
  return response.data;
};

export const getShowsByDateRange = async (start, end) => {
  const response = await apiClient.get('/shows/date', { params: { start, end } });
  return response.data;
};

export const createShow = async (showDto) => {
  const response = await apiClient.post('/shows', showDto);
  return response.data;
};

export const updateShow = async (id, showDto) => {
  const response = await apiClient.put(`/shows/${id}`, showDto);
  return response.data;
};

export const deleteShow = async (id) => {
  const response = await apiClient.delete(`/shows/${id}`);
  return response.data;
};
