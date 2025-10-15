import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Building2, Users, FileCheck, BarChart3, Clock, Shield } from 'lucide-react';
import { ImageWithFallback } from '../../components/shared';

export function LandingPage({ onLogin, onRegister, onLearnMore }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="premium-header sticky top-0 z-50 premium-shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-white" />
              <span className="text-2xl font-bold text-white">Advice Applicant Tracking System </span>
            </div>
            <div className="flex items-center gap-3">
              <Button className="premium-btn premium-btn--outline" onClick={onLogin}>เข้าสู่ระบบ</Button>
              <Button className="premium-btn" onClick={onRegister}>สมัครสมาชิก</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold mb-6 text-primary leading-tight">
              Advice Applicant Tracking System
              <br />
            </h1>
            <h2 className="text-xl font-semibold text-gray-700">
              by Advice IT Infinite Co., Ltd.
            </h2>
            <p className="text-xl text-foreground mb-8 leading-relaxed font-medium">
              <strong className="text-primary">AATS</strong> ระบบสรรหาบุคลากรสำหรับผู้นำด้านค้าปลีกและค้าส่งสินค้าไอทีของประเทศไทย 
              รองรับการบริหารจัดการบุคลากรสำหรับองค์กรที่มี <strong className="text-primary">340+ สาขา</strong>ทั่วประเทศ 
              ด้วยระบบอัตโนมัติที่ช่วยประหยัดเวลาและเพิ่มประสิทธิภาพ
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="premium-btn" onClick={onRegister}>เริ่มต้นใช้งาน</Button>
              <Button size="lg" className="premium-btn premium-btn--outline" onClick={onLearnMore}>ดูรายละเอียดเพิ่มเติม</Button>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-6 text-sm text-gray-700">
              <div className="flex items-center gap-2">
              </div>
              <div className="flex items-center gap-2">
              </div>
            </div>
          </div>
          <div className="relative">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=1080&q=80"
              alt="Team collaboration"
              className="rounded-2xl premium-shadow-lg w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16 border-y">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-primary mb-2">24</div>
              <div className="text-gray-700 font-medium">ใบสมัครใหม่วันนี้</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary mb-2">12</div>
              <div className="text-gray-700 font-medium">ตำแหน่งเปิดรับ</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary mb-2">8</div>
              <div className="text-gray-700 font-medium">รอสัมภาษณ์</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary mb-2">3</div>
              <div className="text-gray-700 font-medium">Offers รอตอบรับ</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-primary">ฟีเจอร์หลักของระบบ</h2>
            <p className="text-xl text-gray-700 font-medium">ทุกสิ่งที่คุณต้องการสำหรับการจัดการบุคลากรที่มีประสิทธิภาพ</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[{
              icon: Users,
              title: 'จัดการผู้สมัครอัตโนมัติ',
              desc: 'ระบบคัดกรองและจัดอันดับผู้สมัครอัตโนมัติตามเกณฑ์ที่กำหนด',
              color: 'text-blue-600'
            }, {
              icon: FileCheck,
              title: 'แบบฟอร์มมาตรฐาน',
              desc: 'แบบฟอร์มประเมินที่เป็นมาตรฐานเดียวกันทุกสาขา',
              color: 'text-green-600'
            }, {
              icon: Clock,
              title: 'ติดตามสถานะแบบ Real-time',
              desc: 'ผู้สมัครและทีม HR สามารถติดตามสถานะได้ตลอดเวลา',
              color: 'text-orange-600'
            }, {
              icon: BarChart3,
              title: 'รายงานและวิเคราะห์',
              desc: 'Dashboard และรายงานที่ช่วยในการตัดสินใจ',
              color: 'text-purple-600'
            }, {
              icon: Shield,
              title: 'ความปลอดภัยสูง',
              desc: 'เข้ารหัสข้อมูลและควบคุมการเข้าถึงอย่างเข้มงวด',
              color: 'text-red-600'
            }, {
              icon: Building2,
              title: 'รองรับหลายสาขา',
              desc: 'จัดการตำแหน่งงานและผู้สมัครจากทุกสาขาในที่เดียว',
              color: 'text-indigo-600'
            }].map(({ icon: Icon, title, desc, color }) => (
              <Card key={title} className="premium-card">
                <CardHeader>
                  <Icon className={`h-10 w-10 ${color} mb-2`} />
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Example Positions Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-primary">ตัวอย่างตำแหน่งที่เปิดรับสมัคร</h2>
            <p className="text-xl text-gray-700 font-medium">ตำแหน่งงานหลักที่บริษัทต้องการบุคลากร</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { title: 'พนักงานขาย', dept: 'ฝ่ายขาย', locations: '120 สาขา', openings: '180 อัตรา', badge: 'ด่วน' },
              { title: 'ช่างเทคนิค', dept: 'ฝ่ายเทคนิค', locations: '85 สาขา', openings: '95 อัตรา', badge: 'ด่วนมาก' },
              { title: 'พนักงานบริการลูกค้า', dept: 'ฝ่ายบริการ', locations: '150 สาขา', openings: '200 อัตรา', badge: 'ด่วน' },
              { title: 'หัวหน้าสาขา', dept: 'ฝ่ายบริหาร', locations: '40 สาขา', openings: '45 อัตรา', badge: 'ปกติ' },
              { title: 'พนักงานคลังสินค้า', dept: 'ฝ่ายโลจิสติกส์', locations: '25 สาขา', openings: '60 อัตรา', badge: 'ด่วน' },
              { title: 'ผู้ประสานงาน IT', dept: 'ฝ่าย IT', locations: '15 สาขา', openings: '20 อัตรา', badge: 'ปกติ' }
            ].map((job, idx) => (
              <Card key={idx} className="premium-card transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      job.badge === 'ด่วนมาก' ? 'bg-red-100 text-red-700' :
                      job.badge === 'ด่วน' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {job.badge}
                    </span>
                  </div>
                  <CardDescription className="space-y-1">
                    {job.dept} • {job.openings} • {job.locations}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button size="lg" className="premium-btn" onClick={onRegister}>ดูตำแหน่งงานทั้งหมด</Button>
          </div>
        </div>
      </section>

      {/* Example Branches Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-primary">สาขาที่เปิดรับสมัคร</h2>
            <p className="text-xl text-gray-700 font-medium">เครือข่าย 340+ สาขาทั่วประเทศไทย</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { region: 'กรุงเทพและปริมณฑล', branches: 85, positions: 420 },
              { region: 'ภาคเหนือ', branches: 65, positions: 180 },
              { region: 'ภาคตะวันออกเฉียงเหนือ', branches: 95, positions: 250 },
              { region: 'ภาคกลาง', branches: 45, positions: 120 },
              { region: 'ภาคตะวันออก', branches: 30, positions: 95 },
              { region: 'ภาคใต้', branches: 20, positions: 85 }
            ].map((area, idx) => (
              <Card key={idx} className="premium-card text-center">
                <CardHeader>
                  <div className="text-3xl font-bold text-blue-600 mb-2">{area.branches}</div>
                  <CardTitle className="text-base">{area.region}</CardTitle>
                  <CardDescription>{area.positions} ตำแหน่งงาน</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="rounded-2xl premium-shadow-lg p-12 text-center cta-banner">
          <h2 className="text-4xl font-bold mb-4 text-white">พร้อมก้าวสู่โอกาสใหม่กับ แอดไวซ์ ไอที อินฟินิท</h2>
          <p className="text-xl mb-8 text-white leading-relaxed">
            ร่วมเป็นส่วนหนึ่งของผู้นำด้านค้าปลีกและค้าส่งสินค้าไอทีของประเทศไทย 
            กับ<strong className="text-white"> 340+ สาขา</strong>ทั่วประเทศ
          </p>
          <p className="text-lg mb-8 text-white leading-relaxed">
            สมัครงานได้ง่าย ติดตามสถานะได้ทุกขั้นตอน ผ่านระบบสรรหาบุคลากร <strong className="text-white">Advice Applicant Tracking System (AATS)</strong>
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="premium-btn premium-btn--outline bg-white text-primary hover:bg-white" onClick={onLearnMore}>ดูข้อมูลเพิ่มเติม</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="premium-header py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-6 w-6 text-white" />
                <span className="text-xl font-bold text-white">Advice IT Infinite</span>
              </div>
              <p className="leading-relaxed text-white/90">
                บริษัท แอดไวซ์ ไอที อินฟินิท จำกัด (มหาชน)
                <br />
                ผู้นำด้านค้าปลีกและค้าส่งสินค้าไอที
                <br />
                340+ สาขาทั่วประเทศไทย
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white">ผลิตภัณฑ์</h3>
              <ul className="space-y-2.5 text-white/90">
                <li className="cursor-pointer transition-colors hover:opacity-100">ระบบสรรหา</li>
                <li className="cursor-pointer transition-colors hover:opacity-100">ระบบคัดเลือก</li>
                <li className="cursor-pointer transition-colors hover:opacity-100">ระบบประเมิน</li>
                <li className="cursor-pointer transition-colors hover:opacity-100">รายงานและวิเคราะห์</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white">บริษัท</h3>
              <ul className="space-y-2.5 text-white/90">
                <li className="cursor-pointer transition-colors hover:opacity-100">เกี่ยวกับเรา</li>
                <li className="cursor-pointer transition-colors hover:opacity-100">ติดต่อเรา</li>
                <li className="cursor-pointer transition-colors hover:opacity-100">ข่าวสาร</li>
                <li className="cursor-pointer transition-colors hover:opacity-100">ร่วมงานกับเรา</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white">ช่วยเหลือ</h3>
              <ul className="space-y-2.5 text-white/90">
                <li className="cursor-pointer transition-colors hover:opacity-100">ศูนย์ช่วยเหลือ</li>
                <li className="cursor-pointer transition-colors hover:opacity-100">เอกสารประกอบ</li>
                <li className="cursor-pointer transition-colors hover:opacity-100">นโยบายความเป็นส่วนตัว</li>
                <li className="cursor-pointer transition-colors hover:opacity-100">เงื่อนไขการใช้งาน</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 text-center text-white/80 border-t border-white/20">
            © 2025 AATS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
