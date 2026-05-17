import React, { useEffect, useState } from 'react';
import useSupplierStore from '../store/supplierStore';
import usePaymentStore from '../store/paymentStore';
import { Plus, Trash2, Edit, Search, Download, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const SupplierModule = ({ siteId, isCompleted, isReadOnly }) => {
  const canEdit = !isCompleted && !isReadOnly;
  const { suppliers, fetchSuppliers, addSupplier, updateSupplier, deleteSupplier, isLoading } = useSupplierStore();
  const { addPayment } = usePaymentStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    supplierName: '',
    materialName: '',
    quantity: '',
    unit: 'Bags',
    ratePerUnit: '',
    dateOfPurchase: new Date().toISOString().split('T')[0],
    amountPaid: '',
    notes: '',
  });
  const [selectedSupplier, setSelectedSupplier] = useState('All');
  const [quickPayAmount, setQuickPayAmount] = useState('');
  const [dateFocus, setDateFocus] = useState(false);

  useEffect(() => {
    if (siteId) fetchSuppliers(siteId);
  }, [siteId, fetchSuppliers]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (supplier) => {
    setFormData({
      supplierName: supplier.supplierName,
      materialName: supplier.materialName,
      quantity: supplier.quantity,
      unit: supplier.unit,
      ratePerUnit: supplier.ratePerUnit,
      dateOfPurchase: new Date(supplier.dateOfPurchase).toISOString().split('T')[0],
      amountPaid: supplier.amountPaid || '',
      notes: supplier.notes || '',
    });
    setEditingId(supplier._id);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplierName || !formData.materialName || !formData.quantity || !formData.ratePerUnit) {
      toast.error('Please fill all required fields');
      return;
    }

    if (editingId) {
      const success = await updateSupplier(editingId, formData);
      if (success) {
        toast.success('Supplier entry updated!');
        resetForm();
      } else {
        toast.error('Failed to update entry');
      }
    } else {
      const success = await addSupplier({ ...formData, siteId });
      if (success) {
        toast.success('Supplier entry added!');
        resetForm();
      } else {
        toast.error('Failed to add entry');
      }
    }
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({
      supplierName: '', materialName: '', quantity: '', unit: 'Bags', ratePerUnit: '',
      dateOfPurchase: new Date().toISOString().split('T')[0], amountPaid: '', notes: ''
    });
  };

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      const success = await deleteSupplier(id);
      if (success) toast.success('Entry deleted');
    }
  };

  const handleQuickPay = async () => {
    const amount = parseFloat(quickPayAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!selectedSupplier || selectedSupplier === 'All') {
      toast.error('Please select a specific supplier first');
      return;
    }

    const sSpend = suppliers.filter(s => s.supplierName === selectedSupplier && s.unit !== 'Payment').reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const sPaid = suppliers.filter(s => s.supplierName === selectedSupplier).reduce((sum, s) => sum + (s.amountPaid || 0), 0);
    const currentOverallDue = sSpend - sPaid;

    if (currentOverallDue <= 0) {
      toast.error('No due balance found for this supplier');
      return;
    }

    const newBalanceDue = currentOverallDue - amount;

    const success = await addSupplier({
      siteId,
      supplierName: selectedSupplier,
      materialName: 'Payment Against Due',
      quantity: 0,
      unit: 'Payment',
      ratePerUnit: 0,
      amountPaid: amount,
      balanceDue: newBalanceDue, // Hardcoded due saved into the database!
      dateOfPurchase: new Date().toISOString(),
      notes: `Quick Pay settlement`
    });

    if (success) {
      toast.success(`₹${amount} payment recorded for ${selectedSupplier}`);
      setQuickPayAmount('');
    } else {
      toast.error('Failed to record payment');
    }
  };

  const exportToCSV = () => {
    const data = filteredSuppliers.map(s => ({
      Date: new Date(s.dateOfPurchase).toLocaleDateString('en-GB'),
      Supplier: s.supplierName,
      Material: s.materialName,
      Quantity: `${s.quantity} ${s.unit}`,
      Rate: s.ratePerUnit,
      Total: s.totalAmount,
      Paid: s.amountPaid,
      Due: s.balanceDue,
      Status: s.paymentStatus
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Supplier Expenses");
    XLSX.writeFile(workbook, `Supplier_Expenses_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exporting to Excel...');
  };

  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(18);
    doc.text("Supplier & Materials Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString('en-GB')}`, 14, 30);
    doc.text(`Total Purchase: INR ${totalSpend.toFixed(2)} | Total Paid: INR ${totalPaid.toFixed(2)} | Total Due: INR ${totalDue.toFixed(2)}`, 14, 38);

    let yPos = 50;
    doc.setFontSize(10);
    doc.setTextColor(0);
    const headers = ["Date", "Supplier", "Material", "Qty x Rate", "Total", "Paid", "Due"];
    const xPositions = [14, 40, 80, 130, 170, 200, 230];

    headers.forEach((h, i) => doc.text(h, xPositions[i], yPos));

    yPos += 8;
    doc.line(14, yPos - 4, 280, yPos - 4);

    filteredSuppliers.forEach((s) => {
      if (yPos > 190) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(new Date(s.dateOfPurchase).toLocaleDateString('en-GB'), 14, yPos);
      doc.text(s.supplierName, 40, yPos);
      doc.text(s.materialName, 80, yPos);
      doc.text(`${s.quantity} ${s.unit} x ${s.ratePerUnit}`, 130, yPos);
      doc.text(s.totalAmount.toFixed(2), 170, yPos);
      doc.text(s.amountPaid.toFixed(2), 200, yPos);
      doc.text(s.balanceDue.toFixed(2), 230, yPos);
      yPos += 7;
    });

    doc.save(`Supplier_Expenses_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Exporting to PDF...');
  };

  // Calculate totals
  const supplierNames = ['All', ...new Set((suppliers || []).map(s => s?.supplierName).filter(Boolean))];

  const filteredSuppliers = (suppliers || []).filter(supplier => {
    return (selectedSupplier === 'All' || supplier.supplierName === selectedSupplier);
  });

  const totalSpend = filteredSuppliers.reduce((sum, s) => sum + (s.unit === 'Payment' ? 0 : (s.totalAmount || 0)), 0);
  const totalPaid = filteredSuppliers.reduce((sum, s) => sum + (s.amountPaid || 0), 0);
  const totalDue = totalSpend - totalPaid;

  const selectedSupplierSummary = selectedSupplier !== 'All' ? {
    total: (suppliers || []).filter(s => s.supplierName === selectedSupplier && s.unit !== 'Payment').reduce((sum, s) => sum + (s.totalAmount || 0), 0),
    paid: (suppliers || []).filter(s => s.supplierName === selectedSupplier && s.unit !== 'Payment').reduce((sum, s) => sum + (s.amountPaid || 0), 0),
    due: (suppliers || []).filter(s => s.supplierName === selectedSupplier && s.unit !== 'Payment').reduce((sum, s) => sum + (s.balanceDue || 0), 0),
  } : null;

  return (
    <div className="card border-t-2 border-t-navy-500 w-full max-w-full overflow-hidden">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div className="flex justify-between items-start w-full md:w-auto">
          <div>
            <h2 className="text-xl font-heading font-bold text-white">Supplier & Materials</h2>
            <p className="text-gray-400 text-sm mt-1">Total Entries: {filteredSuppliers.length}</p>
          </div>
          <div className="flex md:hidden flex-col gap-2 border-l border-navy-700 pl-4">
            <button onClick={exportToCSV} className="p-1.5 bg-navy-700 hover:bg-navy-600 rounded text-gray-300 transition-colors" title="Export to Excel">
              <Download className="h-4 w-4" />
            </button>
            <button onClick={exportToPDF} className="p-1.5 bg-navy-700 hover:bg-navy-600 rounded text-gray-300 transition-colors" title="Export to PDF">
              <FileText className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full md:w-auto">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-left sm:text-right w-full sm:w-auto bg-navy-900/50 sm:bg-transparent p-4 sm:p-0 rounded-lg sm:rounded-none">
            <div className="flex justify-between sm:block">
              <p className="text-sm text-gray-400">Total Purchase</p>
              <p className="text-xl font-bold text-white">₹{(totalSpend || 0).toFixed(2)}</p>
            </div>
            <div className="flex justify-between sm:block">
              <p className="text-sm text-green-400">Total Paid</p>
              <p className="text-xl font-bold text-green-500">₹{(totalPaid || 0).toFixed(2)}</p>
            </div>
            <div className="flex justify-between sm:block">
              <p className="text-sm text-red-400">Balance Due</p>
              <p className="text-xl font-bold text-red-500">₹{(totalDue || 0).toFixed(2)}</p>
            </div>
          </div>
          <div className="hidden md:flex flex-col gap-2 border-l border-navy-700 pl-4">
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
        <div className="space-y-6">
          {/* Filter & Quick Pay Header */}
          <div className="flex flex-col md:flex-row gap-4 items-end bg-navy-900/30 p-4 rounded-xl border border-navy-700/50 w-full max-w-full">
            <div className="w-full md:w-1/3">
              <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Select Supplier</label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="input-field h-10 text-sm w-full"
              >
                {supplierNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {selectedSupplier !== 'All' && selectedSupplierSummary?.due > 0 && canEdit ? (
              <div className="w-full md:w-5/12 flex flex-col sm:flex-row items-end gap-2 md:border-l border-navy-700 md:pl-4">
                <div className="flex-1 w-full">
                  <label className="block text-[10px] uppercase tracking-widest text-gold-500 font-bold mb-2">Quick Pay towards Due</label>
                  <input
                    type="number"
                    placeholder="Enter amount..."
                    value={quickPayAmount}
                    onChange={(e) => setQuickPayAmount(e.target.value)}
                    className="input-field h-10 text-sm border-gold-500/30 focus:border-gold-500 w-full"
                  />
                </div>
                <button
                  onClick={handleQuickPay}
                  className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold py-2 px-4 rounded-lg h-10 transition-all active:scale-95 text-sm w-full sm:w-auto mt-2 sm:mt-0"
                >
                  Pay Now
                </button>
              </div>
            ) : (
              <div className="hidden md:block md:w-5/12"></div>
            )}

            <div className="w-full md:w-1/4 flex justify-end">
              {canEdit && (
                <button onClick={() => setIsFormOpen(true)} className="btn-secondary h-10 w-full flex items-center justify-center">
                  <Plus className="mr-2 h-4 w-4" /> Log Purchase
                </button>
              )}
            </div>
          </div>


        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-navy-900/50 p-4 rounded-lg border border-navy-700 mb-6 space-y-4">
          <h3 className="text-white font-medium mb-2">{editingId ? 'Update Material Purchase' : 'New Material Purchase'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Supplier Name *</label>
              <input type="text" name="supplierName" value={formData.supplierName} onChange={handleChange} className="input-field text-sm" required />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Material (e.g. Cement) *</label>
              <input type="text" name="materialName" value={formData.materialName} onChange={handleChange} className="input-field text-sm" required />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Quantity *</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="input-field text-sm" required min="0.1" step="0.1" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Unit *</label>
              <select name="unit" value={formData.unit} onChange={handleChange} className="input-field text-sm" required>
                <option value="Bags">Bags</option>
                <option value="Buckets">Buckets</option>
                <option value="Brush-8(inch)">Brush-8(inch)</option>
                <option value="Brush-6(inch)">Brush-6(inch)</option>
                <option value="Brush-4(inch)">Brush-4(inch)</option>
                <option value="Brush-2(inch)">Brush-2(inch)</option>
                <option value="Tonnes">Tonnes</option>
                <option value="Cft">Cft (Cubic Feet)</option>
                <option value="Sqft">Sqft</option>
                <option value="Pieces">Pieces</option>
                <option value="Liters">Liters</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Rate per Unit (₹) *</label>
              <input type="number" name="ratePerUnit" value={formData.ratePerUnit} onChange={handleChange} className="input-field text-sm" required min="0" step="0.01" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Amount Paid Now (₹)</label>
              <input type="number" name="amountPaid" value={formData.amountPaid} onChange={handleChange} className="input-field text-sm" min="0" step="0.01" placeholder="Leave empty if unpaid" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Date</label>
              <input
                type={dateFocus ? "date" : "text"}
                name="dateOfPurchase"
                value={dateFocus ? formData.dateOfPurchase : formatDateForDisplay(formData.dateOfPurchase)}
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
              {isLoading ? 'Saving...' : editingId ? 'Update Purchase' : 'Save Purchase'}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="overflow-y-auto overflow-x-hidden min-h-0 max-h-[65vh] md:max-h-[450px] rounded-lg border border-navy-700 custom-scrollbar w-full">
        <table className="min-w-full divide-y divide-navy-700 relative block sm:table">
          <thead className="bg-navy-900/95 sticky top-0 z-10 shadow-sm hidden sm:table-header-group">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Supplier & Material</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Qty x Rate</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total (₹)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Paid (₹)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Due (₹)</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-navy-800 divide-y divide-navy-700 block sm:table-row-group">
            {isLoading && (suppliers || []).length === 0 ? (
              <tr className="block sm:table-row"><td colSpan="7" className="px-4 py-8 text-center text-gray-400 block sm:table-cell">Loading...</td></tr>
            ) : filteredSuppliers.length === 0 ? (
              <tr className="block sm:table-row"><td colSpan="7" className="px-4 py-8 text-center text-gray-400 block sm:table-cell">No material purchases logged yet.</td></tr>
            ) : (
              filteredSuppliers.map((supplier) => (
                <tr key={supplier._id} className="hover:bg-navy-700/50 transition-colors block sm:table-row border-b border-navy-700 sm:border-none p-4 sm:p-0 mb-4 sm:mb-0 bg-navy-800 sm:bg-transparent rounded-lg sm:rounded-none">
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-sm text-gray-300 flex justify-between sm:table-cell">
                    <span className="sm:hidden font-bold text-gray-400">Date:</span>
                    <span>
                      {supplier.unit === 'Payment'
                        ? new Date(supplier.createdAt || supplier.dateOfPurchase).toLocaleString('en-GB')
                        : new Date(supplier.dateOfPurchase).toLocaleDateString('en-GB')}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap flex justify-between sm:table-cell border-t border-navy-700/50 sm:border-none mt-2 sm:mt-0 pt-2 sm:pt-3">
                    <span className="sm:hidden font-bold text-gray-400">Supplier:</span>
                    <div className="text-right sm:text-left">
                      <div className="text-sm font-medium text-white">{supplier.supplierName}</div>
                      <div className={`text-xs ${supplier.unit === 'Payment' ? 'text-gold-500 font-bold' : 'text-gray-400'}`}>
                        {supplier.materialName}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-sm text-gray-300 flex justify-between sm:table-cell">
                    <span className="sm:hidden font-bold text-gray-400">Qty x Rate:</span>
                    <span>
                      {supplier.unit === 'Payment' ? (
                        <span className="text-gray-500">-</span>
                      ) : (
                        <>{supplier.quantity} {supplier.unit} &times; ₹{supplier.ratePerUnit}</>
                      )}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-sm font-bold text-white flex justify-between sm:table-cell">
                    <span className="sm:hidden font-bold text-gray-400">Total:</span>
                    <span>
                      {supplier.unit === 'Payment' ? (
                        <span className="text-gray-500">-</span>
                      ) : (
                        <>₹{(supplier.totalAmount || 0).toFixed(2)}</>
                      )}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-sm font-bold text-green-400 flex justify-between sm:table-cell">
                    <span className="sm:hidden font-bold text-gray-400">Paid:</span>
                    <span>₹{(supplier.amountPaid || 0).toFixed(2)}</span>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap flex justify-between sm:table-cell">
                    <span className="sm:hidden font-bold text-gray-400">Due:</span>
                    <div className="text-right sm:text-left">
                      <span className={`text-sm font-medium ${(supplier.balanceDue || 0) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        ₹{(supplier.balanceDue || 0).toFixed(2)}
                      </span>
                      <div className="text-xs text-gray-500">
                        {supplier.unit === 'Payment'
                          ? ((supplier.balanceDue || 0) <= 0 ? 'Paid' : 'Partial')
                          : (supplier.paymentStatus || 'Pending')}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-right text-sm font-medium flex justify-between sm:table-cell border-t border-navy-700/50 sm:border-none mt-2 sm:mt-0 pt-2 sm:pt-3">
                    <span className="sm:hidden font-bold text-gray-400">Actions:</span>
                    {canEdit ? (
                      <div className="flex justify-end gap-3">
                        <button onClick={() => handleEdit(supplier)} className="text-blue-400 hover:text-blue-300 transition-colors p-2 sm:p-0">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(supplier._id)} className="text-red-400 hover:text-red-300 transition-colors p-2 sm:p-0">
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

export default SupplierModule;

