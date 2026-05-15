import React, { useEffect, useMemo } from 'react';
import useWorkerStore from '../store/workerStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const WorkerReport = ({ siteId }) => {
  const { workers, fetchWorkers, isLoading } = useWorkerStore();

  useEffect(() => {
    if (siteId) fetchWorkers(siteId);
  }, [siteId, fetchWorkers]);

  // Aggregate data for summary cards
  const totalWorkers = workers.length;
  const totalPaid = workers.reduce((sum, w) => w.paymentMode !== 'Pending' ? sum + w.totalAmount : sum, 0);
  const totalPending = workers.reduce((sum, w) => w.paymentMode === 'Pending' ? sum + w.totalAmount : sum, 0);
  
  // Aggregate data for the bar chart (by Role)
  const chartData = useMemo(() => {
    const roles = {};
    workers.forEach(w => {
      if (!roles[w.role]) roles[w.role] = 0;
      roles[w.role] += w.totalAmount;
    });
    
    return Object.keys(roles).map(role => ({
      name: role,
      Amount: roles[role]
    }));
  }, [workers]);

  if (isLoading) return <div className="text-gray-400 text-center py-8">Loading Report...</div>;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-gray-400 text-xs tracking-wider uppercase mb-2">Total Workers</h3>
          <p className="text-3xl font-bold text-gold-500">{totalWorkers}</p>
        </div>
        <div className="card">
          <h3 className="text-gray-400 text-xs tracking-wider uppercase mb-2">Total Paid</h3>
          <p className="text-3xl font-bold text-green-500">₹{totalPaid.toLocaleString()}</p>
        </div>
        <div className="card">
          <h3 className="text-gray-400 text-xs tracking-wider uppercase mb-2">Pending</h3>
          <p className="text-3xl font-bold text-red-500">₹{totalPending.toLocaleString()}</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="card">
        <h3 className="text-gray-200 font-medium mb-6">Worker Expense by Role</h3>
        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `₹${value >= 1000 ? (value/1000) + 'K' : value}`}
                />
                <Tooltip 
                  cursor={{fill: '#1e293b'}} 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#eab308' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Spent']}
                />
                <Bar dataKey="Amount" fill="#eab308" radius={[4, 4, 0, 0]} barSize={80} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 border border-dashed border-navy-700 rounded">
              No worker data to visualize
            </div>
          )}
        </div>
        
        {/* Payment Type Split (Bottom area matching screenshot) */}
        <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-navy-700">
           <div className="text-center p-4 rounded-lg bg-navy-900/50">
              <p className="text-xs text-gray-400 mb-1">Cash Payments</p>
              <p className="text-xl font-bold text-green-500">
                 ₹{workers.reduce((s, w) => w.paymentMode === 'Cash' ? s + w.totalAmount : s, 0).toLocaleString()}
              </p>
           </div>
           <div className="text-center p-4 rounded-lg bg-navy-900/50">
              <p className="text-xs text-gray-400 mb-1">Online Payments</p>
              <p className="text-xl font-bold text-blue-400">
                 ₹{workers.reduce((s, w) => w.paymentMode === 'Online' ? s + w.totalAmount : s, 0).toLocaleString()}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerReport;
