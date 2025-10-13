import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { authenticateUser, registerUser, getUserByEmail } from '../../data/mockData';
// Removed unused type import

export function LoginPage({ onLogin, onBack }) {
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    const user = authenticateUser(email, password);
    
    if (!user) {
      toast.error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      return;
    }

    toast.success(`ยินดีต้อนรับ, ${user.name}!`);
    onLogin(user);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    
    if (!registerData.name || !registerData.email || !registerData.password || !registerData.phone) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast.error('รหัสผ่านไม่ตรงกัน');
      return;
    }

    if (registerData.password.length < 6) {
      toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    // Check if email already exists
    const existingUser = getUserByEmail(registerData.email);
    if (existingUser) {
      toast.error('อีเมลนี้ถูกใช้งานแล้ว');
      return;
    }

    const newUser = registerUser(
      registerData.email,
      registerData.password,
      registerData.name,
      registerData.phone
    );

    toast.success('ลงทะเบียนสำเร็จ! กำลังเข้าสู่ระบบ...');
    setTimeout(() => {
      onLogin(newUser);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden lg:block">
          <div className="flex items-center gap-2 mb-8">
            <Building2 className="h-12 w-12 text-primary" />
            <span className="text-4xl font-bold">AATS</span>
          </div>
          <h2 className="text-4xl font-bold mb-4 text-[#1B3C53]">
            ยินดีต้อนรับสู่
            <br />
            แอดไวซ์ ไอที อินฟินิท
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            ระบบสรรหาและจัดการบุคลากร (AATS)
            <br />
            สำหรับผู้นำด้านค้าปลีกและค้าส่งสินค้าไอทีของประเทศไทย
          </p>
          <div className="space-y-4">ท
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
              <div>
                <h4 className="font-semibold">สำหรับผู้สมัครงาน</h4>
                <p className="text-muted-foreground">ค้นหาตำแหน่งงาน สมัครงาน และติดตามสถานะได้ง่าย</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-600 mt-2" />
              <div>
                <h4 className="font-semibold">สำหรับทีม HR</h4>
                <p className="text-muted-foreground">จัดการผู้สมัคร ประกาศตำแหน่งงาน และดูรายงานสรุป</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-600 mt-2" />
              <div>
                <h4 className="font-semibold">สำหรับผู้จัดการ</h4>
                <p className="text-muted-foreground">ประเมินและทบทวนผู้สมัครอย่างมีมาตรฐาน</p>
              </div>
            </div>
          </div>

          {/* Demo Credentials - แอดไวซ์ ไอที อินฟินิท */}
          <div className="mt-8 p-4 bg-white border border-gray-200 rounded-2xl shadow-lg">
            <p className="font-bold mb-3 text-[#1B3C53]">บัญชีทดสอบระบบ</p>
            <div className="space-y-3 text-sm">
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="font-semibold text-gray-900 mb-1">ผู้สมัครงาน (Candidate):</p>
                <p className="text-gray-600">Email: candidate@example.com</p>
                <p className="text-gray-600">Password: password</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="font-semibold text-gray-900 mb-1">HR (ฝ่ายทรัพยากรบุคคล):</p>
                <p className="text-gray-600">Email: hr@adviceit.co.th</p>
                <p className="text-gray-600">Password: hr123</p>
                <p className="text-xs text-blue-600 mt-1">• วิภา สุขสันต์ - HR Manager</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="font-semibold text-gray-900 mb-1">Manager (ผู้จัดการ):</p>
                <p className="text-gray-600">Email: manager.sales@adviceit.co.th</p>
                <p className="text-gray-600">Password: manager123</p>
                <p className="text-xs text-blue-600 mt-1">• สมศักดิ์ ผู้นำทีม - ผู้จัดการฝ่ายขาย</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login/Register Forms */}
        <Card className="w-full">
          <CardHeader>
            <div className="lg:hidden flex items-center gap-2 mb-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">AATS</span>
            </div>
            <CardTitle>เข้าสู่ระบบ</CardTitle>
            <CardDescription>เข้าสู่ระบบเพื่อใช้งาน ATS</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">เข้าสู่ระบบ</TabsTrigger>
                <TabsTrigger value="register">สมัครสมาชิก</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">อีเมล</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">รหัสผ่าน</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    เข้าสู่ระบบ
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">ชื่อ-นามสกุล</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="ชื่อ นามสกุล"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">อีเมล</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your@email.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-phone">เบอร์โทรศัพท์</Label>
                    <Input
                      id="register-phone"
                      type="tel"
                      placeholder="081-234-5678"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">รหัสผ่าน</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">ยืนยันรหัสผ่าน</Label>
                    <Input
                      id="register-confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    สมัครสมาชิก
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    การสมัครสมาชิกนี้สำหรับผู้สมัครงานเท่านั้น
                  </p>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <Button variant="ghost" onClick={onBack}>
                ← กลับไปหน้าแรก
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
