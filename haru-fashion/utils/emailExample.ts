/**
 * Example of how to use the order confirmation email template
 */

import { generateOrderConfirmationEmailVi } from './emailTemplates';
import nodemailer from 'nodemailer';

// Example order data
const sampleOrderData = {
  orderId: 'ORD12345',
  orderDate: '15/07/2023 14:30',
  customerName: 'Nguyễn Văn A',
  customerEmail: 'nguyenvana@example.com',
  customerPhone: '0912345678',
  shippingAddress: 'Số 123, Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM',
  paymentMethod: 'Thanh toán khi nhận hàng (COD)',
  deliveryMethod: 'Giao hàng nhanh',
  products: [
    {
      name: 'Áo Thun Nam Trắng Basic',
      quantity: 2,
      price: 250000,
      color: 'Trắng',
      size: 'XL',
      image: 'https://example.com/product1.jpg'
    },
    {
      name: 'Quần Jean Nam Xanh Đậm Slim Fit',
      quantity: 1,
      price: 450000,
      color: 'Xanh đậm',
      size: '32',
      image: 'https://example.com/product2.jpg'
    }
  ],
  subtotal: 950000,
  deliveryFee: 30000,
  discount: 95000,
  total: 885000,
  orderStatus: 'processing'
};

/**
 * Function to send order confirmation email
 */
async function sendOrderConfirmationEmail(orderData: any, emailTo: string) {
  try {
    // Create email HTML content
    const htmlContent = generateOrderConfirmationEmailVi(orderData);
    
    // Create a test SMTP transporter
    // For production, use your actual email service credentials
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'your-email@example.com',
        pass: process.env.SMTP_PASS || 'your-password'
      }
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"Lumen Fashion" <${process.env.SMTP_USER || 'noreply@lumenfashion.com'}>`,
      to: emailTo,
      subject: `Xác nhận đơn hàng #${orderData.orderId} - Lumen Fashion`,
      html: htmlContent
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

// Example usage (uncomment to use)
// sendOrderConfirmationEmail(sampleOrderData, 'customer@example.com')
//   .then(result => console.log('Email sending result:', result))
//   .catch(err => console.error('Error:', err));

export { sendOrderConfirmationEmail }; 