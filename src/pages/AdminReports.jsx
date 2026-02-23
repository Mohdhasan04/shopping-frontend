// pages/AdminReports.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BarChart3, 
  Package, 
  FileText, 
  Printer,
  Download,
  Calendar,
  TrendingUp,
  Users
} from 'lucide-react';

const AdminReports = () => {
  const navigate = useNavigate();
  const [activeReport, setActiveReport] = useState('sales');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('month');
  const [year, setYear] = useState(new Date().getFullYear());

  // Available reports
  const reports = [
    { 
      id: 'sales', 
      name: 'Sales Report', 
      icon: <BarChart3 size={24} />,
      description: 'Revenue, orders, and growth metrics'
    },
    { 
      id: 'orders', 
      name: 'Order Status', 
      icon: <Package size={24} />,
      description: 'Order tracking and status overview'
    },
    { 
      id: 'inventory', 
      name: 'Inventory Report', 
      icon: <FileText size={24} />,
      description: 'Stock levels and alerts'
    }
  ];

  // Period options
  const periods = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Years for dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Load report data
  const loadReport = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      
      switch(activeReport) {
        case 'sales':
          endpoint = `/api/admin/reports/sales?period=${period}&year=${year}`;
          break;
        case 'orders':
          endpoint = '/api/admin/reports/order-status';
          break;
        case 'inventory':
          endpoint = '/api/admin/reports/inventory';
          break;
        default:
          endpoint = `/api/admin/reports/sales?period=${period}`;
      }

      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setReportData(response.data.report);
    } catch (error) {
      console.error('Failed to load report:', error);
      alert('Failed to load report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load report on component mount and when report type/period changes
  useEffect(() => {
    loadReport();
  }, [activeReport, period, year]);

  // Handle print
  const handlePrint = async () => {
    try {
      const response = await axios.get(`/api/admin/reports/sales/print?period=${period}&year=${year}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Open print dialog with formatted content
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>${response.data.report.title}</title>
            <style>
              @media print {
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
                .summary { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background: #f2f2f2; }
                .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #000; text-align: center; }
                @page { margin: 20mm; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${response.data.report.company || 'ORGANIC BEAUTY'}</h1>
              <h2>${response.data.report.title}</h2>
              <p>${response.data.report.period || 'Period: ' + period}</p>
              <p>Generated: ${new Date(response.data.report.generated).toLocaleString()}</p>
            </div>
            
            <div class="summary">
              <h3>Summary</h3>
              <p>Total Sales: ₹${response.data.report.summary?.total_sales || '0.00'}</p>
              <p>Total Orders: ${response.data.report.summary?.total_orders || 0}</p>
            </div>
            
            <button onclick="window.print()" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; cursor: pointer; margin-bottom: 20px;">
              Print Report
            </button>
            
            <div class="footer">
              <p>${response.data.report.footer?.notes || 'Auto-generated report'}</p>
              <p>Date: ${new Date().toLocaleDateString()}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      
    } catch (error) {
      console.error('Print error:', error);
      alert('Failed to generate print report.');
    }
  };

  // Handle download as PDF/Excel
  const handleDownload = async (format) => {
    try {
      let endpoint = '';
      let filename = '';
      
      if (format === 'pdf') {
        endpoint = `/api/admin/reports/${activeReport}/pdf?period=${period}`;
        filename = `${activeReport}_report_${period}.pdf`;
      } else if (format === 'excel') {
        endpoint = `/api/admin/reports/${activeReport}/excel?period=${period}`;
        filename = `${activeReport}_report_${period}.xlsx`;
      }
      
      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (error) {
      console.error('Download error:', error);
      alert('Download feature coming soon!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Analytics & Reports</h1>
        <p className="text-gray-600 mt-2">View and analyze your store performance</p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Report Selection */}
        <div className="lg:col-span-1 space-y-4">
          {reports.map(report => (
            <button
              key={report.id}
              onClick={() => setActiveReport(report.id)}
              className={`w-full p-4 rounded-xl border transition-all duration-300 text-left ${
                activeReport === report.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  activeReport === report.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {report.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{report.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                </div>
              </div>
            </button>
          ))}
          
          {/* Period Selector (for sales report) */}
          {activeReport === 'sales' && (
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Calendar size={18} className="mr-2" />
                Time Period
              </h3>
              <div className="space-y-3">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {periods.map(p => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                
                {period === 'year' && (
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Content - Report Display */}
        <div className="lg:col-span-3">
          {/* Report Header with Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {activeReport === 'sales' && 'Sales Report'}
                  {activeReport === 'orders' && 'Order Status Report'}
                  {activeReport === 'inventory' && 'Inventory Report'}
                </h2>
                {reportData && (
                  <p className="text-gray-600 text-sm mt-1">
                    Generated: {new Date(reportData.generated_at).toLocaleString()}
                  </p>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Printer size={18} />
                  <span>Print</span>
                </button>
                
                <button
                  onClick={() => handleDownload('pdf')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <Download size={18} />
                  <span>PDF</span>
                </button>
                
                <button
                  onClick={() => handleDownload('excel')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <Download size={18} />
                  <span>Excel</span>
                </button>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading report data...</p>
              </div>
            ) : reportData ? (
              <div>
                {/* SALES REPORT */}
                {activeReport === 'sales' && (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-blue-700">Total Sales</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">
                              ₹{reportData.total_sales?.toLocaleString() || '0'}
                            </p>
                          </div>
                          <TrendingUp className="text-blue-600" size={24} />
                        </div>
                        <p className="text-sm text-blue-600 mt-2">
                          {reportData.sales_growth > 0 ? '↑' : '↓'} 
                          {Math.abs(reportData.sales_growth || 0)}% from previous period
                        </p>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-green-700">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">
                              {reportData.total_orders?.toLocaleString() || '0'}
                            </p>
                          </div>
                          <Package className="text-green-600" size={24} />
                        </div>
                        <p className="text-sm text-green-600 mt-2">
                          {reportData.orders_growth > 0 ? '↑' : '↓'} 
                          {Math.abs(reportData.orders_growth || 0)}% growth
                        </p>
                      </div>
                      
                      <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-purple-700">Avg. Order Value</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">
                              ₹{reportData.average_order_value || '0'}
                            </p>
                          </div>
                          <Users className="text-purple-600" size={24} />
                        </div>
                        <p className="text-sm text-purple-600 mt-2">
                          {reportData.unique_customers || '0'} unique customers
                        </p>
                      </div>
                      
                      <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-orange-700">Items Sold</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">
                              {reportData.total_items_sold?.toLocaleString() || '0'}
                            </p>
                          </div>
                          <BarChart3 className="text-orange-600" size={24} />
                        </div>
                        <p className="text-sm text-orange-600 mt-2">
                          Across all categories
                        </p>
                      </div>
                    </div>
                    
                    {/* Top Products */}
                    {reportData.top_products && reportData.top_products.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Products</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {reportData.top_products.map((product, index) => (
                                <tr key={product.id}>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center space-x-3">
                                      <div className="flex-shrink-0 h-10 w-10">
                                        <img
                                          src={product.image || '/api/placeholder/40/40'}
                                          alt={product.name}
                                          className="h-10 w-10 rounded-lg object-cover"
                                        />
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900">{product.name}</p>
                                        <p className="text-sm text-gray-500">{product.category}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                      {product.quantity_sold} sold
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 font-medium">₹{product.revenue?.toFixed(2)}</td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-sm ${
                                      product.stock > 20 
                                        ? 'bg-green-100 text-green-800'
                                        : product.stock > 0
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {product.stock} in stock
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* ORDER STATUS REPORT */}
                {activeReport === 'orders' && (
                  <div className="space-y-6">
                    {reportData.summary?.status_counts && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Status Overview</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {reportData.summary.status_counts.map(status => (
                            <div key={status.status} className="bg-gray-50 p-4 rounded-xl text-center">
                              <p className="text-2xl font-bold text-gray-800">{status.count}</p>
                              <p className="text-sm text-gray-600 capitalize mt-1">{status.status}</p>
                              <p className="text-xs text-gray-500 mt-1">{status.percentage}%</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* INVENTORY REPORT */}
                {activeReport === 'inventory' && (
                  <div className="space-y-6">
                    {reportData.products_by_stock && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Stock Status</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                            <p className="text-sm text-red-700">Out of Stock</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">
                              {reportData.summary?.out_of_stock || 0}
                            </p>
                            <p className="text-xs text-red-600 mt-1">products need restocking</p>
                          </div>
                          
                          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                            <p className="text-sm text-yellow-700">Low Stock</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">
                              {reportData.summary?.low_stock || 0}
                            </p>
                            <p className="text-xs text-yellow-600 mt-1">products running low</p>
                          </div>
                          
                          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                            <p className="text-sm text-green-700">Healthy Stock</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">
                              {reportData.summary?.healthy_stock || 0}
                            </p>
                            <p className="text-xs text-green-600 mt-1">products in good condition</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Select a report to view analytics</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;