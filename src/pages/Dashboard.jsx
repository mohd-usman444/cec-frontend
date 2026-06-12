import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import useSiteStore from '../store/siteStore';
import CreateSiteModal from '../components/CreateSiteModal';
import { Building2, Calendar, MapPin, ArrowRight, Wallet, Download, FileText, Trash2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import usePaymentStore from '../store/paymentStore';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { sites, fetchSites, stats, fetchStats, isLoading, deleteSite } = useSiteStore();
  const { fetchPayments, getStats } = usePaymentStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isEmployee = user?.role === 'employee';

  const filteredSites = sites.filter(site =>
    site.siteName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchSites();
    fetchStats();
    fetchPayments();
  }, [fetchSites, fetchStats, fetchPayments]);

  const paymentStats = getStats();

  const formatStats = (num) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
    return `₹${num}`;
  };

  const handleDeleteSite = async () => {
    if (!siteToDelete) return;
    setIsDeleting(true);
    const success = await deleteSite(siteToDelete._id);
    if (success) {
      toast.success('Site deleted successfully.');
      fetchStats(); // refresh dashboard stats
    } else {
      toast.error('Failed to delete site.');
    }
    setIsDeleting(false);
    setSiteToDelete(null);
  };

  const exportToCSV = () => {
    const data = sites.map(s => ({
      SiteName: s.siteName,
      Location: s.siteLocation,
      Status: s.status,
      Started: new Date(s.startDate).toLocaleDateString('en-GB'),
      Workers: s.workerCount || 0,
      LabourSpend: s.labourSpend || 0,
      MaterialSpend: s.materialSpend || 0,
      MaterialPaid: s.materialPaid || 0,
      OtherExpense: s.otherExpenseSpend || 0,
      TotalSpend: (s.labourSpend || 0) + (s.materialPaid || 0) + (s.otherExpenseSpend || 0)
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sites Overview");
    XLSX.writeFile(workbook, `Dashboard_Sites_Overview_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exporting to Excel...');
  };

  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(18);
    doc.text("Dashboard - Projects Overview", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString('en-GB')}`, 14, 30);
    doc.text(`Total Worker Spend: INR ${stats.totalWorkerSpend} | Total Material Spend: INR ${stats.totalSupplierSpend} | Total Other Expense: INR ${stats.totalOtherExpense || 0}`, 14, 38);

    let yPos = 50;
    doc.setFontSize(12);
    doc.setTextColor(0);
    const headers = ["Site Name", "Location", "Status", "Started", "Workers", "Labour", "Material Paid", "Other Exp", "Total Spend"];
    const xPositions = [14, 50, 95, 120, 150, 170, 195, 225, 250];

    headers.forEach((h, i) => doc.text(h, xPositions[i], yPos));

    yPos += 10;
    doc.line(14, yPos - 5, 280, yPos - 5);

    sites.forEach((s) => {
      if (yPos > 190) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(10);
      doc.text(s.siteName, 14, yPos);
      doc.text(s.siteLocation, 50, yPos);
      doc.text(s.status, 95, yPos);
      doc.text(new Date(s.startDate).toLocaleDateString('en-GB'), 120, yPos);
      doc.text(`${s.workerCount || 0}`, 150, yPos);
      doc.text(`${s.labourSpend || 0}`, 170, yPos);
      doc.text(`${s.materialPaid || 0}`, 195, yPos);
      doc.text(`${s.otherExpenseSpend || 0}`, 225, yPos);
      doc.text(`${(s.labourSpend || 0) + (s.materialPaid || 0) + (s.otherExpenseSpend || 0)}`, 250, yPos);
      yPos += 8;
    });

    doc.save(`Dashboard_Sites_Overview_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Exporting to PDF...');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-wide">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, {user?.fullName}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            <button onClick={exportToCSV} className="p-2.5 bg-navy-800 hover:bg-navy-700 rounded-lg text-gray-300 transition-colors border border-navy-700" title="Export to Excel">
              <Download className="h-5 w-5" />
            </button>
            <button onClick={exportToPDF} className="p-2.5 bg-navy-800 hover:bg-navy-700 rounded-lg text-gray-300 transition-colors border border-navy-700" title="Export to PDF">
              <FileText className="h-5 w-5" />
            </button>
          </div>
          {!isEmployee && (
            <button className="btn-primary flex-1 md:flex-none whitespace-nowrap" onClick={() => setIsModalOpen(true)}>
              + Create New Site
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="card border-l-4 border-l-gold-500">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Active Projects</h3>
          <p className="text-4xl font-bold text-gold-500 mt-2">
            {sites.filter(s => s.status === 'active').length}
          </p>
          <p className="text-gray-500 text-xs mt-1">Total Sites: {sites.length}</p>
        </div>
        <div className="card border-l-4 border-l-gold-500">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Worker Spend</h3>
          <p className="text-4xl font-bold text-gold-500 mt-2">{formatStats(stats.totalWorkerSpend)}</p>
          <p className="text-gray-500 text-xs mt-1">All sites combined</p>
        </div>
        <div className="card border-l-4 border-l-gold-500">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Material Spend</h3>
          <p className="text-4xl font-bold text-gold-500 mt-2">{formatStats(stats.totalSupplierSpend)}</p>
          <p className="text-gray-500 text-xs mt-1">All sites combined</p>
        </div>
        <div className="card border-l-4 border-l-gold-500">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Other Expense</h3>
          <p className="text-4xl font-bold text-gold-500 mt-2">{formatStats(stats.totalOtherExpense || 0)}</p>
          <p className="text-gray-500 text-xs mt-1">All sites combined</p>
        </div>
        <div className="card border-l-4 border-l-gold-500">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total Site Spend</h3>
          <p className="text-4xl font-bold text-gold-500 mt-2">
            {formatStats((stats.totalWorkerSpend || 0) + (stats.totalSupplierPaid || 0) + (stats.totalOtherExpense || 0))}
          </p>
          <p className="text-gray-500 text-xs mt-1">Labour + Material Paid + Other Exp</p>
        </div>
        <div className="card border-l-4 border-l-gold-500 hover:border-l-gold-400 transition-all group relative overflow-hidden">
          <Link to="/get-and-pay" className="absolute inset-0 z-10"></Link>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Net Balance</h3>
              <p className="text-4xl font-bold text-gold-500 mt-2">{formatStats(paymentStats.balance)}</p>
              <p className="text-gray-500 text-xs mt-1">Get & Pay Ledger</p>
            </div>
            <div className="p-2 bg-gold-500/10 rounded-lg text-gold-500 group-hover:scale-110 transition-transform">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-700 pb-2">
        <h2 className="text-xl font-heading font-bold text-white">Your Sites</h2>
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search site by name..."
            className="w-full bg-navy-800 border border-navy-700 text-white text-sm rounded-lg pl-10 pr-4 py-2 focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-colors"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500"></div>
        </div>
      ) : sites.length === 0 ? (
        <div className="card border-dashed border-2 border-navy-600 bg-navy-800/50">
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-500 mb-3" />
            <p className="text-gray-300 font-medium">No sites found.</p>
            <p className="text-gray-500 text-sm mt-1 mb-4">Create your first site to get started managing expenses.</p>
            {!isEmployee && (
              <button className="btn-secondary" onClick={() => setIsModalOpen(true)}>
                Create Site
              </button>
            )}
          </div>
        </div>
      ) : filteredSites.length === 0 ? (
        <div className="card border-dashed border-2 border-navy-600 bg-navy-800/50">
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-500 mb-3" />
            <p className="text-gray-300 font-medium">No matching sites found.</p>
            <p className="text-gray-500 text-sm mt-1 mb-4">Try a different search term.</p>
            <button className="btn-secondary" onClick={() => setSearchQuery('')}>
              Clear Search
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto overflow-x-hidden min-h-0 max-h-[65vh] md:max-h-[70vh] pr-2 pb-4 custom-scrollbar">
          {filteredSites.map((site) => (
            <div key={site._id} className="card border-t-4 border-t-gold-500 hover:scale-[1.02] transition-all group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4 gap-2">
                  <h3 className="text-xl font-heading font-bold text-white group-hover:text-gold-500 transition-colors line-clamp-1 flex-1" title={site.siteName}>
                    {site.siteName}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-[10px] rounded-full font-bold uppercase tracking-wider ${site.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      site.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                      {site.status}
                    </span>
                    {!isEmployee && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSiteToDelete(site);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                        title="Delete Site"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-400">
                    <MapPin className="h-4 w-4 mr-2 text-red-500 fill-red-500/20" />
                    <span className="line-clamp-1">{site.siteLocation}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Started: {new Date(site.startDate).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex justify-between items-end mt-6 pt-4 border-t border-navy-700">
                  <div className="text-center md:text-left">
                    <p className="text-white font-bold text-lg leading-none">{site.workerCount || 0}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Workers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-lg leading-none">{formatStats(site.labourSpend || 0)}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Labour</p>
                  </div>
                  <div className="text-right md:text-left">
                    <p className="text-white font-bold text-lg leading-none">{formatStats(site.materialSpend || 0)}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Material</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-navy-700/50 text-[11px] text-gray-400">
                  <div>Other Exp: <span className="text-white font-semibold">{formatStats(site.otherExpenseSpend || 0)}</span></div>
                  <div>Total Spend: <span className="text-gold-500 font-bold">{formatStats((site.labourSpend || 0) + (site.materialPaid || 0) + (site.otherExpenseSpend || 0))}</span></div>
                </div>
              </div>

              <Link
                to={`/site/${site.slug}`}
                className={`mt-4 w-full flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-all ${site.status === 'completed'
                  ? 'bg-navy-900/50 border border-gold-500/30 text-gold-500 hover:bg-gold-500 hover:text-navy-900'
                  : 'bg-navy-700 hover:bg-navy-600 text-white'
                  }`}
              >
                {site.status === 'completed' ? 'View Reports' : 'Manage Site'} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      )}

      <CreateSiteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Delete Confirmation Modal */}
      {siteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-navy-900 border border-navy-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Delete Site?</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete <span className="font-bold text-white">{siteToDelete.siteName}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSiteToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-navy-800 hover:bg-navy-700 rounded-lg transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSite}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
