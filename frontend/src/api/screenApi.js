import apiClient from './apiClient';

export const getAllScreens = async () => {
  const response = await apiClient.get('/screens');
  return response.data;
};

export const getScreenById = async (id) => {
  const response = await apiClient.get(`/screens/${id}`);
  return response.data;
};

export const getScreensByTheater = async (theaterId) => {
  const response = await apiClient.get(`/screens/theater/${theaterId}`);
  return response.data;
};

export const createScreen = async (screenDto) => {
  const response = await apiClient.post('/screens', screenDto);
  return response.data;
};

export const updateScreen = async (id, screenDto) => {
  const response = await apiClient.put(`/screens/${id}`, screenDto);
  return response.data;
};

export const deleteScreen = async (id) => {
  const response = await apiClient.delete(`/screens/${id}`);
  return response.data;
};
