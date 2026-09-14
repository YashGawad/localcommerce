import api from './api';

export const reviewService = {
  getReviews: async (params = {}) => {
    const res = await api.get('/reviews', { params });
    return res.data?.data || [];
  },

  getReviewById: async (id) => {
    const res = await api.get(`/reviews/${id}`);
    return res.data?.data;
  },

  createReview: async (reviewData) => {
    const res = await api.post('/reviews', reviewData);
    return res.data?.data;
  },

  getMyReviews: async () => {
    const res = await api.get('/customers/me/reviews');
    return res.data?.data || [];
  },

  getGlobalProductReviews: async (globalProductId) => {
    const res = await api.get(`/global-products/${globalProductId}/reviews`);
    return res.data?.data || [];
  },
};

export default reviewService;
