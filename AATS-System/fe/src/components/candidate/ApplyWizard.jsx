import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Upload, CheckCircle2, FileText, User, Briefcase, GraduationCap, Award, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function ApplyWizard({ job, onSubmit, onCancel }) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: 'ไทย',
    address: '',
    education: {
      level: '',
      institution: '',
      major: '',
      graduationYear: '',
      gpa: '',
    },
    currentlyEmployed: false,
    yearsOfExperience: '',
    currentCompany: '',
    currentPosition: '',
    workExperience: '',
    skills: [],
    certifications: '',
    languages: ['ไทย', 'อังกฤษ'],
    resume: null,
    portfolio: '',
    coverLetter: '',
    expectedSalary: '',
    availableStartDate: '',
    referenceSource: '',
    willingToRelocate: false,
    agreedToTerms: false,
  });

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const stepTitles = [
    'ข้อมูลส่วนตัว',
    'ประวัติการศึกษา',
    'ประสบการณ์ทำงาน',
    'ทักษะและความเชี่ยวชาญ',
    'เอกสารประกอบ',
    'ข้อมูลเพิ่มเติม'
  ];

  const stepIcons = [User, GraduationCap, Briefcase, Award, FileText, CheckCircle2];

  // Auto-save to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(`apply-${job.id}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFormData(prev => ({ ...prev, ...parsed }));
    }
  }, [job.id]);

  useEffect(() => {
    const dataToSave = { ...formData };
    // Don't save file to localStorage
    delete (dataToSave).resume;
    localStorage.setItem(`apply-${job.id}`, JSON.stringify(dataToSave));
  }, [formData, job.id]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, resume: e.target.files[0] });
    }
  };

  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const toggleLanguage = (language) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language],
    }));
  };

  const isStep1Valid = formData.name && formData.email && formData.phone && formData.dateOfBirth;
  const isStep2Valid = formData.education.level && formData.education.institution;
  const isStep3Valid = true; // Optional
  const isStep4Valid = formData.skills.length > 0;
  const isStep5Valid = formData.resume;
  const isStep6Valid = formData.agreedToTerms;

  const canProceed = () => {
    switch (step) {
      case 1:
        return isStep1Valid;
      case 2:
        return isStep2Valid;
      case 3:
        return isStep3Valid;
      case 4:
        return isStep4Valid;
      case 5:
        return isStep5Valid;
      case 6:
        return isStep6Valid;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = () => {
    localStorage.removeItem(`apply-${job.id}`);
    onSubmit(formData);
  };

  const StepIcon = stepIcons[step - 1];

  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
    'Java', 'SQL', 'Git', 'Docker', 'AWS',
    'Figma', 'Adobe Creative Suite', 'UI/UX Design',
    'Project Management', 'Agile/Scrum', 'Communication',
    'Problem Solving', 'Leadership', 'Teamwork'
  ];

  return (
  <div className="min-h-screen bg-muted py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">สมัครงาน: {job.title}</h2>
                <p className="text-muted-foreground mt-1">{job.department} • {job.location}</p>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-between">
                {stepTitles.map((title, index) => {
                  const StepIconComponent = stepIcons[index];
                  const stepNum = index + 1;
                  const isActive = step === stepNum;
                  const isCompleted = step > stepNum;
                  
                  return (
                    <div key={stepNum} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                          isCompleted
                            ? 'bg-green-600 text-white'
                            : isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="size-5" />
                        ) : (
                          <StepIconComponent className="size-5" />
                        )}
                      </div>
                      <span className={`text-xs text-center hidden md:block ${
                        isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
                      }`}>
                        {title}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>ขั้นตอนที่ {step} จาก {totalSteps}: {stepTitles[step - 1]}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b">
                  <User className="size-6 text-primary" />
                  <h3 className="text-xl font-semibold">ข้อมูลส่วนตัว</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">ชื่อ-นามสกุล (ภาษาไทย) *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="ชื่อ-นามสกุล"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">อีเมล *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@domain.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">เบอร์โทรศัพท์ *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="เบอร์โทรศัพท์ (เช่น 0812345678)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">วันเกิด *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality">สัญชาติ</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      placeholder="ไทย"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">ที่อยู่ปัจจุบัน</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="บ้านเลขที่, ถนน, ตำบล/แขวง, อำเภอ/เขต, จังหวัด, รหัสไปรษณีย์"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Education */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b">
                  <GraduationCap className="size-6 text-primary" />
                  <h3 className="text-xl font-semibold">ประวัติการศึกษา</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="educationLevel">ระดับการศึกษาสูงสุด *</Label>
                    <Select
                      value={formData.education.level}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          education: { ...formData.education, level: value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกระดับการศึกษา" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ม.6">มัธยมศึกษาตอนปลาย</SelectItem>
                        <SelectItem value="ปวช.">ประกาศนียบัตรวิชาชีพ (ปวช.)</SelectItem>
                        <SelectItem value="ปวส.">ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)</SelectItem>
                        <SelectItem value="ปริญญาตรี">ปริญญาตรี</SelectItem>
                        <SelectItem value="ปริญญาโท">ปริญญาโท</SelectItem>
                        <SelectItem value="ปริญญาเอก">ปริญญาเอก</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="institution">สถาบันการศึกษา *</Label>
                    <Input
                      id="institution"
                      value={formData.education.institution}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          education: { ...formData.education, institution: e.target.value },
                        })
                      }
                      placeholder="มหาวิทยาลัย/วิทยาลัย"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="major">สาขาวิชา</Label>
                    <Input
                      id="major"
                      value={formData.education.major}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          education: { ...formData.education, major: e.target.value },
                        })
                      }
                      placeholder="วิศวกรรมคอมพิวเตอร์"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="graduationYear">ปีที่จบการศึกษา</Label>
                    <Input
                      id="graduationYear"
                      type="number"
                      value={formData.education.graduationYear}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          education: { ...formData.education, graduationYear: e.target.value },
                        })
                      }
                      placeholder="2024"
                      min="1950"
                      max="2030"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gpa">เกรดเฉลี่ย (GPA)</Label>
                    <Input
                      id="gpa"
                      type="number"
                      step="0.01"
                      value={formData.education.gpa}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          education: { ...formData.education, gpa: e.target.value },
                        })
                      }
                      placeholder="3.50"
                      min="0"
                      max="4"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>💡 เคล็ดลับ:</strong> กรอกข้อมูลการศึกษาให้ครบถ้วนเพื่อเพิ่มโอกาสในการได้รับการพิจารณา
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Work Experience */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b">
                  <Briefcase className="size-6 text-primary" />
                  <h3 className="text-xl font-semibold">ประสบการณ์ทำงาน</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yearsOfExperience">จำนวนปีประสบการณ์ทำงาน</Label>
                    <Select
                      value={formData.yearsOfExperience}
                      onValueChange={(value) =>
                        setFormData({ ...formData, yearsOfExperience: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกจำนวนปี" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">ไม่มีประสบการณ์</SelectItem>
                        <SelectItem value="1">น้อยกว่า 1 ปี</SelectItem>
                        <SelectItem value="1-2">1-2 ปี</SelectItem>
                        <SelectItem value="3-5">3-5 ปี</SelectItem>
                        <SelectItem value="5-10">5-10 ปี</SelectItem>
                        <SelectItem value="10+">มากกว่า 10 ปี</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.currentlyEmployed}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, currentlyEmployed: checked })
                        }
                      />
                      ปัจจุบันทำงานอยู่
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentCompany">
                      {formData.currentlyEmployed ? 'บริษัทปัจจุบัน' : 'บริษัทล่าสุด'}
                    </Label>
                    <Input
                      id="currentCompany"
                      value={formData.currentCompany}
                      onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                      placeholder="ชื่อบริษัท"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentPosition">
                      {formData.currentlyEmployed ? 'ตำแหน่งปัจจุบัน' : 'ตำแหน่งล่าสุด'}
                    </Label>
                    <Input
                      id="currentPosition"
                      value={formData.currentPosition}
                      onChange={(e) => setFormData({ ...formData, currentPosition: e.target.value })}
                      placeholder="ตำแหน่งงาน"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="workExperience">สรุปประสบการณ์ทำงาน</Label>
                    <Textarea
                      id="workExperience"
                      value={formData.workExperience}
                      onChange={(e) => setFormData({ ...formData, workExperience: e.target.value })}
                      placeholder="บอกเราเกี่ยวกับประสบการณ์ทำงานของคุณ รวมถึงหน้าที่ความรับผิดชอบและผลงานที่สำคัญ..."
                      rows={6}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Skills & Expertise */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b">
                  <Award className="size-6 text-primary" />
                  <h3 className="text-xl font-semibold">ทักษะและความเชี่ยวชาญ</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>ทักษะที่เกี่ยวข้อง (เลือกอย่างน้อย 1 ทักษะ) *</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      เลือกทักษะที่คุณมี หรือพิมพ์เพิ่มเติมได้
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {commonSkills.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`px-3 py-2 rounded-full border transition-colors ${
                            formData.skills.includes(skill)
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background hover:border-primary'
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                    {formData.skills.length > 0 && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>ทักษะที่เลือก:</strong> {formData.skills.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certifications">ใบรับรอง/ประกาศนียบัตร</Label>
                    <Textarea
                      id="certifications"
                      value={formData.certifications}
                      onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                      placeholder="AWS Certified Solutions Architect, PMP, Google Analytics Certified..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>ภาษาที่ใช้ได้</Label>
                    <p className="text-sm text-muted-foreground mb-3">เลือกภาษาที่คุณสามารถใช้สื่อสารได้</p>
                    <div className="flex flex-wrap gap-2">
                      {['ไทย', 'อังกฤษ', 'จีน', 'ญี่ปุ่น', 'เกาหลี', 'ฝรั่งเศส', 'เยอรมัน', 'สเปน'].map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => toggleLanguage(lang)}
                          className={`px-3 py-2 rounded-full border transition-colors ${
                            formData.languages.includes(lang)
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background hover:border-primary'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Documents */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b">
                  <FileText className="size-6 text-primary" />
                  <h3 className="text-xl font-semibold">เอกสารประกอบการสมัคร</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resume">เรซูเม่ / CV *</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                      <input
                        id="resume"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="resume" className="cursor-pointer">
                        {formData.resume ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2 text-green-600">
                              <CheckCircle2 className="size-8" />
                            </div>
                            <p className="font-medium">{formData.resume.name}</p>
                            <p className="text-muted-foreground">
                              {(formData.resume.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <Button type="button" variant="outline" size="sm">
                              เปลี่ยนไฟล์
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="size-12 mx-auto text-muted-foreground" />
                            <p className="font-medium">คลิกเพื่ออัปโหลดไฟล์</p>
                            <p className="text-muted-foreground">
                              รองรับไฟล์ PDF, DOC, DOCX (สูงสุด 10MB)
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="portfolio">Portfolio / Website (ถ้ามี)</Label>
                    <Input
                      id="portfolio"
                      type="url"
                      value={formData.portfolio}
                      onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                      placeholder="https://yourportfolio.com"
                    />
                    <p className="text-sm text-muted-foreground">
                      ลิงก์ไปยัง Portfolio, GitHub, LinkedIn หรือเว็บไซต์ส่วนตัว
                    </p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800">
                      <strong>⚠️ หมายเหตุ:</strong> กรุณาตรวจสอบให้แน่ใจว่าเอกสารของคุณมีข้อมูลที่ครบถ้วนและเป็นปัจจุบัน
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Additional Information */}
            {step === 6 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b">
                  <CheckCircle2 className="size-6 text-primary" />
                  <h3 className="text-xl font-semibold">ข้อมูลเพิ่มเติม</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="coverLetter">จดหมายสมัครงาน (Cover Letter)</Label>
                    <Textarea
                      id="coverLetter"
                      value={formData.coverLetter}
                      onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                      placeholder="บอกเราว่าทำไมคุณถึงสนใจในตำแหน่งนี้ และทำไมเราควรเลือกคุณ..."
                      rows={6}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expectedSalary">เงินเดือนที่คาดหวัง (บาท/เดือน)</Label>
                      <Input
                        id="expectedSalary"
                        type="number"
                        value={formData.expectedSalary}
                        onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value })}
                        placeholder="40000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="availableStartDate">สามารถเริ่มงานได้เมื่อ</Label>
                      <Input
                        id="availableStartDate"
                        type="date"
                        value={formData.availableStartDate}
                        onChange={(e) => setFormData({ ...formData, availableStartDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="referenceSource">คุณทราบตำแหน่งงานนี้จากที่ใด</Label>
                    <Select
                      value={formData.referenceSource}
                      onValueChange={(value) => setFormData({ ...formData, referenceSource: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกแหล่งที่มา" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">เว็บไซต์บริษัท</SelectItem>
                        <SelectItem value="jobboard">Job Board / JobThai</SelectItem>
                        <SelectItem value="social">Social Media</SelectItem>
                        <SelectItem value="referral">เพื่อน/คนรู้จักแนะนำ</SelectItem>
                        <SelectItem value="recruiter">Recruiter</SelectItem>
                        <SelectItem value="other">อื่น ๆ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="willingToRelocate"
                      checked={formData.willingToRelocate}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, willingToRelocate: checked })
                      }
                    />
                    <Label htmlFor="willingToRelocate" className="cursor-pointer">
                      ยินดีย้ายสถานที่ทำงาน (Relocate)
                    </Label>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold mb-4">สรุปข้อมูลการสมัคร</h4>
                    <div className="bg-muted rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p className="text-muted-foreground">ชื่อ:</p>
                        <p className="font-medium">{formData.name}</p>
                        
                        <p className="text-muted-foreground">อีเมล:</p>
                        <p className="font-medium">{formData.email}</p>
                        
                        <p className="text-muted-foreground">เบอร์โทร:</p>
                        <p className="font-medium">{formData.phone}</p>
                        
                        <p className="text-muted-foreground">การศึกษา:</p>
                        <p className="font-medium">{formData.education.level} {formData.education.institution}</p>
                        
                        <p className="text-muted-foreground">ประสบการณ์:</p>
                        <p className="font-medium">{formData.yearsOfExperience || 'ไม่ระบุ'}</p>
                        
                        <p className="text-muted-foreground">ทักษะ:</p>
                        <p className="font-medium">{formData.skills.length} ทักษะ</p>
                        
                        <p className="text-muted-foreground">เอกสาร:</p>
                        <p className="font-medium">{formData.resume?.name || 'ไม่มี'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreedToTerms"
                        checked={formData.agreedToTerms}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, agreedToTerms: checked })
                        }
                      />
                      <Label htmlFor="agreedToTerms" className="cursor-pointer leading-relaxed">
                        ข้าพเจ้ายืนยันว่าข้อมูลทั้งหมดที่ให้ไว้ข้างต้นเป็นความจริง และยอมรับข้อกำหนดและเงื่อนไขในการสมัครงาน
                        รวมถึงนโยบายการคุ้มครองข้อมูลส่วนบุคคลของบริษัท *
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <div className="flex gap-2">
                {/* ปุ่มย้อนกลับไปหน้ารายการงาน */}
                <Button 
                  variant="ghost" 
                  onClick={() => setShowCancelDialog(true)}
                  className="text-muted-foreground"
                >
                  <ArrowLeft className="size-4 mr-2" />
                  ออกจากหน้าสมัครงาน
                </Button>
                
                {step > 1 && (
                  <Button variant="outline" onClick={handleBack}>
                    ← ย้อนกลับขั้นตอนก่อนหน้า
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                {step < totalSteps && (
                  <Button onClick={handleNext} disabled={!canProceed()}>
                    ถัดไป →
                  </Button>
                )}
                {step === totalSteps && (
                  <Button 
                    onClick={handleSubmit} 
                    disabled={!canProceed()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="size-4 mr-2" />
                    ส่งใบสมัคร
                  </Button>
                )}
              </div>
            </div>

            {/* Auto-save indicator */}
            <div className="text-center text-sm text-muted-foreground">
              <p>💾 ข้อมูลถูกบันทึกอัตโนมัติ</p>
            </div>

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>ยืนยันการออกจากหน้าสมัครงาน?</AlertDialogTitle>
                  <AlertDialogDescription>
                    คุณต้องการออกจากหน้าสมัครงานใช่หรือไม่?
                    <br /><br />
                    <strong className="text-green-600">✓ ข้อมูลของคุณถูกบันทึกอัตโนมัติแล้ว</strong>
                    <br />
                    คุณสามารถกลับมาสมัครต่อได้ทุกเมื่อ ข้อมูลจะยังคงอยู่
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>ยกเลิก - อยู่ต่อ</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => {
                      toast.success('ข้อมูลถูกบันทึกแล้ว คุณสามารถกลับมาสมัครต่อได้');
                      onCancel();
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    ยืนยัน - ออกจากหน้านี้
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
