import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { toast } from 'sonner';
import EmailService, { emailTemplates } from '../../services/emailService';
import { verifyEmailSetup } from '../../services/emailProvider';
import { CheckCircle2, XCircle, Mail, Loader2 } from 'lucide-react';

export function EmailTestPage() {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [templateType, setTemplateType] = useState('applicationSubmitted');
  const [sending, setSending] = useState(false);
  const [emailSetup, setEmailSetup] = useState(null);

  // ตรวจสอบ email setup เมื่อโหลดหน้า
  useState(() => {
    verifyEmailSetup().then(setEmailSetup);
  }, []);

  const handleSendTestEmail = async () => {
    if (!recipientEmail) {
      toast.error('กรุณาใส่อีเมลผู้รับ');
      return;
    }

    setSending(true);

    try {
      const emailService = new EmailService();
      
      // ข้อมูลทดสอบตามแต่ละ template
      const testData = {
        applicationSubmitted: {
          candidateEmail: recipientEmail,
          candidateName: 'ตัวอย่าง ผู้สมัคร',
          jobTitle: 'ตัวอย่างตำแหน่ง',
          department: 'Engineering',
          submittedDate: new Date().toLocaleDateString('th-TH'),
          applicationId: 'TEST-' + Date.now(),
          trackUrl: `${window.location.origin}/track`,
        },
        statusUpdate: {
          candidateEmail: recipientEmail,
          candidateName: 'ตัวอย่าง ผู้สมัคร',
          jobTitle: 'ตัวอย่างตำแหน่ง',
          statusLabel: 'อยู่ระหว่างตรวจสอบ',
          statusColor: '#3b82f6',
          message: 'ทีม HR กำลังตรวจสอบใบสมัครของคุณ',
          nextSteps: 'คาดว่าจะแจ้งผลภายใน 3-5 วันทำการ',
          trackUrl: `${window.location.origin}/track`,
        },
        interviewInvitation: {
          candidateEmail: recipientEmail,
          candidateName: 'ตัวอย่าง ผู้สมัคร',
          jobTitle: 'ตัวอย่างตำแหน่ง',
          interviewDate: '15 ตุลาคม 2568',
          interviewTime: '14:00 - 15:00 น.',
          location: 'ชั้น 5 ห้องประชุม A',
          format: 'สัมภาษณ์แบบตัวต่อตัว',
          interviewers: 'คุณสมชาย (Tech Lead), คุณสมหญิง (HR Manager)',
          confirmUrl: `${window.location.origin}/confirm-interview`,
        },
      };

      const data = testData[templateType];
      const template = emailTemplates[templateType];

      const result = await emailService.send({
        to: recipientEmail,
        subject: typeof template.subject === 'function' 
          ? template.subject(data.jobTitle || data.statusLabel)
          : template.subject(),
        html: template.html(data),
      });

      if (result.success) {
        toast.success(
          result.mode === 'test' 
            ? '[TEST MODE] อีเมลจะถูกส่งใน production' 
            : 'ส่งอีเมลสำเร็จ!'
        );
      } else {
        toast.error('ส่งอีเมลไม่สำเร็จ: ' + result.error);
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Mail className="w-16 h-16 mx-auto text-[#234C6A] mb-4" />
          <h1 className="text-3xl font-bold text-[#1B3C53]">Email Testing Tool</h1>
          <p className="text-muted-foreground mt-2">ทดสอบส่งอีเมลแจ้งเตือนของระบบ ATS</p>
        </div>

        {/* Email Setup Status */}
        {emailSetup && (
          <Alert className={`mb-6 ${emailSetup.configured ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'}`}>
            <div className="flex items-center gap-2">
              {emailSetup.configured ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-yellow-600" />
              )}
              <AlertDescription>
                <strong>{emailSetup.configured ? 'Email Configured' : 'Test Mode'}</strong>
                <br />
                {emailSetup.message}
                {!emailSetup.configured && (
                  <div className="mt-2 text-sm">
                    <p><strong>วิธีเปิดใช้งาน:</strong></p>
                    <ol className="list-decimal list-inside ml-2 mt-1">
                      <li>สมัคร SendGrid ที่: <a href="https://signup.sendgrid.com" target="_blank" className="text-blue-600 underline">https://signup.sendgrid.com</a></li>
                      <li>Get API Key จาก Settings → API Keys</li>
                      <li>เพิ่มใน .env: <code className="bg-gray-200 px-1 rounded">VITE_SENDGRID_API_KEY=SG.xxx</code></li>
                      <li>Restart dev server</li>
                    </ol>
                  </div>
                )}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>ทดสอบส่งอีเมล</CardTitle>
            <CardDescription>
              เลือก template และใส่อีเมลผู้รับเพื่อทดสอบ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email Template Selector */}
            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={templateType} onValueChange={setTemplateType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applicationSubmitted">
                    Application Submitted (สมัครสำเร็จ)
                  </SelectItem>
                  <SelectItem value="statusUpdate">
                    Status Update (เปลี่ยนสถานะ)
                  </SelectItem>
                  <SelectItem value="interviewInvitation">
                    Interview Invitation (เชิญสัมภาษณ์)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recipient Email */}
            <div className="space-y-2">
              <Label>อีเมลผู้รับ</Label>
              <Input
                type="email"
                placeholder="you@domain.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>

            {/* Send Button */}
            <Button 
              onClick={handleSendTestEmail} 
              disabled={sending}
              className="w-full"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังส่ง...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  ส่งอีเมลทดสอบ
                </>
              )}
            </Button>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <p className="font-semibold mb-2">หมายเหตุ:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-900">
                <li>ในโหมด Test จะแสดง log ใน console แทนการส่งจริง</li>
                <li>เมื่อ configure SendGrid แล้ว จะส่งอีเมลจริง</li>
                <li>ใช้อีเมลของคุณเองในการทดสอบ</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
