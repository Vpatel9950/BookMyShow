import apiClient from './apiClient';

export const createBooking = async (bookingRequest) => {
  const response = await apiClient.post('/bookings', bookingRequest);
  return response.data;
};

export const getBookingById = async (id) => {
  const response = await apiClient.get(`/bookings/${id}`);
  return response.data;
};

export const getBookingByNumber = async (bookingNumber) => {
  const response = await apiClient.get(`/bookings/number/${bookingNumber}`);
  return response.data;
};

export const getBookingsByUser = async (userId) => {
  const response = await apiClient.get(`/bookings/user/${userId}`);
  return response.data;
};

export const getAllBookings = async () => {
  const response = await apiClient.get('/bookings');
  return response.data;
};

export const confirmBooking = async (id) => {
  const response = await apiClient.post(`/bookings/${id}/confirm`);
  return response.data;
};

export const cancelBooking = async (id) => {
  const response = await apiClient.put(`/bookings/${id}/cancel`);
  return response.data;
};
