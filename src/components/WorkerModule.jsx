import React, { useEffect, useState } from 'react';
import useWorkerStore from '../store/workerStore';
import { Plus, Trash2, Edit, Search, Download, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const WorkerModule = ({ siteId, isCompleted, isReadOnly }) => {
  const canEdit = !isCompleted && !isReadOnly;
  const { workers, fetchWorkers, addWorker, updateWorker, deleteWorker, isLoading } = useWorkerStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    workerName: '',
    role: '',
    phoneNumber: '',
    dailyWage: '',
    daysWorked: '',
    dateOfPayment: new Date().toISOString().split('T')[0],
    paymentMode: 'Pending',
    notes: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFocus, setDateFocus] = useState(false);

  useEffect(() => {
    if (siteId) fetchWorkers(siteId);
  }, [siteId, fetchWorkers]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (worker) => {
    setFormData({
      workerName: worker.workerName,
      role: worker.role,
      phoneNumber: worker.phoneNumber || '',
      dailyWage: worker.dailyWage,
      daysWorked: worker.daysWorked,
      dateOfPayment: new Date(worker.dateOfPayment).toISOString().split('T')[0],
      paymentMode: worker.paymentMode,
      notes: worker.notes || '',
    });
    setEditingId(worker._id);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.workerName || !formData.role || !formData.dailyWage) {
      toast.error('Please fill all required fields');
      return;
    }

    if (editingId) {
      const success = await updateWorker(editingId, formData);
      if (success) {
        toast.success('Worker entry updated!');
        resetForm();
      }
    } else {
      const success = await addWorker({ ...formData, siteId });
      if (success) {
        toast.success('Worker entry added!');
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({
      workerName: '', role: '', phoneNumber: '', dailyWage: '', daysWorked: '',
      dateOfPayment: new Date().toISOString().split('T')[0], paymentMode: 'Pending', notes: ''
    });
  };

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      const success = await deleteWorker(id);
      if (success) toast.success('Entry deleted');
    }
  };

  const exportToCSV = () => {
    const data = filteredWorkers.map(w => ({
      Date: new Date(w.dateOfPayment).toLocaleDateString('en-GB'),
      Worker: w.workerName,
      Role: w.role,
      Amount: w.totalAmount,
      Status: w.paymentMode,
      Notes: w.notes || ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Worker Expenses");
    XLSX.writeFile(workbook, `Worker_Expenses_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exporting to Excel...');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Worker Expenses Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString('en-GB')}`, 14, 30);
    doc.text(`Total Spend: INR ${totalSpend.toFixed(2)}`, 14, 38);

    let yPos = 50;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Date", 14, yPos);
    doc.text("Worker", 40, yPos);
    doc.text("Role", 80, yPos);
    doc.text("Amount", 120, yPos);
    doc.text("Status", 160, yPos);

    yPos += 10;
    doc.line(14, yPos - 5, 195, yPos - 5);

    filteredWorkers.forEach((w) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(10);
      doc.text(new Date(w.dateOfPayment).toLocaleDateString('en-GB'), 14, yPos);
      doc.text(w.workerName, 40, yPos);
      doc.text(w.role, 80, yPos);
      doc.text(`INR ${w.totalAmount.toFixed(2)}`, 120, yPos);
      doc.text(w.paymentMode, 160, yPos);
      yPos += 8;
    });

    doc.save(`Worker_Expenses_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Exporting to PDF...');
  };

  // Calculate totals
  const filteredWorkers = workers.filter(worker =>
    worker.workerName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalSpend = workers.reduce((sum, w) => sum + w.totalAmount, 0);

  return (
    <div className="card border-t-2 border-t-gold-500 w-full max-w-full overflow-hidden">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div className="flex justify-between items-start w-full md:w-auto">
          <div>
            <h2 className="text-xl font-heading font-bold text-white">Worker Expenses</h2>
            <p className="text-gray-400 text-sm mt-1">Total Workers Logged: {filteredWorkers.length}</p>
          </div>
          <div className="flex md:hidden gap-2">
            <button onClick={exportToCSV} className="p-1.5 bg-navy-700 hover:bg-navy-600 rounded text-gray-300 transition-colors h-fit" title="Export to Excel">
              <Download className="h-4 w-4" />
            </button>
            <button onClick={exportToPDF} className="p-1.5 bg-navy-700 hover:bg-navy-600 rounded text-gray-300 transition-colors h-fit" title="Export to PDF">
              <FileText className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full md:w-auto">
          <div className="flex justify-between sm:block w-full sm:w-auto bg-navy-900/50 sm:bg-transparent p-4 sm:p-0 rounded-lg sm:rounded-none">
            <p className="text-sm text-gray-400">Total Spend</p>
            <p className="text-2xl font-bold text-gold-500">₹{totalSpend.toFixed(2)}</p>
          </div>
          <div className="hidden md:flex gap-2">
            <button onClick={exportToCSV} className="p-1.5 bg-navy-700 hover:bg-navy-600 rounded text-gray-300 transition-colors" title="Export to Excel">
              <Download className="h-4 w-4" />
            </button>
            <button onClick={exportToPDF} className="p-1.5 bg-navy-700 hover:bg-navy-600 rounded text-gray-300 transition-colors" title="Export to PDF">
              <FileText className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isCompleted && (
        <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-3 text-blue-400">
          <FileText className="h-5 w-5" />
          <p className="text-sm font-medium">Site is marked as Completed. This module is in Read-Only mode.</p>
        </div>
      )}

      {isReadOnly && !isCompleted && (
        <div className="mb-6 p-3 bg-gold-500/10 border border-gold-500/20 rounded-lg flex items-center gap-3 text-gold-500">
          <FileText className="h-5 w-5" />
          <p className="text-sm font-medium">You have view-only access. Contact your admin for modifications.</p>
        </div>
      )}

      {!isFormOpen ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {canEdit && (
            <button onClick={() => setIsFormOpen(true)} className="btn-secondary md:col-span-3 flex items-center justify-center h-10">
              <Plus className="mr-2 h-4 w-4" /> Log New Worker Entry
            </button>
          )}
          <div className={`relative ${!canEdit ? 'md:col-span-4' : ''}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 text-sm w-full h-10"
            />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-navy-900/50 p-4 rounded-lg border border-navy-700 mb-6 space-y-4">
          <h3 className="text-white font-medium mb-2">{editingId ? 'Update Worker Entry' : 'New Worker Entry'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Worker Name *</label>
              <input type="text" name="workerName" value={formData.workerName} onChange={handleChange} className="input-field text-sm" required />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Role/Trade *</label>
              <select name="role" value={formData.role} onChange={handleChange} className="input-field text-sm" required>
                <option value="">Select Role...</option>
                <option value="Painter">Painter</option>
                <option value="Welder">Welder</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Helper">Helper</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Money Spend (₹) *</label>
              <input type="number" name="dailyWage" value={formData.dailyWage} onChange={handleChange} className="input-field text-sm" required min="0" step="0.01" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Payment Status</label>
              <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} className="input-field text-sm">
                <option value="Pending">Pending</option>
                <option value="Cash">Paid via Cash</option>
                <option value="Online">Paid Online</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Date</label>
              <input
                type={dateFocus ? "date" : "text"}
                name="dateOfPayment"
                value={dateFocus ? formData.dateOfPayment : formatDateForDisplay(formData.dateOfPayment)}
                onFocus={() => setDateFocus(true)}
                onBlur={() => setDateFocus(false)}
                onChange={handleChange}
                className="input-field text-sm"
                required
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-4">
            <button type="button" onClick={resetForm} className="btn-secondary text-sm w-full sm:w-auto">Cancel</button>
            <button type="submit" className="btn-primary text-sm w-full sm:w-auto" disabled={isLoading}>
              {isLoading ? 'Saving...' : editingId ? 'Update Entry' : 'Save Entry'}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="overflow-y-auto overflow-x-hidden max-h-[450px] rounded-lg border border-navy-700 custom-scrollbar w-full">
        <table className="min-w-full divide-y divide-navy-700 relative block sm:table">
          <thead className="bg-navy-900/95 sticky top-0 z-10 shadow-sm hidden sm:table-header-group">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Worker</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Money Spend</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-navy-800 divide-y divide-navy-700 block sm:table-row-group">
            {isLoading && workers.length === 0 ? (
              <tr className="block sm:table-row"><td colSpan="6" className="px-4 py-8 text-center text-gray-400 block sm:table-cell">Loading...</td></tr>
            ) : filteredWorkers.length === 0 ? (
              <tr className="block sm:table-row"><td colSpan="6" className="px-4 py-8 text-center text-gray-400 block sm:table-cell">No worker entries found.</td></tr>
            ) : (
              filteredWorkers.map((worker) => (
                <tr key={worker._id} className="hover:bg-navy-700/50 transition-colors block sm:table-row border-b border-navy-700 sm:border-none p-4 sm:p-0 mb-4 sm:mb-0 bg-navy-800 sm:bg-transparent rounded-lg sm:rounded-none">
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-sm text-gray-300 flex justify-between sm:table-cell">
                    <span className="sm:hidden font-bold text-gray-400">Date:</span>
                    <span>{new Date(worker.dateOfPayment).toLocaleDateString('en-GB')}</span>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap flex justify-between sm:table-cell border-t border-navy-700/50 sm:border-none mt-2 sm:mt-0 pt-2 sm:pt-3">
                    <span className="sm:hidden font-bold text-gray-400">Worker:</span>
                    <div className="text-right sm:text-left">
                      <div className="text-sm font-medium text-white">{worker.workerName}</div>
                      <div className="text-xs text-gray-400">{worker.role}</div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-sm font-bold text-white flex justify-between sm:table-cell">
                    <span className="sm:hidden font-bold text-gray-400">Money Spend:</span>
                    <span>₹{worker.totalAmount.toFixed(2)}</span>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap flex justify-between sm:table-cell">
                    <span className="sm:hidden font-bold text-gray-400">Status:</span>
                    <span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${worker.paymentMode === 'Pending' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
                        }`}>
                        {worker.paymentMode}
                      </span>
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-right text-sm font-medium flex justify-between sm:table-cell border-t border-navy-700/50 sm:border-none mt-2 sm:mt-0 pt-2 sm:pt-3">
                    <span className="sm:hidden font-bold text-gray-400">Actions:</span>
                    {canEdit ? (
                      <div className="flex justify-end gap-3">
                        <button onClick={() => handleEdit(worker)} className="text-blue-400 hover:text-blue-300 transition-colors p-2 sm:p-0">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(worker._id)} className="text-red-400 hover:text-red-300 transition-colors p-2 sm:p-0">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">{isReadOnly ? 'View Only' : 'Locked'}</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkerModule;
