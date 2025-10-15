import { toast } from 'sonner';

// Enhanced toast with better styling (without JSX icons - using emoji fallbacks)
export const showToast = {
  success: (message, description) => {
    toast.success(message, {
      description,
      duration: 3000,
    });
  },

  error: (message, description) => {
    toast.error(message, {
      description,
      duration: 4000,
    });
  },

  warning: (message, description) => {
    toast.warning(message, {
      description,
      duration: 3500,
    });
  },

  info: (message, description) => {
    toast.info(message, {
      description,
      duration: 3000,
    });
  },

  loading: (message) => {
    return toast.loading(message, {
      duration: Infinity,
    });
  },

  promise: (promise, messages) => {
    return toast.promise(promise, {
      loading: messages.loading || 'กำลังดำเนินการ...',
      success: messages.success || 'สำเร็จ!',
      error: messages.error || 'เกิดข้อผิดพลาด',
    });
  },

  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  dismissAll: () => {
    toast.dismiss();
  }
};

// Common toast messages for AATS
export const toastMessages = {
  // Application
  applicationSubmitted: () => showToast.success(
    'ส่งใบสมัครสำเร็จ',
    'ทีม HR จะตรวจสอบใบสมัครของคุณภายใน 3-5 วันทำการ'
  ),
  
  applicationWithdrawn: () => showToast.info(
    'ถอนใบสมัครเรียบร้อย',
    'คุณสามารถสมัครตำแหน่งอื่นได้'
  ),

  draftSaved: () => showToast.success(
    'บันทึกร่างเรียบร้อย',
    'คุณสามารถกลับมาทำต่อได้ในภายหลัง'
  ),

  // Evaluation
  evaluationSubmitted: () => showToast.success(
    'บันทึกการประเมินสำเร็จ',
    'การประเมินถูกส่งไปยังทีม HR แล้ว'
  ),

  // Profile
  profileUpdated: () => showToast.success(
    'อัพเดทโปรไฟล์สำเร็จ',
    'ข้อมูลของคุณได้รับการบันทึกแล้ว'
  ),

  // Errors
  networkError: () => showToast.error(
    'เกิดข้อผิดพลาดในการเชื่อมต่อ',
    'กรุณาตรวจสอบอินเทอร์เน็ตและลองใหม่อีกครั้ง'
  ),

  serverError: () => showToast.error(
    'เซิร์ฟเวอร์ขัดข้อง',
    'เรากำลังแก้ไขปัญหา กรุณาลองใหม่ในภายหลัง'
  ),

  validationError: (message) => showToast.warning(
    'กรุณาตรวจสอบข้อมูล',
    message || 'มีข้อมูลบางส่วนไม่ถูกต้อง'
  ),

  // Authentication
  loginSuccess: (name) => showToast.success(
    `ยินดีต้อนรับ คุณ${name}`,
    'เข้าสู่ระบบสำเร็จ'
  ),

  logoutSuccess: () => showToast.info(
    'ออกจากระบบเรียบร้อย',
    'ขอบคุณที่ใช้บริการ'
  ),

  // File Upload
  fileUploading: () => showToast.loading('กำลังอัพโหลดไฟล์...'),
  
  fileUploaded: () => showToast.success(
    'อัพโหลดไฟล์สำเร็จ',
    'ไฟล์ของคุณถูกบันทึกแล้ว'
  ),

  fileTooLarge: (maxSize) => showToast.error(
    'ไฟล์ใหญ่เกินไป',
    `ขนาดไฟล์สูงสุดคือ ${maxSize}MB`
  ),

  // General
  actionSuccess: (action) => showToast.success(
    `${action}สำเร็จ`,
    'การดำเนินการเสร็จสมบูรณ์'
  ),

  actionFailed: (action) => showToast.error(
    `${action}ไม่สำเร็จ`,
    'กรุณาลองใหม่อีกครั้ง'
  ),

  comingSoon: () => showToast.info(
    'ฟีเจอร์กำลังพัฒนา',
    'จะเปิดให้บริการเร็วๆ นี้'
  )
};

// Simulate async operations with realistic delays
export const simulateAsync = async (action, delay = 1000) => {
  await new Promise(resolve => setTimeout(resolve, delay));
  return action();
};

// Promise wrapper with toast
export const withToast = async (promise, messages) => {
  return showToast.promise(promise, messages);
};
