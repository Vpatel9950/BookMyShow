import apiClient from './apiClient';

export const createRazorpayOrder = async (bookingId, amount) => {
  const response = await apiClient.post('/payments/create-order', { bookingId, amount });
  return response.data;
};

export const getPaymentById = async (id) => {
  const response = await apiClient.get(`/payments/${id}`);
  return response.data;
};
