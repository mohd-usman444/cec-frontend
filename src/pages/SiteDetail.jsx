import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useSiteStore from '../store/siteStore';
import WorkerModule from '../components/WorkerModule';
import SupplierModule from '../components/SupplierModule';
import WorkerReport from '../components/WorkerReport';
import SupplierReport from '../components/SupplierReport';
import { ArrowLeft, Building2, MapPin, Calendar as CalendarIcon, FileText, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const SiteDetail = () => {
  const { slug } = useParams();
  const { currentSite, getSiteDetails, updateSite, isLoading } = useSiteStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('worker-spend');
  const isEmployee = user?.role === 'employee';

  useEffect(() => {
    getSiteDetails(slug);

    return () => useSiteStore.getState().clearCurrentSite();
  }, [slug, getSiteDetails]);

  if (isLoading || !currentSite) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  const handleToggleStatus = async () => {
    const isCompleted = currentSite.status === 'completed';
    const newStatus = isCompleted ? 'active' : 'completed';
    const message = isCompleted
      ? 'Are you sure you want to reactivate this site?'
      : 'Are you sure you want to mark this site as COMPLETED? This will signal that the project is finished.';

    if (window.confirm(message)) {
      const success = await updateSite(currentSite._id, { status: newStatus });
      if (success) {
        toast.success(`Site marked as ${newStatus}`);
      } else {
        toast.error('Failed to update site status');
      }
    }
  };

  const tabs = [
    { id: 'worker-spend', label: 'Worker Spend', icon: '👷' },
    { id: 'supplier', label: 'Supplier', icon: '🧱' },
    { id: 'worker-report', label: 'Worker Report', icon: '📊' },
    { id: 'supplier-report', label: 'Supplier Report', icon: '📋' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header section */}
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-sm text-gray-400 hover:text-gold-500 transition-colors mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-white flex items-center gap-3">
              <Building2 className="h-8 w-8 text-gold-500" />
              {currentSite.siteName}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-400">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                {currentSite.siteLocation}
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1 text-gray-500" />
                Started: {new Date(currentSite.startDate).toLocaleDateString('en-GB')}
              </div>
              <div className={`px-2 py-0.5 rounded-full font-medium ${currentSite.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                currentSite.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                }`}>
                {currentSite.status.charAt(0).toUpperCase() + currentSite.status.slice(1)}
              </div>
            </div>
            {currentSite.description && (
              <div className="mt-3 flex items-start text-sm text-gray-300">
                <FileText className="h-4 w-4 mr-2 mt-0.5 text-gray-500 shrink-0" />
                <p>{currentSite.description}</p>
              </div>
            )}
          </div>
          {!isEmployee && (
            <div className="flex gap-2">
              <button
                onClick={handleToggleStatus}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg ${currentSite.status === 'completed'
                  ? 'bg-navy-800 text-gold-500 border border-gold-500/30 hover:bg-navy-700'
                  : 'bg-gold-500 text-navy-900 hover:bg-gold-400'
                  }`}
              >
                {currentSite.status === 'completed' ? (
                  <>
                    <Clock className="h-4 w-4" /> Reactivate Site
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" /> Mark as Completed
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-navy-700 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === tab.id
                ? 'border-gold-500 text-gold-500'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'worker-spend' && (
          <WorkerModule siteId={currentSite._id} isCompleted={currentSite.status === 'completed'} isReadOnly={isEmployee} />
        )}

        {activeTab === 'supplier' && (
          <SupplierModule siteId={currentSite._id} isCompleted={currentSite.status === 'completed'} isReadOnly={isEmployee} />
        )}

        {activeTab === 'worker-report' && (
          <WorkerReport siteId={currentSite._id} />
        )}

        {activeTab === 'supplier-report' && (
          <SupplierReport siteId={currentSite._id} />
        )}
      </div>
    </div>
  );
};

export default SiteDetail;
