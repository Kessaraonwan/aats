import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { User as UserIcon, Mail, Phone, Building2, Briefcase, Calendar, Shield } from 'lucide-react';
import { toast } from 'sonner';

export function ProfilePage({ user = {}, onBack, onUpdateProfile = () => {} }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    department: user.department || '',
    position: user.position || ''
  });

  const getRoleLabel = () => {
    if (user.role === 'hr') return 'HR Staff';
    if (user.role === 'hm') return 'Hiring Manager';
    return 'ผู้สมัครงาน';
  };

  const getRoleBadgeColor = () => {
    if (user.role === 'hr') return 'bg-green-100 text-green-800';
    if (user.role === 'hm') return 'bg-purple-100 text-purple-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] || '') + (parts[1][0] || '');
    return name.substring(0, 2);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('กรุณากรอกชื่อ-นามสกุล');
      return;
    }

    const updatedUser = {
      ...user,
      name: formData.name,
      phone: formData.phone,
      department: formData.department,
      position: formData.position
    };

    onUpdateProfile(updatedUser);
    setIsEditing(false);
    toast.success('อัพเดทโปรไฟล์สำเร็จ!');
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      department: user.department || '',
      position: user.position || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack}>
          ← กลับ
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Profile Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {getInitials(user.name || '')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{user.name}</CardTitle>
                  <CardDescription className="mt-1">
                    <Badge className={getRoleBadgeColor()}>
                      {getRoleLabel()}
                    </Badge>
                  </CardDescription>
                </div>
              </div>

              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                  แก้ไขโปรไฟล์
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {!isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="size-5" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="size-5" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.department && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Building2 className="size-5" />
                    <span>{user.department}</span>
                  </div>
                )}
                {user.position && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Briefcase className="size-5" />
                    <span>{user.position}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Shield className="size-5" />
                  <span>User ID: {user.id}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล</Label>
                  <Input id="email" value={user.email} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">ไม่สามารถเปลี่ยนอีเมลได้</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="081-234-5678" />
                </div>
                {(user.role === 'hr' || user.role === 'hm') && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="department">แผนก</Label>
                      <Input id="department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="ชื่อแผนก" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">ตำแหน่ง</Label>
                      <Input id="position" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} placeholder="ชื่อตำแหน่ง" />
                    </div>
                  </>
                )}

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave}>บันทึก</Button>
                  <Button variant="outline" onClick={handleCancel}>ยกเลิก</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลบัญชี</CardTitle>
            <CardDescription>ข้อมูลเพิ่มเติมเกี่ยวกับบัญชีของคุณ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="size-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">สร้างบัญชีเมื่อ</p>
                  <p className="text-sm text-muted-foreground">ข้อมูลไม่พร้อมใช้งาน</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="size-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">บทบาทในระบบ</p>
                  <p className="text-sm text-muted-foreground">{getRoleLabel()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle>ความปลอดภัย</CardTitle>
            <CardDescription>จัดการการตั้งค่าความปลอดภัยของบัญชี</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">เปลี่ยนรหัสผ่าน</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
