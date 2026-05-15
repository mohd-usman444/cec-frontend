import { create } from 'zustand';
import api from '../api/axios';

const useWorkerStore = create((set) => ({
  workers: [],
  isLoading: false,
  error: null,

  fetchWorkers: async (siteId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/workers/${siteId}`);
      set({ workers: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Failed to fetch workers' });
    }
  },

  addWorker: async (workerData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/workers', workerData);
      set((state) => ({ 
        workers: [response.data, ...state.workers], 
        isLoading: false 
      }));
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Failed to add worker' });
      return null;
    }
  },

  updateWorker: async (id, workerData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/workers/${id}`, workerData);
      set((state) => ({
        workers: state.workers.map(w => w._id === id ? response.data : w),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Failed to update worker' });
      return false;
    }
  },

  deleteWorker: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/workers/${id}`);
      set((state) => ({
        workers: state.workers.filter(w => w._id !== id),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Failed to delete worker' });
      return false;
    }
  }
}));

export default useWorkerStore;
