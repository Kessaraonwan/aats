// Email Provider using SendGrid
import sgMail from '@sendgrid/mail';

/**
 * Initialize SendGrid
 * เรียกฟังก์ชันนี้ก่อนส่งอีเมล
 */
export function initializeEmail(apiKey) {
  if (!apiKey) {
    console.warn('⚠️ SendGrid API key not found. Email features disabled.');
    return false;
  }
  
  sgMail.setApiKey(apiKey);
  console.log('✅ SendGrid initialized');
  return true;
}

/**
 * Send Email via SendGrid
 * @param {Object} options
 * @param {string} options.to - Email ผู้รับ
 * @param {string} options.subject - หัวข้ออีเมล
 * @param {string} options.html - เนื้อหา HTML
 * @param {string} options.from - Email ผู้ส่ง (optional)
 * @param {Array} options.attachments - ไฟล์แนบ (optional)
 */
export async function sendEmail({ to, subject, html, from = 'noreply@company.com', attachments = [] }) {
  // Check if in test mode
  const isTestMode = import.meta.env.MODE === 'development' || !import.meta.env.VITE_SENDGRID_API_KEY;
  
  if (isTestMode) {
    console.log('📧 [TEST MODE] Email would be sent:');
    console.log('  To:', to);
    console.log('  Subject:', subject);
    console.log('  HTML Preview:', html.substring(0, 150) + '...');
    console.log('  Attachments:', attachments.length, 'files');
    
    // Return fake success
    return {
      success: true,
      messageId: 'test-' + Date.now(),
      mode: 'test',
    };
  }

  try {
    const msg = {
      to,
      from,
      subject,
      html,
      attachments: attachments.map(att => ({
        content: att.content,
        filename: att.filename,
        type: att.type || 'application/pdf',
        disposition: 'attachment',
      })),
    };

    const response = await sgMail.send(msg);
    
    console.log('✅ Email sent successfully:', {
      to,
      subject,
      messageId: response[0].headers['x-message-id'],
    });

    return {
      success: true,
      messageId: response[0].headers['x-message-id'],
      mode: 'production',
    };
  } catch (error) {
    console.error('❌ Email send failed:', error);
    
    if (error.response) {
      console.error('SendGrid Error:', error.response.body);
    }

    return {
      success: false,
      error: error.message,
      mode: 'production',
    };
  }
}

/**
 * Verify Email Configuration
 * ตรวจสอบว่า setup ถูกต้องหรือไม่
 */
export async function verifyEmailSetup() {
  const apiKey = import.meta.env.VITE_SENDGRID_API_KEY;
  
  if (!apiKey) {
    return {
      configured: false,
      message: 'VITE_SENDGRID_API_KEY not found in environment variables',
      mode: 'test',
    };
  }

  if (apiKey.startsWith('SG.')) {
    return {
      configured: true,
      message: 'SendGrid API key detected',
      mode: 'production',
    };
  }

  return {
    configured: false,
    message: 'Invalid SendGrid API key format',
    mode: 'test',
  };
}

export default { initializeEmail, sendEmail, verifyEmailSetup };
