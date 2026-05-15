import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import useSiteStore from '../store/siteStore';
import CreateSiteModal from '../components/CreateSiteModal';
import { Building2, Calendar, MapPin, ArrowRight, Wallet, Download, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import usePaymentStore from '../store/paymentStore';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { sites, fetchSites, stats, fetchStats, isLoading } = useSiteStore();
  const { fetchPayments, getStats } = usePaymentStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const exportToCSV = () => {
    const data = sites.map(s => ({
      SiteName: s.siteName,
      Location: s.siteLocation,
      Status: s.status,
      Started: new Date(s.startDate).toLocaleDateString('en-GB'),
      Workers: s.workerCount || 0,
      LabourSpend: s.labourSpend || 0,
      MaterialSpend: s.materialSpend || 0,
      TotalSpend: (s.labourSpend || 0) + (s.materialSpend || 0)
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
    doc.text(`Total Worker Spend: INR ${stats.totalWorkerSpend} | Total Material Spend: INR ${stats.totalSupplierSpend}`, 14, 38);

    let yPos = 50;
    doc.setFontSize(12);
    doc.setTextColor(0);
    const headers = ["Site Name", "Location", "Status", "Started", "Workers", "Labour", "Material"];
    const xPositions = [14, 60, 110, 140, 180, 210, 240];

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
      doc.text(s.siteLocation, 60, yPos);
      doc.text(s.status, 110, yPos);
      doc.text(new Date(s.startDate).toLocaleDateString('en-GB'), 140, yPos);
      doc.text(`${s.workerCount || 0}`, 180, yPos);
      doc.text(`${s.labourSpend || 0}`, 210, yPos);
      doc.text(`${s.materialSpend || 0}`, 240, yPos);
      yPos += 8;
    });

    doc.save(`Dashboard_Sites_Overview_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Exporting to PDF...');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-wide">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, {user?.fullName}</p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2">
            <button onClick={exportToCSV} className="p-2.5 bg-navy-800 hover:bg-navy-700 rounded-lg text-gray-300 transition-colors border border-navy-700" title="Export to Excel">
              <Download className="h-5 w-5" />
            </button>
            <button onClick={exportToPDF} className="p-2.5 bg-navy-800 hover:bg-navy-700 rounded-lg text-gray-300 transition-colors border border-navy-700" title="Export to PDF">
              <FileText className="h-5 w-5" />
            </button>
          </div>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            + Create New Site
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

      <div className="mb-6">
        <h2 className="text-xl font-heading font-bold text-white border-b border-navy-700 pb-2">Your Sites</h2>
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
            <button className="btn-secondary" onClick={() => setIsModalOpen(true)}>
              Create Site
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <div key={site._id} className="card border-t-4 border-t-gold-500 hover:scale-[1.02] transition-all group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-heading font-bold text-white group-hover:text-gold-500 transition-colors line-clamp-1">
                    {site.siteName}
                  </h3>
                  <span className={`px-2 py-1 text-[10px] rounded-full font-bold uppercase tracking-wider ${site.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      site.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                    {site.status}
                  </span>
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
    </div>
  );
};

export default Dashboard;
