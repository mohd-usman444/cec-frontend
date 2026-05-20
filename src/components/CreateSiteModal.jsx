import React, { useState, useEffect, useRef } from 'react';
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

  const [showCalendar, setShowCalendar] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const calendarRef = useRef(null);

  const { createSite, isLoading } = useSiteStore();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const parseDateStr = (dateStr) => {
    if (!dateStr || !/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return null;
    const [day, month, year] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    if (d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day) {
      return d;
    }
    return null;
  };

  const isValidDateFormat = (dateStr) => {
    if (!/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return false;
    const [day, month, year] = dateStr.split('-').map(Number);
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > 2100) return false;
    const daysInMonth = new Date(year, month, 0).getDate();
    return day <= daysInMonth;
  };

  const handleDateChange = (e) => {
    const inputVal = e.target.value;
    const isDeleting = inputVal.length < formData.startDate.length;
    
    if (isDeleting) {
      setFormData({ ...formData, startDate: inputVal });
      return;
    }
    
    const clean = inputVal.replace(/\D/g, '');
    let formatted = clean;
    if (clean.length > 2) {
      formatted = `${clean.slice(0, 2)}-${clean.slice(2)}`;
    }
    if (clean.length > 4) {
      formatted = `${clean.slice(0, 2)}-${clean.slice(2, 4)}-${clean.slice(4, 8)}`;
    }
    
    setFormData({ ...formData, startDate: formatted.slice(0, 10) });
  };

  const handleSelectCell = (cell) => {
    const dayStr = String(cell.day).padStart(2, '0');
    const monthStr = String(cell.month + 1).padStart(2, '0');
    const dateVal = `${dayStr}-${monthStr}-${cell.year}`;
    setFormData({ ...formData, startDate: dateVal });
    setShowCalendar(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('[CreateSite] Form data:', formData);
    console.log('[CreateSite] Token exists:', !!sessionStorage.getItem('token'));

    if (!formData.siteName.trim()) {
      toast.error('Please enter site name.');
      return;
    }

    if (!formData.siteLocation.trim()) {
      toast.error('Please enter site location.');
      return;
    }

    if (!formData.startDate.trim()) {
      toast.error('Please select site start date.');
      return;
    }

    if (!isValidDateFormat(formData.startDate)) {
      toast.error('Please enter date in DD-MM-YYYY format.');
      return;
    }

    // Convert DD-MM-YYYY to YYYY-MM-DD for backend
    const [day, month, year] = formData.startDate.split('-');
    const isoDate = `${year}-${month}-${day}`;
    console.log('[CreateSite] Formatted Date:', isoDate);

    const payload = {
      ...formData,
      startDate: isoDate
    };

    const newSite = await createSite(payload);
    if (newSite) {
      toast.success('Site created successfully!');
      setFormData({ siteName: '', siteLocation: '', startDate: '', description: '' });
      onClose();
    } else {
      const storeError = useSiteStore.getState().error;
      console.log('[CreateSite] API error message:', storeError);
      toast.error(storeError || 'Failed to create site.');
    }
  };

  const generateCalendarCells = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    
    const prevMonthDays = new Date(year, month, 0).getDate();
    const cells = [];
    
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        month: month === 0 ? 11 : month - 1,
        year: month === 0 ? year - 1 : year
      });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        day: i,
        isCurrentMonth: true,
        month: month,
        year: year
      });
    }
    
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        day: i,
        isCurrentMonth: false,
        month: month === 11 ? 0 : month + 1,
        year: month === 11 ? year + 1 : year
      });
    }
    
    return cells;
  };

  const isCellSelected = (cell) => {
    const selected = parseDateStr(formData.startDate);
    if (!selected) return false;
    return selected.getDate() === cell.day && 
           selected.getMonth() === cell.month && 
           selected.getFullYear() === cell.year;
  };

  const isCellToday = (cell) => {
    const today = new Date();
    return today.getDate() === cell.day &&
           today.getMonth() === cell.month &&
           today.getFullYear() === cell.year;
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);
  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

        {/* Background overlay */}
        <div className="fixed inset-0 bg-navy-900 bg-opacity-75 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-navy-800 rounded-xl border border-navy-700 text-left overflow-visible shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-2xl leading-6 font-heading font-bold text-white tracking-wide" id="modal-title">
                  Create New Site
                </h3>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
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
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative" ref={calendarRef}>
                    <div 
                      className="absolute inset-y-0 left-0 pl-3 flex items-center cursor-pointer z-10"
                      onClick={() => setShowCalendar(!showCalendar)}
                    >
                      <Calendar className="h-5 w-5 text-gray-500 hover:text-gold-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      name="startDate"
                      className="input-field pl-10 cursor-pointer"
                      placeholder="DD-MM-YYYY"
                      value={formData.startDate}
                      onFocus={() => {
                        setShowCalendar(true);
                        const parsed = parseDateStr(formData.startDate);
                        if (parsed) setViewDate(parsed);
                      }}
                      onChange={handleDateChange}
                    />

                    {/* Custom Calendar Popover */}
                    {showCalendar && (
                      <div className="absolute left-0 mt-1 w-full max-w-sm bg-navy-900 border border-navy-700 rounded-lg shadow-2xl p-4 z-50 animate-slide-down">
                        <div className="flex justify-between items-center mb-3">
                          <select
                            value={viewDate.getMonth()}
                            onChange={(e) => setViewDate(new Date(viewDate.getFullYear(), parseInt(e.target.value), 1))}
                            className="bg-navy-800 border border-navy-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-gold-500 cursor-pointer"
                          >
                            {monthsList.map((m, idx) => (
                              <option key={m} value={idx}>{m}</option>
                            ))}
                          </select>

                          <select
                            value={viewDate.getFullYear()}
                            onChange={(e) => setViewDate(new Date(parseInt(e.target.value), viewDate.getMonth(), 1))}
                            className="bg-navy-800 border border-navy-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-gold-500 cursor-pointer"
                          >
                            {years.map((y) => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400 mb-2">
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                            <div key={d} className="py-1">{d}</div>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {generateCalendarCells().map((cell, idx) => {
                            const selected = isCellSelected(cell);
                            const today = isCellToday(cell);
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectCell(cell)}
                                className={`
                                  py-1.5 text-sm rounded transition-all focus:outline-none text-center
                                  ${cell.isCurrentMonth ? 'text-gray-100 font-medium' : 'text-gray-600'}
                                  ${selected 
                                    ? 'bg-gold-500 text-navy-900 font-bold' 
                                    : today 
                                      ? 'border border-gold-500/50 text-gold-400 hover:bg-navy-800' 
                                      : 'hover:bg-navy-800'}
                                `}
                              >
                                {cell.day}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
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
              </div>
            </div>

            <div className="bg-navy-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-navy-700">
              <button
                type="submit"
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSiteModal;
