import React, { useRef } from 'react';
import { FaPrint, FaDownload, FaEnvelope, FaShareAlt, FaArrowLeft, FaCheckCircle, FaClock, FaTimesCircle, FaLeaf } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

const Invoice = ({ order, onClose }) => {
  const invoiceRef = useRef();
  const companyInfo = {
    name: "Organic Beauty Store",
    address: "123 Green Street, Chennai, Tamil Nadu 600001",
    phone: "+91 98765 43210",
    email: "support@organicbeauty.com",
    gstin: "29ABCDE1234F1Z5",
    website: "www.organicbeauty.com"
  };

  // ✅ ORIGINAL: Get payment status display based on payment method and order status
  const getPaymentStatusInfo = () => {
    const method = order.payment_method?.toUpperCase();
    const status = order.payment_status;
    const orderStatus = order.order_status;
    
    // COD Orders - Special handling
    if (method === 'COD' || method === 'CASH ON DELIVERY') {
      if (orderStatus === 'delivered') {
        return {
          text: 'PAID',
          subtext: 'Cash on Delivery - Payment Received',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: <FaCheckCircle className="w-5 h-5" />,
          statusClass: 'text-green-600',
          badge: 'Paid',
          badgeColor: 'bg-green-600'
        };
      } else {
        return {
          text: 'PENDING',
          subtext: `Pay ₹${parseFloat(order.total_amount).toFixed(2)} on Delivery`,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          icon: <FaClock className="w-5 h-5" />,
          statusClass: 'text-yellow-600',
          badge: 'Due',
          badgeColor: 'bg-amber-500'
        };
      }
    }
    
    // Online/Prepaid Orders
    if (status === 'paid' || status === 'completed') {
      return {
        text: 'PAID',
        subtext: 'Payment Successful',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: <FaCheckCircle className="w-5 h-5" />,
        statusClass: 'text-green-600',
        badge: 'Paid',
        badgeColor: 'bg-green-600'
      };
    } else if (status === 'failed') {
      return {
        text: 'FAILED',
        subtext: 'Payment Failed',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: <FaTimesCircle className="w-5 h-5" />,
        statusClass: 'text-red-600',
        badge: 'Failed',
        badgeColor: 'bg-red-600'
      };
    } else {
      return {
        text: 'PENDING',
        subtext: 'Payment Processing',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        icon: <FaClock className="w-5 h-5" />,
        statusClass: 'text-yellow-600',
        badge: 'Pending',
        badgeColor: 'bg-blue-500'
      };
    }
  };

  const paymentInfo = getPaymentStatusInfo();

  // ORIGINAL: Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // ORIGINAL: Calculate totals
  const calculateItemTotal = (item) => {
    const price = parseFloat(item.price) || 0;
    return price * item.quantity;
  };

  const subtotal = order.items?.reduce((sum, item) => sum + calculateItemTotal(item), 0) || 0;
  
  // ✅ UPDATED: Shipping logic - Free for orders ₹299+, otherwise ₹40
  const shipping = subtotal >= 299 ? 0 : 50;
  const shippingText = subtotal >= 299 ? 'FREE' : '₹50.00';
  
  const tax = 0; // No tax
  const total = subtotal + shipping + tax;

  // ORIGINAL: Print invoice
  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: `Invoice_${order.id}_${order.customer_name}`,
    onAfterPrint: () => toast.success('Invoice printed!'),
  });

  // ORIGINAL: Download as PDF
  const downloadPDF = async () => {
    try {
      toast.loading('Generating PDF...');
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${order.id}_${order.customer_name}.pdf`);
      toast.dismiss();
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    }
  };

  // ORIGINAL: Share invoice
  const shareInvoice = () => {
    if (navigator.share) {
      navigator.share({
        title: `Invoice #${order.id}`,
        text: `Invoice for Order #${order.id} from Organic Beauty`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Invoice link copied to clipboard!');
    }
  };

  // ORIGINAL: Email invoice
  const emailInvoice = () => {
    toast.success(`Invoice sent to ${order.customer_email}`);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        
        {/* ✨ NEW: Fresh Header with Gradient */}
        <div className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 text-white px-10 py-8 overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FaLeaf className="w-6 h-6" />
                <h1 className="text-3xl font-bold">{companyInfo.name}</h1>
              </div>
              <p className="text-green-100 text-sm">Naturally Beautiful</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={downloadPDF}
                className="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md 
                         rounded-full transition-all duration-300 text-sm font-medium"
                title="Download PDF"
              >
                <FaDownload className="inline w-3.5 h-3.5 mr-2" />
                Download
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md 
                         rounded-full transition-all duration-300 text-sm font-medium"
                title="Print"
              >
                <FaPrint className="inline w-3.5 h-3.5 mr-2" />
                Print
              </button>
              <button
                onClick={emailInvoice}
                className="p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md 
                         rounded-full transition-all duration-300"
                title="Email Invoice"
              >
                <FaEnvelope className="w-4 h-4" />
              </button>
              <button
                onClick={shareInvoice}
                className="p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md 
                         rounded-full transition-all duration-300"
                title="Share"
              >
                <FaShareAlt className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md 
                         rounded-full transition-all duration-300 flex items-center justify-center ml-2"
                title="Close"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-136px)]">
          <div ref={invoiceRef} className="invoice-content p-10 bg-white">
            
            {/* ✨ NEW: Invoice Info Banner */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Invoice Number</p>
                  <h2 className="text-2xl font-bold text-gray-900">#{order.id}</h2>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Invoice Date</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    order.order_status === 'delivered' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {order.order_status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* ✨ NEW: Two Column Layout */}
            <div className="grid grid-cols-2 gap-8 mb-10">
              {/* From */}
              <div className="bg-green-50/50 rounded-xl p-6">
                <p className="text-xs text-green-600 uppercase tracking-wider font-semibold mb-3">From</p>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{companyInfo.name}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{companyInfo.address}</p>
                  <p className="mt-2">{companyInfo.email}</p>
                  <p>{companyInfo.phone}</p>
                  <p className="text-xs text-gray-400 mt-3">GSTIN: {companyInfo.gstin}</p>
                </div>
              </div>

              {/* To */}
              <div className="bg-blue-50/50 rounded-xl p-6">
                <p className="text-xs text-blue-600 uppercase tracking-wider font-semibold mb-3">Bill To</p>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{order.customer_name}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{order.customer_email}</p>
                  {order.customer_phone && <p>{order.customer_phone}</p>}
                  <p className="mt-3 text-gray-500 leading-relaxed">
                    {order.shipping_address}
                  </p>
                </div>
              </div>
            </div>

            {/* ✨ NEW: Items */}
            <div className="mb-8">
              <h3 className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-4">Order Items</h3>
              
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-100 text-xs text-gray-600 uppercase tracking-wider font-semibold">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>
                
                {order.items?.map((item, index) => (
                  <div key={index} 
                       className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-green-50/30 transition-colors">
                    <div className="col-span-6 flex items-center gap-3">
                      <img 
                        src={item.image?.startsWith('/uploads/') ? `http://${window.location.hostname}:5000${item.image}` : item.image || 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=100&h=100&fit=crop'} 
                        alt={item.product_name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <span className="font-medium text-gray-900">{item.product_name}</span>
                    </div>
                    <div className="col-span-2 text-center text-gray-600 flex items-center justify-center">{item.quantity}</div>
                    <div className="col-span-2 text-right text-gray-600 flex items-center justify-end">
                      ₹{(parseFloat(item.price) || 0).toFixed(2)}
                    </div>
                    <div className="col-span-2 text-right font-semibold text-gray-900 flex items-center justify-end">
                      ₹{calculateItemTotal(item).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ✨ NEW: Summary & Payment Grid */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* Payment Status Card */}
              <div className={`rounded-xl p-6 ${paymentInfo.bgColor.replace('100', '50')}`}>
                <div className="flex items-start gap-3">
                  <span className={`${paymentInfo.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                    {paymentInfo.badge}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Payment Status</p>
                    <p className={`text-sm font-semibold ${paymentInfo.color}`}>
                      {paymentInfo.text}
                    </p>
                    <p className={`text-xs mt-1 ${paymentInfo.color}`}>
                      {paymentInfo.subtext}
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      Method: {order.payment_method?.toUpperCase() || 'CASH ON DELIVERY'}
                    </p>

                    {/* COD Notes */}
                    {(order.payment_method?.toUpperCase() === 'COD' || 
                      order.payment_method?.toUpperCase() === 'CASH ON DELIVERY') && 
                     order.order_status !== 'delivered' && (
                      <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded-lg">
                        <p className="text-xs text-yellow-800">
                          💰 Keep cash ready for delivery
                        </p>
                      </div>
                    )}

                    {(order.payment_method?.toUpperCase() === 'COD' || 
                      order.payment_method?.toUpperCase() === 'CASH ON DELIVERY') && 
                     order.order_status === 'delivered' && (
                      <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded-lg">
                        <p className="text-xs text-green-800 flex items-center gap-1">
                          <FaCheckCircle className="w-3 h-3" />
                          Payment received!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ✨ NEW: Total Card with Gradient */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white">
                <div className="space-y-2 text-sm mb-3">
                  <div className="flex justify-between opacity-90">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between opacity-90">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'font-semibold' : ''}>
                      {shippingText}
                    </span>
                  </div>
                  {shipping === 0 && subtotal < 299 && (
                    <p className="text-xs opacity-75 italic">Free shipping on orders ₹299+</p>
                  )}
                  {shipping > 0 && (
                    <p className="text-xs opacity-75 italic">Add ₹{(299 - subtotal).toFixed(2)} more for free shipping</p>
                  )}
                  <div className="flex justify-between opacity-90">
                    <span>Tax</span>
                    <span>Included</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/20">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-semibold">Total Amount</span>
                    <span className="text-3xl font-bold">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Footer */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="mb-4">
                <p className="text-sm font-bold text-gray-700 mb-2">Terms & Conditions:</p>
                <ul className="text-xs text-gray-600 space-y-1 list-disc pl-5">
                  <li>Payment is due within 15 days</li>
                  <li>Please include invoice number with payment</li>
                  <li>All amounts are in Indian Rupees (₹)</li>
                  <li>No returns after 7 days of delivery</li>
                  <li>Free shipping on orders above ₹299</li>
                </ul>
              </div>
              
              <div className="border-t border-gray-200 pt-4 text-center">
                <p className="text-sm text-gray-600 mb-2">Thank you for your purchase! 🌿</p>
                <p className="text-xs text-gray-500">
                  Questions? Contact us at {companyInfo.email} or {companyInfo.phone}
                </p>
                <p className="text-xs text-gray-400 mt-3">
                  This is a digitally generated invoice
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ✨ NEW: Bottom Action Bar */}
        <div className="bg-gray-50 px-8 py-5 border-t flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 
                     transition-colors flex items-center gap-2 font-medium"
          >
            <FaArrowLeft className="w-3.5 h-3.5" />
            Back to Orders
          </button>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 
                       transition-colors flex items-center gap-2 font-medium"
            >
              <FaPrint className="w-4 h-4" />
              Print Invoice
            </button>
            <button
              onClick={downloadPDF}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                       transition-colors flex items-center gap-2 font-medium"
            >
              <FaDownload className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 20mm;
          }
          
          body * {
            visibility: hidden;
          }
          
          .invoice-content,
          .invoice-content * {
            visibility: visible;
          }
          
          .invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
          }
          
          button, nav, footer {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Invoice;