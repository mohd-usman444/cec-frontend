import React, { useState } from 'react';
import { X, MapPin, Calendar, FileText } from 'lucide-react';
import useSiteStore from '../store/siteStore';
import toast from 'react-hot-toast';

const CreateSiteModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    siteName: '',
    siteLocation: '',
    startDate: '',
    description: '',
  });
  const [dateFocus, setDateFocus] = useState(false);

  const { createSite, isLoading } = useSiteStore();

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.siteName || !formData.siteLocation || !formData.startDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newSite = await createSite(formData);
    if (newSite) {
      toast.success('Site created successfully!');
      setFormData({ siteName: '', siteLocation: '', startDate: '', description: '' });
      onClose();
    }
  };

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

        {/* Background overlay */}
        <div className="fixed inset-0 bg-navy-900 bg-opacity-75 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-navy-800 rounded-xl border border-navy-700 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-2xl leading-6 font-heading font-bold text-white tracking-wide" id="modal-title">
                Create New Site
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Site Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="siteName"
                  className="input-field"
                  placeholder="e.g. Skyline Towers"
                  value={formData.siteName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="siteLocation"
                    className="input-field pl-10"
                    placeholder="e.g. Downtown Ave, Block 4"
                    value={formData.siteLocation}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type={dateFocus ? "date" : "text"}
                    name="startDate"
                    className="input-field pl-10"
                    value={dateFocus ? formData.startDate : formatDateForDisplay(formData.startDate)}
                    onFocus={() => setDateFocus(true)}
                    onBlur={() => setDateFocus(false)}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-500" />
                  </div>
                  <textarea
                    name="description"
                    rows="3"
                    className="input-field pl-10 resize-none"
                    placeholder="Optional details about the project..."
                    value={formData.description}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
            </form>
          </div>

          <div className="bg-navy-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-navy-700">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gold-500 text-base font-medium text-navy-900 hover:bg-gold-600 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm active:scale-95 transition-all disabled:opacity-70"
            >
              {isLoading ? 'Creating...' : 'Create Site'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-navy-600 shadow-sm px-4 py-2 bg-navy-800 text-base font-medium text-gray-300 hover:bg-navy-700 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSiteModal;
