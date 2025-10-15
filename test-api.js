// ทดสอบ API ด้วย JavaScript Console หรือ Postman

// 1. สมัครสมาชิก
const registerUser = async () => {
  const response = await fetch('http://localhost:8080/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'candidate@example.com',
      password: 'password123',
      name: 'สมชาย ใจดี',
      phone: '081-234-5678',
      role: 'candidate'
    })
  });
  
  const result = await response.json();
  console.log('Register result:', result);
  
  // เก็บ token ไว้ใช้
  localStorage.setItem('auth_token', result.data.token);
  return result;
};

// 2. เข้าสู่ระบบ
const loginUser = async () => {
  const response = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'candidate@example.com',
      password: 'password123'
    })
  });
  
  const result = await response.json();
  console.log('Login result:', result);
  
  localStorage.setItem('auth_token', result.data.token);
  return result;
};

// 3. ดูข้อมูลผู้ใช้ปัจจุบัน
const getCurrentUser = async () => {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch('http://localhost:8080/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await response.json();
  console.log('Current user:', result);
  return result;
};

// 4. ดูรายการงาน
const getJobs = async () => {
  const response = await fetch('http://localhost:8080/api/jobs');
  const result = await response.json();
  console.log('Jobs:', result);
  return result;
};

// เรียกใช้งาน
// registerUser();
// loginUser();
// getCurrentUser();
// getJobs();