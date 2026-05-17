import React, { useEffect, useState } from 'react';
import usePaymentStore from '../store/paymentStore';
import {
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  User,
  FileText,
  MoreVertical,
  Edit2,
  Trash2,
  X,
  CreditCard,
  Banknote,
  Download
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const GetAndPay = () => {
  const { payments, fetchPayments, addPayment, updatePayment, deletePayment, isLoading, getStats } = usePaymentStore();
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFocus, setDateFocus] = useState(false);
  const isEmployee = user?.role === 'employee';

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    action: 'Cash',
    type: 'Get',
    reason: ''
  });

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleOpenModal = (payment = null) => {
    if (payment) {
      setEditingPayment(payment);
      setFormData({
        name: payment.name,
        date: new Date(payment.date).toISOString().split('T')[0],
        amount: payment.amount,
        action: payment.action,
        type: payment.type,
        reason: payment.reason
      });
    } else {
      setEditingPayment(null);
      setFormData({
        name: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        action: 'Cash',
        type: 'Get',
        reason: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.amount || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    const success = editingPayment
      ? await updatePayment(editingPayment._id, formData)
      : await addPayment(formData);

    if (success) {
      toast.success(editingPayment ? 'Transaction updated' : 'Transaction added');
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      const success = await deletePayment(id);
      if (success) toast.success('Transaction deleted');
    }
  };

  const nonSupplierPayments = payments.filter(p =>
    p.reason !== 'Quick Pay settlement towards material due balance'
  );

  const filteredPayments = nonSupplierPayments.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = getStats();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const exportToCSV = () => {
    const data = filteredPayments.map(p => ({
      Date: new Date(p.date).toLocaleDateString('en-GB'),
      Name: p.name,
      Amount: p.amount,
      Type: p.type,
      Mode: p.action,
      Reason: p.reason
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, `GetAndPay_Transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exporting to Excel...');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Global Ledger Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString('en-GB')}`, 14, 30);
    doc.text(`Total Get: INR ${stats.totalGet} | Total Pay: INR ${stats.totalPay} | Balance: INR ${stats.balance}`, 14, 38);

    let yPos = 50;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Date", 14, yPos);
    doc.text("Name", 40, yPos);
    doc.text("Amount", 90, yPos);
    doc.text("Type", 130, yPos);
    doc.text("Mode", 160, yPos);

    yPos += 10;
    doc.line(14, yPos - 5, 195, yPos - 5);

    filteredPayments.forEach((p) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(10);
      doc.text(new Date(p.date).toLocaleDateString('en-GB'), 14, yPos);
      doc.text(p.name, 40, yPos);
      doc.text(`${p.amount}`, 90, yPos);
      doc.text(p.type, 130, yPos);
      doc.text(p.action, 160, yPos);
      yPos += 8;
    });

    doc.save(`GetAndPay_Transactions_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Exporting to PDF...');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-white tracking-wide flex items-center gap-3">
            <Wallet className="h-7 w-7 md:h-8 md:w-8 text-gold-500" />
            Get & Pay <span className="hidden sm:inline text-gray-500 font-normal text-xl">| Global Ledger</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm md:text-base">Manage all your incoming and outgoing payments.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <button onClick={exportToCSV} className="p-2.5 bg-navy-800 hover:bg-navy-700 rounded-lg text-gray-300 transition-colors border border-navy-700" title="Export to Excel">
              <Download className="h-5 w-5" />
            </button>
            <button onClick={exportToPDF} className="p-2.5 bg-navy-800 hover:bg-navy-700 rounded-lg text-gray-300 transition-colors border border-navy-700" title="Export to PDF">
              <FileText className="h-5 w-5" />
            </button>
          </div>
          {!isEmployee && (
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary flex items-center gap-2 flex-1 md:flex-none justify-center whitespace-nowrap"
            >
              <Plus className="h-5 w-5" /> <span className="hidden xs:inline">New Transaction</span><span className="xs:hidden">Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="card border-l-4 border-l-green-500 bg-navy-800/40 relative overflow-hidden group p-4 md:p-6">
          <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-24 w-24 text-green-500" />
          </div>
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Get</h3>
          <p className="text-3xl font-bold text-green-400">{formatCurrency(stats.totalGet)}</p>
          <div className="flex items-center mt-2 text-xs text-green-500/70">
            <TrendingUp className="h-3 w-3 mr-1" /> Incoming funds
          </div>
        </div>

        <div className="card border-l-4 border-l-red-500 bg-navy-800/40 relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:scale-110 transition-transform">
            <TrendingDown className="h-24 w-24 text-red-500" />
          </div>
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Pay</h3>
          <p className="text-3xl font-bold text-red-400">{formatCurrency(stats.totalPay)}</p>
          <div className="flex items-center mt-2 text-xs text-red-500/70">
            <TrendingDown className="h-3 w-3 mr-1" /> Outgoing funds
          </div>
        </div>

        <div className="card border-l-4 border-l-gold-500 bg-navy-800/40 relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:scale-110 transition-transform">
            <Wallet className="h-24 w-24 text-gold-500" />
          </div>
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Net Balance</h3>
          <p className={`text-3xl font-bold ${stats.balance >= 0 ? 'text-gold-500' : 'text-orange-500'}`}>
            {formatCurrency(stats.balance)}
          </p>
          <div className="flex items-center mt-2 text-xs text-gray-500">
            Current cash position
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or reason..."
            className="input-field pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${typeFilter === 'all' ? 'bg-gold-500 text-navy-900 shadow-lg shadow-gold-500/20' : 'bg-navy-800 text-gray-400 hover:bg-navy-700'}`}
          >
            All
          </button>
          <button
            onClick={() => setTypeFilter('Get')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${typeFilter === 'Get' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-navy-800 text-gray-400 hover:bg-navy-700'}`}
          >
            Get
          </button>
          <button
            onClick={() => setTypeFilter('Pay')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${typeFilter === 'Pay' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-navy-800 text-gray-400 hover:bg-navy-700'}`}
          >
            Pay
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden bg-navy-800/30 border border-navy-700/50 w-full max-w-full">
        <div className="overflow-y-auto overflow-x-hidden max-h-[450px] custom-scrollbar w-full">
          <table className="w-full text-left relative block sm:table">
            <thead className="bg-navy-900/95 sticky top-0 z-10 text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-navy-700/50 shadow-sm hidden sm:table-header-group">
              <tr>
                <th className="px-6 py-4">Transaction Details</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4">Type & Mode</th>
                {!isEmployee && <th className="px-6 py-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700/50 block sm:table-row-group">
              {isLoading && payments.length === 0 ? (
                <tr className="block sm:table-row">
                  <td colSpan="5" className="px-6 py-12 text-center block sm:table-cell">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr className="block sm:table-row">
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 block sm:table-cell">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-navy-700/20 transition-colors group block sm:table-row border-b border-navy-700 sm:border-none p-4 sm:p-0 mb-4 sm:mb-0 bg-navy-800 sm:bg-transparent rounded-lg sm:rounded-none">
                    <td className="px-2 sm:px-6 py-2 sm:py-4 block sm:table-cell">
                      <div className="flex items-center justify-between sm:justify-start gap-3">
                        <span className="sm:hidden font-bold text-gray-400 text-xs uppercase">Details:</span>
                        <div className="flex items-center gap-3 text-right sm:text-left">
                          <div className={`p-2 rounded-lg ${p.type === 'Get' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {p.type === 'Get' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-white font-medium">{p.name}</p>
                            <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{p.reason}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 text-sm text-gray-400 flex justify-between sm:table-cell">
                      <span className="sm:hidden font-bold text-gray-400 text-xs uppercase">Date:</span>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(p.date).toLocaleDateString('en-GB')}
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 text-right flex justify-between sm:table-cell">
                      <span className="sm:hidden font-bold text-gray-400 text-xs uppercase">Amount:</span>
                      <p className={`font-bold ${p.type === 'Get' ? 'text-green-400' : 'text-red-400'}`}>
                        {p.type === 'Get' ? '+' : '-'}{formatCurrency(p.amount)}
                      </p>
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 flex justify-between sm:table-cell">
                      <span className="sm:hidden font-bold text-gray-400 text-xs uppercase">Type:</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${p.action === 'Online' ? 'border-blue-500/30 text-blue-400 bg-blue-500/5' : 'border-gold-500/30 text-gold-500 bg-gold-500/5'
                          }`}>
                          {p.action}
                        </span>
                      </div>
                    </td>
                    {!isEmployee && (
                      <td className="px-2 sm:px-6 py-2 sm:py-4 flex justify-between sm:table-cell border-t border-navy-700/50 sm:border-none mt-2 sm:mt-0 pt-2 sm:pt-4">
                        <span className="sm:hidden font-bold text-gray-400 text-xs uppercase">Actions:</span>
                        <div className="flex justify-end sm:justify-center items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenModal(p)}
                            className="p-2 sm:p-1.5 text-gray-400 hover:text-gold-500 hover:bg-navy-700 rounded transition-all"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="p-2 sm:p-1.5 text-gray-400 hover:text-red-500 hover:bg-navy-700 rounded transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Only for Admin/Contractor */}
      {isModalOpen && !isEmployee && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-navy-900 rounded-2xl border border-navy-700 shadow-2xl shadow-black/50 p-6 md:p-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-heading font-bold text-white mb-6 flex items-center gap-3">
              {editingPayment ? <Edit2 className="h-6 w-6 text-gold-500" /> : <Plus className="h-6 w-6 text-gold-500" />}
              {editingPayment ? 'Edit Transaction' : 'New Transaction'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'Get' })}
                  className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 transition-all ${formData.type === 'Get'
                    ? 'border-green-500 bg-green-500/10 text-green-400'
                    : 'border-navy-700 bg-navy-800 text-gray-500 hover:border-navy-600'
                    }`}
                >
                  <TrendingUp className="h-4 w-4" /> I Got
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'Pay' })}
                  className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 transition-all ${formData.type === 'Pay'
                    ? 'border-red-500 bg-red-500/10 text-red-400'
                    : 'border-navy-700 bg-navy-800 text-gray-500 hover:border-navy-600'
                    }`}
                >
                  <TrendingDown className="h-4 w-4" /> I Paid
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Party/Person Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      required
                      className="input-field pl-10 w-full"
                      placeholder="e.g. Rahul Gupta, Cement Store..."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Amount (₹)</label>
                    <div className="relative">
                      <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type="number"
                        required
                        className="input-field pl-10 w-full"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gold-500 z-10 pointer-events-none" />
                      <input
                        type="text"
                        readOnly
                        required
                        className="input-field pl-11 w-full cursor-pointer hover:border-gold-500/50 transition-colors"
                        value={formatDateForDisplay(formData.date)}
                        onClick={(e) => {
                          const dateInput = e.currentTarget.nextElementSibling;
                          if (dateInput && typeof dateInput.showPicker === 'function') {
                            dateInput.showPicker();
                          }
                        }}
                      />
                      <input
                        type="date"
                        className="absolute inset-0 w-0 h-0 opacity-0 pointer-events-none"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        style={{ visibility: 'hidden' }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Payment Mode</label>
                  <div className="flex gap-4">
                    <label className="flex-1">
                      <input
                        type="radio"
                        name="action"
                        value="Cash"
                        className="sr-only peer"
                        checked={formData.action === 'Cash'}
                        onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                      />
                      <div className="p-3 text-center rounded-xl border-2 border-navy-700 bg-navy-800 cursor-pointer peer-checked:border-gold-500 peer-checked:text-gold-500 peer-checked:bg-gold-500/5 text-gray-500 hover:border-navy-600 transition-all font-medium flex items-center justify-center gap-2">
                        <Banknote className="h-4 w-4" /> Cash
                      </div>
                    </label>
                    <label className="flex-1">
                      <input
                        type="radio"
                        name="action"
                        value="Online"
                        className="sr-only peer"
                        checked={formData.action === 'Online'}
                        onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                      />
                      <div className="p-3 text-center rounded-xl border-2 border-navy-700 bg-navy-800 cursor-pointer peer-checked:border-blue-500 peer-checked:text-blue-400 peer-checked:bg-blue-500/5 text-gray-500 hover:border-navy-600 transition-all font-medium flex items-center justify-center gap-2">
                        <CreditCard className="h-4 w-4" /> Online
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Reason / Description</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <textarea
                      required
                      className="input-field pl-10 w-full h-24 pt-2.5"
                      placeholder="What was this transaction for?"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-400 bg-navy-800 hover:bg-navy-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-2 py-3 px-8 rounded-xl font-bold text-navy-900 bg-gold-500 hover:bg-gold-600 shadow-lg shadow-gold-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : editingPayment ? 'Update Transaction' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetAndPay;
