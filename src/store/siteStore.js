import { create } from 'zustand';
import api from '../api/axios';

const useSiteStore = create((set, get) => ({
  sites: [],
  currentSite: null,
  stats: {
    totalWorkerSpend: 0,
    totalSupplierSpend: 0,
    totalSites: 0
  },
  isLoading: false,
  error: null,

  fetchStats: async () => {
    try {
      const response = await api.get('/sites/stats');
      set({ stats: response.data });
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  },

  fetchSites: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/sites');
      set({ sites: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Failed to fetch sites' });
    }
  },

  getSiteDetails: async (idOrSlug) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/sites/${idOrSlug}`);
      set({ currentSite: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Failed to fetch site details' });
      return null;
    }
  },

  createSite: async (siteData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/sites', siteData);
      set((state) => ({ 
        sites: [response.data, ...state.sites], 
        isLoading: false 
      }));
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Failed to create site' });
      return null;
    }
  },

  updateSite: async (id, siteData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/sites/${id}`, siteData);
      set((state) => ({
        sites: state.sites.map((site) => (site._id === id ? response.data : site)),
        currentSite: state.currentSite?._id === id ? response.data : state.currentSite,
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Failed to update site' });
      return null;
    }
  },

  clearCurrentSite: () => set({ currentSite: null })
}));

export default useSiteStore;
