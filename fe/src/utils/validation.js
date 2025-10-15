import { z } from 'zod';

// Application Form Schema
export const applicationSchema = z.object({
  // Step 1: Personal Information
  fullName: z
    .string()
    .min(2, 'กรุณากรอกชื่อ-นามสกุล อย่างน้อย 2 ตัวอักษร')
    .max(100, 'ชื่อ-นามสกุลยาวเกินไป'),
  
  email: z
    .string()
    .email('กรุณากรอกอีเมลที่ถูกต้อง')
    .min(1, 'กรุณากรอกอีเมล'),
  
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, 'กรุณากรอกเบอร์โทรศัพท์ 10 หลัก')
    .min(1, 'กรุณากรอกเบอร์โทรศัพท์'),
  
  address: z
    .string()
    .min(10, 'กรุณากรอกที่อยู่อย่างน้อย 10 ตัวอักษร')
    .optional(),
  
  // Step 2: Resume & Skills
  resume: z
    .any()
    .refine((file) => file instanceof File || file, 'กรุณาอัปโหลดไฟล์ Resume'),
  
  skills: z
    .array(z.string())
    .min(1, 'กรุณาเลือกทักษะอย่างน้อย 1 ข้อ'),
  
  experience: z
    .string()
    .min(1, 'กรุณาเลือกระดับประสบการณ์'),
  
  coverLetter: z
    .string()
    .min(50, 'กรุณาเขียน Cover Letter อย่างน้อย 50 ตัวอักษร')
    .max(1000, 'Cover Letter ยาวเกินไป (สูงสุด 1000 ตัวอักษร)')
    .optional(),
});

// Login Form Schema
export const loginSchema = z.object({
  email: z
    .string()
    .email('กรุณากรอกอีเมลที่ถูกต้อง')
    .min(1, 'กรุณากรอกอีเมล'),
  
  password: z
    .string()
    .min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
    .min(1, 'กรุณากรอกรหัสผ่าน'),
  
  role: z
    .enum(['candidate', 'hr', 'hm'], {
      errorMap: () => ({ message: 'กรุณาเลือกบทบาท' })
    }),
});

// Profile Update Schema
export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(2, 'กรุณากรอกชื่อ-นามสกุล อย่างน้อย 2 ตัวอักษร')
    .max(100, 'ชื่อ-นามสกุลยาวเกินไป'),
  
  email: z
    .string()
    .email('กรุณากรอกอีเมลที่ถูกต้อง'),
  
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, 'กรุณากรอกเบอร์โทรศัพท์ 10 หลัก')
    .optional(),
  
  bio: z
    .string()
    .max(500, 'ข้อมูลส่วนตัวยาวเกินไป (สูงสุด 500 ตัวอักษร)')
    .optional(),
});

// Job Creation/Edit Schema
export const jobSchema = z.object({
  title: z
    .string()
    .min(3, 'กรุณากรอกชื่อตำแหน่งอย่างน้อย 3 ตัวอักษร')
    .max(100, 'ชื่อตำแหน่งยาวเกินไป'),
  
  department: z
    .string()
    .min(1, 'กรุณาเลือกแผนก'),
  
  location: z
    .string()
    .min(2, 'กรุณากรอกสถานที่ทำงาน')
    .max(100, 'สถานที่ทำงานยาวเกินไป'),
  
  experienceLevel: z
    .enum(['internship', 'entry', 'mid', 'senior', 'lead'], {
      errorMap: () => ({ message: 'กรุณาเลือกระดับประสบการณ์' })
    })
    .optional(),
  
  description: z
    .string()
    .min(50, 'กรุณาเขียนรายละเอียดงานอย่างน้อย 50 ตัวอักษร')
    .max(2000, 'รายละเอียดงานยาวเกินไป')
    .optional(),
  
  requirements: z
    .string()
    .min(20, 'กรุณาระบุคุณสมบัติอย่างน้อย 20 ตัวอักษร')
    .optional(),
  
  responsibilities: z
    .string()
    .min(20, 'กรุณาระบุหน้าที่รับผิดชอบอย่างน้อย 20 ตัวอักษร')
    .optional(),
  
  closingDate: z
    .string()
    .refine((date) => {
      if (!date) return true; // Optional
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'วันปิดรับสมัครต้องเป็นวันนี้หรือหลังจากนี้')
    .optional(),
});

// Evaluation Schema
export const evaluationSchema = z.object({
  technicalScore: z
    .number()
    .min(1, 'กรุณาให้คะแนนด้านเทคนิค')
    .max(5, 'คะแนนสูงสุด 5')
    .int('กรุณาใส่คะแนนเป็นจำนวนเต็ม'),
  
  cultureFitScore: z
    .number()
    .min(1, 'กรุณาให้คะแนนความเหมาะสมกับวัฒนธรรม')
    .max(5, 'คะแนนสูงสุด 5')
    .int('กรุณาใส่คะแนนเป็นจำนวนเต็ม'),
  
  communicationScore: z
    .number()
    .min(1, 'กรุณาให้คะแนนการสื่อสาร')
    .max(5, 'คะแนนสูงสุด 5')
    .int('กรุณาใส่คะแนนเป็นจำนวนเต็ม'),
  
  feedback: z
    .string()
    .min(20, 'กรุณาเขียน Feedback อย่างน้อย 20 ตัวอักษร')
    .max(1000, 'Feedback ยาวเกินไป (สูงสุด 1000 ตัวอักษร)'),
  
  recommendation: z
    .enum(['approve', 'reject', 'reconsider'], {
      errorMap: () => ({ message: 'กรุณาเลือกคำแนะนำ' })
    }),
});

// Note/Comment Schema
export const noteSchema = z.object({
  content: z
    .string()
    .min(5, 'กรุณาเขียนหมายเหตุอย่างน้อย 5 ตัวอักษร')
    .max(500, 'หมายเหตุยาวเกินไป (สูงสุด 500 ตัวอักษร)'),
});

// Search/Filter Schema
export const searchFilterSchema = z.object({
  search: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  experienceLevel: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

// Export types (TypeScript compatible)
export const schemas = {
  application: applicationSchema,
  login: loginSchema,
  profileUpdate: profileUpdateSchema,
  job: jobSchema,
  evaluation: evaluationSchema,
  note: noteSchema,
  searchFilter: searchFilterSchema,
};
