import apiClient from './apiClient';

export const getAllTheaters = async () => {
  const response = await apiClient.get('/theaters');
  return response.data;
};

export const getTheaterById = async (id) => {
  const response = await apiClient.get(`/theaters/${id}`);
  return response.data;
};

export const getTheatersByCity = async (city) => {
  const response = await apiClient.get(`/theaters/city/${city}`);
  return response.data;
};

export const createTheater = async (theaterDto) => {
  const response = await apiClient.post('/theaters', theaterDto);
  return response.data;
};

export const updateTheater = async (id, theaterDto) => {
  const response = await apiClient.put(`/theaters/${id}`, theaterDto);
  return response.data;
};

export const deleteTheater = async (id) => {
  const response = await apiClient.delete(`/theaters/${id}`);
  return response.data;
};
