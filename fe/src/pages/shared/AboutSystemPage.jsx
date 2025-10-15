import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Building2,
  Users,
  FileCheck,
  Clock,
  BarChart3,
  Shield,
  CheckCircle2,
  ArrowRight,
  Workflow,
  Target,
  Zap,
  Globe,
} from "lucide-react";
import { ImageWithFallback } from "../../components/shared";

export function AboutSystemPage({ onBack, onGetStarted }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">AATS</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={onBack}>
                ← กลับ
              </Button>
              <Button onClick={onGetStarted}>เริ่มใช้งาน</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20" style={{ backgroundColor: '#234C6A', color: '#ffffff' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6" style={{ color: '#ffffff' }}>
              ระบบสรรหาและจัดการบุคลากร (AATS)
            </h1>
            <p className="text-xl mb-8 font-medium leading-relaxed" style={{ color: '#ffffff' }}>
              <strong className="font-bold">Advice Applicant Tracking System</strong> สำหรับบริษัท แอดไวซ์ ไอที อินฟินิท จำกัด (มหาชน)
            </p>
            <p className="text-lg mb-8 font-medium leading-relaxed" style={{ color: '#ffffff' }}>
              ระบบที่ออกแบบมาเพื่อยกระดับกระบวนการสรรหาและคัดเลือกบุคลากรให้มีประสิทธิภาพสูงสุด
              รองรับการจัดการบุคลากรสำหรับองค์กรที่มี<strong className="font-bold">มากกว่า 340 สาขา</strong>ทั่วประเทศ
              ครอบคลุมทุกขั้นตอนตั้งแต่การรับสมัครจนถึงการตัดสินใจจ้างงาน
            </p>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">ภาพรวมระบบ</h2>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758518730162-09a142505bfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjByZWNydWl0bWVudHxlbnwxfHx8fDE3NTk5MzYzMTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Professional recruitment"
                  className="rounded-lg shadow-lg w-full h-auto"
                />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-3xl font-bold mb-4 text-[#1B3C53]">ทำไมต้อง AATS?</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  <strong className="text-[#1B3C53]">บริษัท แอดไวซ์ ไอที อินฟินิท จำกัด (มหาชน)</strong> เป็นผู้นำด้านค้าปลีกและค้าส่งสินค้าไอทีของประเทศไทย 
                  มีเครือข่ายสาขามากกว่า <strong className="text-[#1B3C53]">340 สาขา</strong>ทั่วประเทศ ครอบคลุมทั้งอุปกรณ์คอมพิวเตอร์ อุปกรณ์ต่อพ่วง และบริการหลังการขาย 
                  รวมถึงการดำเนินธุรกิจผ่านช่องทาง<strong className="text-[#1B3C53]">ออนไลน์และออฟไลน์ (Omni-channel)</strong> อย่างต่อเนื่อง
                </p>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  ด้วยความต้องการบุคลากรจำนวนมาก โดยเฉพาะในตำแหน่งขาย บริการ และเทคนิค บริษัทจึงต้องการระบบบริหารจัดการกระบวนการสรรหาที่มีประสิทธิภาพ 
                  <strong className="text-[#1B3C53]">AATS (Advice Applicant Tracking System)</strong> จึงถูกพัฒนาขึ้นเพื่อลดความซับซ้อน เพิ่มความโปร่งใส 
                  และสร้างมาตรฐานเดียวกันทั่วทั้งองค์กร
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">ลดเวลาในการสรรหาและคัดเลือกมากกว่า 50%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">มาตรฐานการประเมินเดียวกันทุกสาขา</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">ระบบการจัดอันดับผู้สมัครอัตโนมัติ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">รายงานและ Dashboard แบบ Real-time</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Tabs */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">
              ฟีเจอร์ของระบบ
            </h2>

            <Tabs defaultValue="candidate" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="candidate">สำหรับผู้สมัคร</TabsTrigger>
                <TabsTrigger value="hr">สำหรับ HR</TabsTrigger>
                <TabsTrigger value="hm">สำหรับผู้จัดการ</TabsTrigger>
              </TabsList>

              <TabsContent value="candidate" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <Users className="h-10 w-10 text-blue-600 mb-2" />
                      <CardTitle>ค้นหาตำแหน่งงาน</CardTitle>
                      <CardDescription>
                        ระบบค้นหาและกรองตำแหน่งงานที่หลากหลาย
                        พร้อมรายละเอียดครบถ้วน สามารถกรองตามสาขา ระดับประสบการณ์
                        และตำแหน่ง
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader>
                      <FileCheck className="h-10 w-10 text-green-600 mb-2" />
                      <CardTitle>สมัครงานออนไลน์</CardTitle>
                      <CardDescription>
                        ฟอร์มสมัครงานที่ใช้งานง่าย แบ่งเป็นขั้นตอนชัดเจน
                        พร้อมระบบ autosave ป้องกันข้อมูลสูญหาย
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Clock className="h-10 w-10 text-orange-600 mb-2" />
                      <CardTitle>ติดตามสถานะ</CardTitle>
                      <CardDescription>
                        ดูสถานะการสมัครงานได้แบบ Real-time
                        พร้อมไทม์ไลน์แสดงความคืบหน้า
                        ตั้งแต่ส่งใบสมัครจนถึงการตัดสินใจ
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Target className="h-10 w-10 text-purple-600 mb-2" />
                      <CardTitle>โปรไฟล์ส่วนตัว</CardTitle>
                      <CardDescription>
                        จัดการข้อมูลส่วนตัว ประวัติการศึกษา ประสบการณ์การทำงาน
                        และเอกสารต่าง ๆ ได้ในที่เดียว
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="hr" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <BarChart3 className="h-10 w-10 text-blue-600 mb-2" />
                      <CardTitle>Dashboard ภาพรวม</CardTitle>
                      <CardDescription>
                        แดชบอร์ดแสดงสถิติการสรรหาแบบ Real-time จำนวนผู้สมัคร
                        ตำแหน่งที่เปิดรับ และประสิทธิภาพการสรรหา
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Users className="h-10 w-10 text-green-600 mb-2" />
                      <CardTitle>จัดการผู้สมัคร</CardTitle>
                      <CardDescription>
                        ดูรายชื่อผู้สมัครทั้งหมด กรอง เรียง และค้นหาได้ง่าย
                        พร้อมระบบจัดอันดับตามคะแนนอัตโนมัติ
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Workflow className="h-10 w-10 text-orange-600 mb-2" />
                      <CardTitle>จัดการตำแหน่งงาน</CardTitle>
                      <CardDescription>
                        สร้าง แก้ไข และปิดประกาศรับสมัครงาน
                        จัดการรายละเอียดตำแหน่ง และกำหนดเกณฑ์การคัดเลือก
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader>
                      <FileCheck className="h-10 w-10 text-purple-600 mb-2" />
                      <CardTitle>รายงานและวิเคราะห์</CardTitle>
                      <CardDescription>
                        สร้างรายงานสรุปการสรรหา วิเคราะห์ประสิทธิภาพ
                        และดาวน์โหลดข้อมูลเป็น CSV
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="hm" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <FileCheck className="h-10 w-10 text-blue-600 mb-2" />
                      <CardTitle>แบบฟอร์มประเมินมาตรฐาน</CardTitle>
                      <CardDescription>
                        แบบฟอร์มประเมินที่เป็นมาตรฐานเดียวกันทุกสาขา
                        ครอบคลุมทักษะเทคนิค การสื่อสาร การแก้ปัญหา
                        และความเหมาะสมกับองค์กร
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Target className="h-10 w-10 text-green-600 mb-2" />
                      <CardTitle>คิวการประเมิน</CardTitle>
                      <CardDescription>
                        รายการผู้สมัครที่รอการประเมิน พร้อมข้อมูลสำคัญ
                        และประวัติการทำงานที่จำเป็นต่อการตัดสินใจ
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader>
                      <BarChart3 className="h-10 w-10 text-orange-600 mb-2" />
                      <CardTitle>การให้คะแนนและความเห็น</CardTitle>
                      <CardDescription>
                        ให้คะแนนในแต่ละด้านด้วย slider scale 1-5
                        พร้อมช่องให้ความเห็นและคำแนะนำ
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Workflow className="h-10 w-10 text-purple-600 mb-2" />
                      <CardTitle>ติดตามผลการประเมิน</CardTitle>
                      <CardDescription>
                        ดูประวัติการประเมินที่ผ่านมา เปรียบเทียบผู้สมัคร
                        และช่วยในการตัดสินใจขั้นสุดท้าย
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>


      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">
              ประโยชน์ที่ได้รับ
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Zap className="h-12 w-12 text-yellow-600 mb-4" />
                  <CardTitle>เพิ่มประสิทธิภาพ</CardTitle>
                  <CardDescription>
                    ลดเวลาในการสรรหาและคัดเลือกมากกว่า 50%
                    ด้วยระบบอัตโนมัติและการจัดการที่เป็นระบบ
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle>มาตรฐานเดียวกัน</CardTitle>
                  <CardDescription>
                    แบบฟอร์มและเกณฑ์การประเมินที่เป็นมาตรฐานเดียวกันทุกสาขา
                    ช่วยให้การเปรียบเทียบและตัดสินใจเป็นธรรม
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Globe className="h-12 w-12 text-green-600 mb-4" />
                  <CardTitle>ควบคุมได้จากที่ไหนก็ได้</CardTitle>
                  <CardDescription>
                    ระบบ Cloud-based ทำให้สามารถเข้าถึงและจัดการได้ทุกที่ทุกเวลา
                    รองรับการทำงานแบบ Remote
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
