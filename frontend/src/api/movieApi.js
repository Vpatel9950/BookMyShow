import apiClient from './apiClient';

export const getAllMovies = async () => {
  const response = await apiClient.get('/movies');
  return response.data;
};

export const getMovieById = async (id) => {
  const response = await apiClient.get(`/movies/${id}`);
  return response.data;
};

export const searchMovies = async (title) => {
  const response = await apiClient.get('/movies/search', { params: { title } });
  return response.data;
};

export const getMoviesByLanguage = async (language) => {
  const response = await apiClient.get(`/movies/language/${language}`);
  return response.data;
};

export const getMoviesByGenre = async (genre) => {
  const response = await apiClient.get(`/movies/genre/${genre}`);
  return response.data;
};

export const createMovie = async (movieData) => {
  const response = await apiClient.post('/movies', movieData);
  return response.data;
};

export const updateMovie = async (id, movieData) => {
  const response = await apiClient.put(`/movies/${id}`, movieData);
  return response.data;
};

export const deleteMovie = async (id) => {
  const response = await apiClient.delete(`/movies/${id}`);
  return response.data;
};
