import React, { useEffect, useMemo } from 'react';
import useSupplierStore from '../store/supplierStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const SupplierReport = ({ siteId }) => {
  const { suppliers, fetchSuppliers, isLoading } = useSupplierStore();

  useEffect(() => {
    if (siteId) fetchSuppliers(siteId);
  }, [siteId, fetchSuppliers]);

  // Aggregate data for summary cards
  const uniqueSuppliers = new Set(suppliers.map(s => s.supplierName)).size;
  const totalSpend = suppliers.reduce((sum, s) => sum + (s.unit === 'Payment' ? 0 : (s.totalAmount || 0)), 0);
  const totalPaid = suppliers.reduce((sum, s) => sum + (s.amountPaid || 0), 0);
  const totalDue = totalSpend - totalPaid;

  // Aggregate data for the bar chart (by Material Category)
  const chartData = useMemo(() => {
    const materials = {};
    suppliers.forEach(s => {
      if (s.unit === 'Payment') return;
      if (!materials[s.materialName]) materials[s.materialName] = 0;
      materials[s.materialName] += (s.totalAmount || 0);
    });

    return Object.keys(materials).map(mat => ({
      name: mat,
      Amount: materials[mat]
    }));
  }, [suppliers]);

  if (isLoading) return <div className="text-gray-400 text-center py-8">Loading Report...</div>;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-gray-400 text-xs tracking-wider uppercase mb-2">Total Suppliers</h3>
          <p className="text-3xl font-bold text-gold-500">{uniqueSuppliers}</p>
        </div>
        <div className="card">
          <h3 className="text-gray-400 text-xs tracking-wider uppercase mb-2">Total Paid</h3>
          <p className="text-3xl font-bold text-green-500">₹{totalPaid.toLocaleString()}</p>
        </div>
        <div className="card">
          <h3 className="text-gray-400 text-xs tracking-wider uppercase mb-2">Balance Due</h3>
          <p className="text-3xl font-bold text-red-500">₹{totalDue.toLocaleString()}</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="card">
        <h3 className="text-gray-200 font-medium mb-6">Material Category Spend</h3>
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
                  tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000) + 'K' : value}`}
                />
                <Tooltip
                  cursor={{ fill: '#1e293b' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#3b82f6' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Total Cost']}
                />
                <Bar dataKey="Amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={80} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 border border-dashed border-navy-700 rounded">
              No material data to visualize
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierReport;
