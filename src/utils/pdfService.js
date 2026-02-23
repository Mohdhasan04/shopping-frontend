import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ✅ Generate PDF for dashboard
export const generateDashboardPDF = async (dashboardData, period) => {
  try {
    // Create PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Set document properties
    doc.setProperties({
      title: `Sales Report - ${period}`,
      subject: 'Dashboard Sales Statistics',
      author: 'Organic Beauty Store',
      keywords: 'sales, report, dashboard, statistics',
      creator: 'Organic Beauty Admin Dashboard'
    });
    
    // Add header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('SALES DASHBOARD REPORT', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Period: ${period}`, 105, 30, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 36, { align: 'center' });
    
    // Add logo/header line
    doc.setDrawColor(76, 175, 80); // Green color
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);
    
    let yPosition = 50;
    
    // Add summary stats
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('SUMMARY STATISTICS', 20, yPosition);
    yPosition += 10;
    
    // Summary table
    const summaryData = [
      ['Total Sales', `₹${dashboardData.total_sales?.toLocaleString() || '0'}`],
      ['Total Orders', dashboardData.total_orders?.toLocaleString() || '0'],
      ['Customers', dashboardData.unique_customers?.toLocaleString() || '0'],
      ['Items Sold', dashboardData.total_items_sold?.toLocaleString() || '0'],
      ['Avg Order Value', `₹${dashboardData.average_order_value?.toFixed(2) || '0.00'}`]
    ];
    
    // Draw summary table
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    
    summaryData.forEach((row, index) => {
      const y = yPosition + (index * 8);
      doc.text(row[0], 25, y);
      doc.text(row[1], 120, y, { align: 'right' });
    });
    
    yPosition += 45;
    
    // Add growth stats
    if (dashboardData.sales_growth || dashboardData.orders_growth) {
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text('PERFORMANCE GROWTH', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(11);
      const growthData = [];
      
      if (dashboardData.sales_growth) {
        growthData.push(['Sales Growth', `${dashboardData.sales_growth >= 0 ? '+' : ''}${dashboardData.sales_growth.toFixed(1)}%`]);
      }
      
      if (dashboardData.orders_growth) {
        growthData.push(['Orders Growth', `${dashboardData.orders_growth >= 0 ? '+' : ''}${dashboardData.orders_growth.toFixed(1)}%`]);
      }
      
      growthData.forEach((row, index) => {
        const y = yPosition + (index * 8);
        doc.text(row[0], 25, y);
        doc.setTextColor(row[1].includes('+') ? 76 : 244, 175, row[1].includes('+') ? 80 : 67);
        doc.text(row[1], 120, y, { align: 'right' });
        doc.setTextColor(60, 60, 60);
      });
      
      yPosition += 30;
    }
    
    // Add top products
    if (dashboardData.top_products && dashboardData.top_products.length > 0) {
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text('TOP SELLING PRODUCTS', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      
      // Table header
      doc.setFillColor(240, 240, 240);
      doc.rect(20, yPosition - 5, 170, 7, 'F');
      doc.setTextColor(80, 80, 80);
      doc.setFont(undefined, 'bold');
      doc.text('Product', 22, yPosition);
      doc.text('Qty Sold', 100, yPosition);
      doc.text('Revenue', 140, yPosition);
      doc.text('Rank', 180, yPosition);
      
      yPosition += 8;
      
      // Table rows
      doc.setFont(undefined, 'normal');
      dashboardData.top_products.slice(0, 5).forEach((product, index) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setTextColor(60, 60, 60);
        doc.text(product.name.substring(0, 30), 22, yPosition);
        doc.text(product.quantity_sold.toString(), 100, yPosition);
        doc.text(`₹${product.revenue.toLocaleString()}`, 140, yPosition);
        
        // Rank with colored circle
        const rankColors = [
          { fill: [255, 193, 7], text: [0, 0, 0] }, // Gold
          { fill: [158, 158, 158], text: [255, 255, 255] }, // Silver
          { fill: [205, 127, 50], text: [255, 255, 255] }, // Bronze
          { fill: [33, 150, 243], text: [255, 255, 255] }, // Blue
          { fill: [76, 175, 80], text: [255, 255, 255] }  // Green
        ];
        
        const color = rankColors[index] || { fill: [100, 100, 100], text: [255, 255, 255] };
        doc.setFillColor(...color.fill);
        doc.circle(177, yPosition - 1.5, 2.5, 'F');
        doc.setTextColor(...color.text);
        doc.text((index + 1).toString(), 177, yPosition, { align: 'center' });
        
        yPosition += 8;
      });
      
      yPosition += 15;
    }
    
    // Add category sales
    if (dashboardData.category_sales && dashboardData.category_sales.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text('CATEGORY PERFORMANCE', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      
      // Table header
      doc.setFillColor(240, 240, 240);
      doc.rect(20, yPosition - 5, 170, 7, 'F');
      doc.setTextColor(80, 80, 80);
      doc.setFont(undefined, 'bold');
      doc.text('Category', 22, yPosition);
      doc.text('Sales', 100, yPosition);
      doc.text('Items Sold', 140, yPosition);
      doc.text('% of Total', 180, yPosition);
      
      yPosition += 8;
      
      // Calculate total for percentage
      const totalCategorySales = dashboardData.category_sales.reduce((sum, cat) => sum + cat.total_sales, 0);
      
      // Table rows
      doc.setFont(undefined, 'normal');
      dashboardData.category_sales.forEach((category, index) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        const percentage = totalCategorySales > 0 ? (category.total_sales / totalCategorySales * 100).toFixed(1) : 0;
        
        doc.setTextColor(60, 60, 60);
        doc.text(category.name, 22, yPosition);
        doc.text(`₹${category.total_sales.toLocaleString()}`, 100, yPosition);
        doc.text(category.items_sold.toString(), 140, yPosition);
        doc.text(`${percentage}%`, 180, yPosition);
        
        yPosition += 8;
      });
      
      yPosition += 15;
    }
    
    // Add recent orders
    if (dashboardData.recent_orders && dashboardData.recent_orders.length > 0) {
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text('RECENT ORDERS', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(9);
      
      dashboardData.recent_orders.slice(0, 5).forEach((order, index) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        const date = new Date(order.created_at).toLocaleDateString('en-IN');
        
        // Order row
        doc.setTextColor(60, 60, 60);
        doc.text(`Order #${order.id}`, 22, yPosition);
        doc.text(order.customer_name.substring(0, 15), 60, yPosition);
        doc.text(`₹${order.total_amount.toFixed(2)}`, 100, yPosition);
        
        // Status with color
        const statusColors = {
          'delivered': [76, 175, 80],
          'shipped': [33, 150, 243],
          'pending': [255, 193, 7],
          'confirmed': [156, 39, 176],
          'cancelled': [244, 67, 54]
        };
        
        const statusColor = statusColors[order.order_status] || [100, 100, 100];
        doc.setTextColor(...statusColor);
        doc.text(order.order_status.toUpperCase(), 130, yPosition);
        
        doc.setTextColor(60, 60, 60);
        doc.text(date, 170, yPosition);
        
        yPosition += 8;
      });
    }
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      doc.text('Organic Beauty Store - Admin Dashboard', 105, 293, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 296, { align: 'center' });
    }
    
    // Save the PDF
    const filename = `sales-report-${period.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`;
    doc.save(filename);
    
    return { success: true, filename };
    
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    return { success: false, error: error.message };
  }
};

// ✅ Generate PDF from HTML element (for dashboard screenshot)
export const generateHTMLtoPDF = async (elementId, filename = 'dashboard-report.pdf') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }
    
    // Add loading state
    element.style.opacity = '0.9';
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    
    // Add footer
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text('Organic Beauty Store - Dashboard Report', 105, 290, { align: 'center' });
    
    // Save PDF
    pdf.save(filename);
    
    // Restore element
    element.style.opacity = '1';
    
    return { success: true, filename };
    
  } catch (error) {
    console.error('❌ HTML to PDF error:', error);
    return { success: false, error: error.message };
  }
};

// ✅ Generate detailed order report
export const generateOrderReportPDF = (orders, period) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('ORDER DETAILS REPORT', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Period: ${period}`, 105, 30, { align: 'center' });
  doc.text(`Total Orders: ${orders.length}`, 105, 36, { align: 'center' });
  
  let yPosition = 50;
  
  orders.forEach((order, index) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text(`Order #${order.id}`, 20, yPosition);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    yPosition += 8;
    doc.text(`Customer: ${order.customer_name}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Email: ${order.customer_email}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Amount: ₹${order.total_amount}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Status: ${order.order_status}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 20, yPosition);
    yPosition += 10;
    
    // Add separator
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 15;
  });
  
  const filename = `order-report-${period}-${Date.now()}.pdf`;
  doc.save(filename);
  
  return filename;
};