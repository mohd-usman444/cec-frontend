import { create } from 'zustand';
import api from '../api/axios';

const useSupplierStore = create((set) => ({
  suppliers: [],
  isLoading: false,
  error: null,

  fetchSuppliers: async (siteId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/suppliers/${siteId}`);
      set({ suppliers: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Failed to fetch suppliers' });
    }
  },

  addSupplier: async (supplierData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/suppliers', supplierData);
      set((state) => ({ 
        suppliers: [response.data, ...state.suppliers], 
        isLoading: false 
      }));
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Failed to add supplier' });
      return null;
    }
  },

  updateSupplier: async (id, supplierData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/suppliers/${id}`, supplierData);
      set((state) => ({
        suppliers: state.suppliers.map(s => s._id === id ? response.data : s),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Failed to update supplier' });
      return false;
    }
  },

  deleteSupplier: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/suppliers/${id}`);
      set((state) => ({
        suppliers: state.suppliers.filter(s => s._id !== id),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Failed to delete supplier' });
      return false;
    }
  }
}));

export default useSupplierStore;
