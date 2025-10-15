import { useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Slider } from '../ui/slider';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { 
  ChevronDown, ChevronUp, AlertCircle, CheckCircle2, 
  XCircle, Star, TrendingUp, FileText, Phone, Calendar 
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { showToast, toastMessages } from '../../utils/toastHelpers';

const evaluationCategories = [
  {
    title: 'ความสามารถทางเทคนิค',
    icon: null,
    description: 'ประเมินความรู้และทักษะทางเทคนิคที่เกี่ยวข้องกับตำแหน่งงาน',
    criteria: [
      {
        key: 'technicalKnowledge',
        label: 'ความรู้ทางเทคนิค',
        description: 'ความรู้พื้นฐานและความเข้าใจในสาขาที่เกี่ยวข้อง',
        anchors: {
          1: 'ขาดความรู้พื้นฐานที่จำเป็น ไม่สามารถอธิบายแนวคิดหลักได้',
          2: 'มีความรู้พื้นฐานบางส่วน แต่ยังมีช่องว่างที่สำคัญ',
          3: 'มีความรู้พื้นฐานที่เพียงพอ สามารถอธิบายแนวคิดสำคัญได้',
          4: 'มีความรู้ที่ดี สามารถอธิบายและประยุกต์ใช้ได้อย่างเหมาะสม',
          5: 'มีความรู้เชิงลึก สามารถวิเคราะห์และถ่ายทอดความรู้ได้อย่างยอดเยี่ยม'
        }
      },
      {
        key: 'technicalSkills',
        label: 'ทักษะการปฏิบัติงาน',
        description: 'ความสามารถในการนำความรู้ไปใช้ปฏิบัติจริง',
        anchors: {
          1: 'ไม่มีทักษะที่จำเป็น ไม่สามารถทำงานได้ด้วยตนเอง',
          2: 'มีทักษะพื้นฐาน ต้องการการฝึกอบรมและคำแนะนำอย่างมาก',
          3: 'มีทักษะที่เพียงพอ สามารถทำงานได้ภายใต้การดูแล',
          4: 'มีทักษะที่ดี สามารถทำงานได้อย่างอิสระส่วนใหญ่',
          5: 'มีทักษะขั้นสูง สามารถทำงานซับซ้อนและให้คำแนะนำผู้อื่นได้'
        }
      },
      {
        key: 'toolsProficiency',
        label: 'ความชำนาญในเครื่องมือและเทคโนโลยี',
        description: 'ความสามารถในการใช้เครื่องมือและซอฟต์แวร์ที่เกี่ยวข้อง',
        anchors: {
          1: 'ไม่คุ้นเคยกับเครื่องมือที่จำเป็น',
          2: 'มีความรู้พื้นฐาน สามารถใช้งานเบื้องต้นได้',
          3: 'สามารถใช้เครื่องมือหลักได้อย่างมีประสิทธิภาพ',
          4: 'ชำนาญในเครื่องมือหลาย ๆ ตัว สามารถเลือกใช้ได้เหมาะสม',
          5: 'เชี่ยวชาญในเครื่องมือต่าง ๆ สามารถปรับแต่งและพัฒนาเพิ่มเติมได้'
        }
      }
    ]
  },
  {
    title: 'ทักษะด้านการสื่อสารและความสัมพันธ์',
    icon: null,
    description: 'ประเมินทักษะในการทำงานร่วมกับผู้อื่นและการสื่อสาร',
    criteria: [
      {
        key: 'communication',
        label: 'การสื่อสาร',
        description: 'ความสามารถในการสื่อสารอย่างมีประสิทธิภาพ',
        anchors: {
          1: 'สื่อสารไม่ชัดเจน ทำให้เกิดความเข้าใจผิดบ่อยครั้ง',
          2: 'สื่อสารได้พอใช้ แต่บางครั้งไม่ชัดเจน',
          3: 'สื่อสารได้ชัดเจนในสถานการณ์ทั่วไป',
          4: 'สื่อสารได้ดี ปรับรูปแบบได้ตามกลุ่มเป้าหมาย',
          5: 'สื่อสารได้ยอดเยี่ยม สามารถนำเสนอและโน้มน้าวใจได้อย่างมีประสิทธิภาพ'
        }
      },
      {
        key: 'teamwork',
        label: 'การทำงานเป็นทีม',
        description: 'ความสามารถในการทำงานร่วมกับผู้อื่น',
        anchors: {
          1: 'ทำงานเป็นทีมได้ยาก มักสร้างความขัดแย้ง',
          2: 'ทำงานร่วมกับผู้อื่นได้ แต่ไม่ค่อยมีส่วนร่วม',
          3: 'เป็นสมาชิกทีมที่ดี มีส่วนร่วมอย่างสม่ำเสมอ',
          4: 'ทำงานเป็นทีมได้ดี ช่วยสร้างบรรยากาศเชิงบวก',
          5: 'เป็นแรงผลักดันของทีม สามารถประสานงานและสร้างความร่วมมือได้ยอดเยี่ยม'
        }
      },
      {
        key: 'leadership',
        label: 'ภาวะผู้นำ',
        description: 'ศักยภาพในการเป็นผู้นำและสร้างแรงบันดาลใจ',
        anchors: {
          1: 'ไม่แสดงคุณสมบัติของผู้นำ รอคำสั่งเท่านั้น',
          2: 'แสดงภาวะผู้นำได้บ้างในบางสถานการณ์',
          3: 'สามารถนำทีมเล็ก ๆ หรือโครงการได้',
          4: 'เป็นผู้นำที่ดี สามารถจูงใจและพัฒนาทีมได้',
          5: 'เป็นผู้นำที่โดดเด่น สร้างแรงบันดาลใจและขับเคลื่อนการเปลี่ยนแปลงได้'
        }
      },
      {
        key: 'adaptability',
        label: 'ความยืดหยุ่นและการปรับตัว',
        description: 'ความสามารถในการปรับตัวกับสถานการณ์ที่เปลี่ยนแปลง',
        anchors: {
          1: 'ต่อต้านการเปลี่ยนแปลง ปรับตัวได้ยาก',
          2: 'ปรับตัวได้ช้า ต้องการเวลาในการเรียนรู้',
          3: 'ปรับตัวได้ดีในสถานการณ์ส่วนใหญ่',
          4: 'ปรับตัวได้รวดเร็ว รับมือกับการเปลี่ยนแปลงได้ดี',
          5: 'ยอดเยี่ยมในการปรับตัว มองเห็นโอกาสในการเปลี่ยนแปลง'
        }
      }
    ]
  },
  {
    title: 'การคิดวิเคราะห์และการแก้ปัญหา',
    icon: null,
    description: 'ประเมินความสามารถในการคิดวิเคราะห์และแก้ไขปัญหา',
    criteria: [
      {
        key: 'analyticalThinking',
        label: 'การคิดวิเคราะห์',
        description: 'ความสามารถในการวิเคราะห์ข้อมูลและสถานการณ์',
        anchors: {
          1: 'ไม่สามารถวิเคราะห์ข้อมูลอย่างเป็นระบบ',
          2: 'วิเคราะห์ข้อมูลเบื้องต้นได้ ต้องการคำแนะนำ',
          3: 'วิเคราะห์ข้อมูลได้ดี สามารถระบุประเด็นสำคัญได้',
          4: 'วิเคราะห์ได้ลึกซึ้ง สามารถเชื่อมโยงข้อมูลได้',
          5: 'มีความคิดวิเคราะห์ขั้นสูง สามารถมองเห็นภาพรวมและรายละเอียดได้'
        }
      },
      {
        key: 'problemSolving',
        label: 'การแก้ปัญหา',
        description: 'ความสามารถในการแก้ไขปัญหาอย่างมีประสิทธิภาพ',
        anchors: {
          1: 'ไม่สามารถแก้ปัญหาได้ รอให้ผู้อื่นแก้ให้',
          2: 'แก้ปัญหาเบื้องต้นได้ ต้องการการสนับสนุน',
          3: 'แก้ปัญหาประจำวันได้ดี มีแนวทางที่เป็นระบบ',
          4: 'แก้ปัญหาซับซ้อนได้ มีวิธีการที่หลากหลาย',
          5: 'แก้ปัญหาได้ยอดเยี่ยม สามารถจัดการปัญหาที่ซับซ้อนและคาดไม่ถึงได้'
        }
      },
      {
        key: 'creativity',
        label: 'ความคิดสร้างสรรค์',
        description: 'ความสามารถในการคิดนอกกรอบและสร้างนวัตกรรม',
        anchors: {
          1: 'ไม่แสดงความคิดสร้างสรรค์ ทำตามที่กำหนดเท่านั้น',
          2: 'มีความคิดสร้างสรรค์บ้างในบางครั้ง',
          3: 'เสนอแนวคิดใหม่ ๆ ได้เป็นครั้งคราว',
          4: 'มีความคิดสร้างสรรค์ดี เสนอแนวทางใหม่ที่เป็นประโยชน์',
          5: 'โดดเด่นในความคิดสร้างสรรค์ สร้างนวัตกรรมและแนวคิดใหม่ ๆ ได้อย่างสม่ำเสมอ'
        }
      },
      {
        key: 'decisionMaking',
        label: 'การตัดสินใจ',
        description: 'ความสามารถในการตัดสินใจอย่างมีประสิทธิภาพ',
        anchors: {
          1: 'ตัดสินใจไม่ได้ ลังเลและต้องการผู้อื่นตัดสินใจให้',
          2: 'ตัดสินใจช้า ต้องการข้อมูลมากเกินไป',
          3: 'ตัดสินใจได้ดีในสถานการณ์ปกติ',
          4: 'ตัดสินใจได้รวดเร็วและมีเหตุผล ชั่งน้ำหนักได้ดี',
          5: 'ตัดสินใจได้ยอดเยี่ยม แม้ในสถานการณ์ที่กดดันและข้อมูลไม่สมบูรณ์'
        }
      }
    ]
  },
  {
    title: 'ประสบการณ์และพื้นฐานการศึกษา',
    icon: null,
    description: 'ประเมินความเหมาะสมของประสบการณ์และการศึกษา',
    criteria: [
      {
        key: 'relevantExperience',
        label: 'ประสบการณ์ที่เกี่ยวข้อง',
        description: 'ความเหมาะสมและคุณภาพของประสบการณ์การทำงาน',
        anchors: {
          1: 'ไม่มีประสบการณ์ที่เกี่ยวข้องเลย',
          2: 'มีประสบการณ์เล็กน้อย แต่ไม่ตรงกับตำแหน่ง',
          3: 'มีประสบการณ์ที่เกี่ยวข้องพอสมควร',
          4: 'มีประสบการณ์ที่เกี่ยวข้องมาก ตรงกับความต้องการ',
          5: 'มีประสบการณ์ที่โดดเด่น เกินความคาดหวัง'
        }
      },
      {
        key: 'educationBackground',
        label: 'พื้นฐานการศึกษา',
        description: 'ความเหมาะสมของการศึกษาและคุณวุฒิ',
        anchors: {
          1: 'การศึกษาไม่ตรงกับตำแหน่ง ไม่มีคุณวุฒิที่จำเป็น',
          2: 'มีการศึกษาพื้นฐาน แต่ไม่ค่อยตรงกับตำแหน่ง',
          3: 'มีการศึกษาที่เหมาะสม ตรงกับความต้องการ',
          4: 'มีการศึกษาที่ดี มีคุณวุฒิเพิ่มเติมที่เป็นประโยชน์',
          5: 'มีการศึกษาระดับสูง มีคุณวุฒิพิเศษที่โดดเด่น'
        }
      },
      {
        key: 'achievements',
        label: 'ผลงานและความสำเร็จ',
        description: 'ผลงานที่โดดเด่นและความสำเร็จในอดีต',
        anchors: {
          1: 'ไม่มีผลงานหรือความสำเร็จที่โดดเด่น',
          2: 'มีผลงานเล็กน้อย ไม่โดดเด่น',
          3: 'มีผลงานและความสำเร็จที่ดี',
          4: 'มีผลงานที่โดดเด่น แสดงถึงความสามารถสูง',
          5: 'มีผลงานที่ยอดเยี่ยม ได้รับรางวัลหรือการยอมรับในระดับสูง'
        }
      }
    ]
  },
  {
    title: 'ความเหมาะสมกับองค์กร',
    icon: null,
    description: 'ประเมินความเข้ากับวัฒนธรรมองค์กรและแรงจูงใจ',
    criteria: [
      {
        key: 'cultureFit',
        label: 'ความเข้ากับวัฒนธรรมองค์กร',
        description: 'ความเหมาะสมกับค่านิยมและวัฒนธรรมของบริษัท',
        anchors: {
          1: 'ค่านิยมและแนวคิดขัดแย้งกับวัฒนธรรมองค์กร',
          2: 'ความเข้ากันได้ต่ำ อาจมีปัญหาในการปรับตัว',
          3: 'เข้ากันได้ดี มีค่านิยมที่สอดคล้อง',
          4: 'เข้ากันได้ดีมาก มีศักยภาพในการเสริมสร้างวัฒนธรรม',
          5: 'เข้ากันได้อย่างยอดเยี่ยม เป็นต้นแบบของวัฒนธรรมองค์กร'
        }
      },
      {
        key: 'motivation',
        label: 'แรงจูงใจและความกระตือรือร้น',
        description: 'ระดับความกระตือรือร้นและความมุ่งมั่นต่อการทำงาน',
        anchors: {
          1: 'ขาดแรงจูงใจ ไม่แสดงความสนใจ',
          2: 'มีแรงจูงใจต่ำ ดูเฉยเมย',
          3: 'มีแรงจูงใจปานกลาง แสดงความสนใจพอสมควร',
          4: 'มีแรงจูงใจสูง กระตือรือร้นและมุ่งมั่น',
          5: 'มีแรงจูงใจสูงมาก มีความหลงใหลในงานและองค์กร'
        }
      },
      {
        key: 'valuesAlignment',
        label: 'ความสอดคล้องของเป้าหมาย',
        description: 'ความสอดคล้องระหว่างเป้าหมายส่วนตัวกับองค์กร',
        anchors: {
          1: 'เป้าหมายไม่สอดคล้องกับองค์กร',
          2: 'มีความสอดคล้องเล็กน้อย',
          3: 'เป้าหมายสอดคล้องกับองค์กรพอสมควร',
          4: 'เป้าหมายสอดคล้องกับองค์กรดี',
          5: 'เป้าหมายสอดคล้องกับองค์กรอย่างสมบูรณ์'
        }
      }
    ]
  }
];

export function EvaluationForm({ application, onSubmit, onCancel, submitting = false }) {
  const [evaluation, setEvaluation] = useState({
    technicalKnowledge: 3,
    technicalSkills: 3,
    toolsProficiency: 3,
    communication: 3,
    teamwork: 3,
    leadership: 3,
    adaptability: 3,
    analyticalThinking: 3,
    problemSolving: 3,
    creativity: 3,
    decisionMaking: 3,
    relevantExperience: 3,
    educationBackground: 3,
    achievements: 3,
    cultureFit: 3,
    motivation: 3,
    valuesAlignment: 3,
    overallImpression: 3,
    hiringRecommendation: 'neutral',
    strengths: '',
    areasForImprovement: '',
    additionalComments: '',
    interviewNotes: ''
  });

  const [openSections, setOpenSections] = useState({
    '0': true,
    '1': false,
    '2': false,
    '3': false,
    '4': false
  });

  const [showValidation, setShowValidation] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  const handleSliderChange = (key, value) => {
    setEvaluation({ ...evaluation, [key]: value[0] });
    setShowValidation(false); // Clear validation when user makes changes
  };

  const toggleSection = (index) => {
    setOpenSections({ ...openSections, [index]: !openSections[index] });
  };

  const calculateCategoryAverage = (criteria) => {
    const sum = criteria.reduce((acc, criterion) => {
      return acc + (evaluation[criterion.key]);
    }, 0);
    return (sum / criteria.length).toFixed(1);
  };

  const calculateOverallScore = () => {
    const allKeys = evaluationCategories.flatMap(cat => cat.criteria.map(c => c.key));
    const sum = allKeys.reduce((acc, key) => acc + (evaluation[key]), 0);
    return (sum / allKeys.length).toFixed(2);
  };

  const getScoreColor = (score) => {
    // Professional style - no color coding by score
    return 'text-foreground';
  };

  const getScoreBadge = (score) => {
    if (score >= 4.5) return { label: 'ดีเยี่ยม', variant: 'default', icon: <Star className="h-3 w-3" /> };
    if (score >= 3.5) return { label: 'ดี', variant: 'secondary', icon: <CheckCircle2 className="h-3 w-3" /> };
    if (score >= 2.5) return { label: 'ปานกลาง', variant: 'outline', icon: <AlertCircle className="h-3 w-3" /> };
    return { label: 'ต้องพัฒนา', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> };
  };

  const validateForm = () => {
    // Check if all criteria have been evaluated (not default 3)
    const allCriteria = evaluationCategories.flatMap(cat => cat.criteria.map(c => c.key));
    const unevaluated = allCriteria.filter(key => evaluation[key] === 3);
    
    // Check if hiring recommendation is selected
    const hasRecommendation = evaluation.hiringRecommendation !== 'neutral';
    
    // Check if comments are filled
    const hasComments = evaluation.strengths.trim() !== '' || evaluation.areasForImprovement.trim() !== '';
    
    return {
      isValid: unevaluated.length === 0 && hasRecommendation && hasComments,
      unevaluatedCriteria: unevaluated,
      missingRecommendation: !hasRecommendation,
      missingComments: !hasComments
    };
  };

  const handleSubmit = () => {
    const validation = validateForm();
    
    if (!validation.isValid) {
      setShowValidation(true);
      // Scroll to first error
      if (validation.unevaluatedCriteria.length > 0) {
        const firstUnevaluated = validation.unevaluatedCriteria[0];
        const categoryIndex = evaluationCategories.findIndex(cat => 
          cat.criteria.some(c => c.key === firstUnevaluated)
        );
        setOpenSections({ ...openSections, [categoryIndex.toString()]: true });
      }
      return;
    }
    
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmDialog(false);
    if (submitting) return;
    onSubmit({ ...evaluation, isDraft: false });
    toastMessages.evaluationSubmitted();
  };

  const handleSaveDraft = () => {
    if (submitting) return;
    setIsDraft(true);
    onSubmit({ ...evaluation, isDraft: true });
    toastMessages.draftSaved();
  };

  const allCriteriaKeys = evaluationCategories.flatMap(cat => cat.criteria.map(c => c.key));
  
  const completedCriteria = allCriteriaKeys.filter(key => evaluation[key] !== 3).length;
  
  const totalCriteria = allCriteriaKeys.length;
  const progressPercentage = Math.round((completedCriteria / totalCriteria) * 100);
  
  const validation = validateForm();
  const isFormComplete = validation.isValid;
  // Prevent final submission unless application status is interview or later.
  const isInterviewOrLater = ['interview', 'offer', 'hired'].includes(
    (application?.status || application?.Status || '').toString().toLowerCase()
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Sticky Header with Progress */}
  <div className="sticky top-0 z-40 bg-background border-b">
        <Card className="rounded-none border-x-0 border-t-0 shadow-sm">
          <CardHeader className="py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-[#234C6A] flex items-center justify-center text-white font-bold">
                      {application.candidateName.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{application.candidateName}</CardTitle>
                      <CardDescription className="text-sm">
                        {application.jobTitle} • {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Progress Indicator */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">ความคืบหน้า</div>
                  <div className="text-lg font-bold text-foreground">{progressPercentage}%</div>
                </div>
                <div className="w-24">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
                
                {/* Live Score */}
                <div className="text-right min-w-[100px]">
                  <div className="text-sm text-muted-foreground">คะแนนรวม</div>
                  <div className="text-2xl font-bold text-foreground">
                    {calculateOverallScore()}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Candidate Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ข้อมูลผู้สมัคร</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground mb-1">ข้อมูลติดต่อ</p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">📧</span>
                  <span>{application.candidateEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{application.candidatePhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>สมัครเมื่อ {new Date(application.submittedDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-muted-foreground mb-1">คะแนนเบื้องต้น</p>
              <div className="flex items-center gap-2">
                {application.preScreeningScore ? (
                  <>
                    <Badge className="bg-blue-600 text-lg px-3 py-1">
                      {application.preScreeningScore}
                    </Badge>
                    <span className="text-muted-foreground text-sm">จากระบบอัตโนมัติ</span>
                  </>
                ) : (
                  <span className="text-muted-foreground text-sm">ยังไม่มีคะแนน</span>
                )}
              </div>
            </div>
          </div>

          {application.resume && (
            <div>
              <p className="text-muted-foreground mb-1">เอกสารแนบ</p>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <a href="#" className="text-primary hover:underline text-sm">{application.resume}</a>
              </div>
            </div>
          )}

          {application.coverLetter && (
            <div>
              <p className="text-muted-foreground mb-2">จดหมายสมัครงาน</p>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.coverLetter}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Alert */}
      {showValidation && !validation.isValid && (
        <Card className="bg-red-50 border-red-300 border-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <CardContent className="py-4 px-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">กรุณาตรวจสอบข้อมูลก่อนบันทึก</h3>
                <ul className="space-y-1 text-sm text-red-800">
                  {validation.unevaluatedCriteria.length > 0 && (
                    <li>• ยังมี <strong>{validation.unevaluatedCriteria.length}</strong> รายการที่ยังไม่ได้ประเมิน (คะแนนยังเป็นค่าเริ่มต้น 3)</li>
                  )}
                  {validation.missingRecommendation && (
                    <li>• กรุณาเลือก <strong>คำแนะนำการจ้างงาน</strong></li>
                  )}
                  {validation.missingComments && (
                    <li>• กรุณากรอก <strong>จุดเด่น</strong> หรือ <strong>จุดที่ควรพัฒนา</strong> อย่างน้อย 1 ข้อ</li>
                  )}
                </ul>
                <p className="text-xs text-red-700 mt-2">
                  <strong>หมายเหตุ:</strong> คุณสามารถ <strong>บันทึกร่าง</strong> เพื่อกลับมาทำต่อภายหลังได้
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-3 text-sm">
            <AlertCircle className="h-4 w-4 text-primary flex-shrink-0" />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-foreground">
              <span>คลิกดาวหรือปุ่มตัวเลขเพื่อให้คะแนน</span>
              <span className="text-muted-foreground">•</span>
              <span>คะแนน 3 = พอใช้ (ค่าเริ่มต้น)</span>
              <span className="text-muted-foreground">•</span>
              <span>คะแนน 5 = ดีเยี่ยม</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evaluation Categories */}
      {evaluationCategories.map((category, categoryIndex) => (
        <Card key={categoryIndex}>
          <Collapsible
            open={openSections[categoryIndex.toString()]}
            onOpenChange={() => toggleSection(categoryIndex.toString())}
          >
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer bg-muted transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-left">
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <CardDescription className="text-sm mt-1">{category.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">
                        {calculateCategoryAverage(category.criteria)}
                      </div>
                      <div className="text-xs text-muted-foreground">คะแนนเฉลี่ย</div>
                    </div>
                    {openSections[categoryIndex.toString()] ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="space-y-6 pt-0">
                {category.criteria.map((criterion, criterionIndex) => {
                  const isDefault = evaluation[criterion.key] === 3;
                  const hasValidationError = showValidation && validation.unevaluatedCriteria.includes(criterion.key);
                  
                  return (
                  <div 
                    key={criterionIndex} 
                    className={`space-y-3 p-4 rounded-lg border-2 transition-all ${
                      hasValidationError 
                        ? 'bg-red-50 border-red-300 animate-pulse' 
                        : isDefault
                        ? 'bg-yellow-50 border-yellow-200 hover:border-yellow-300'
                        : 'bg-gradient-to-br from-white to-muted border-border/50 hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {hasValidationError && (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                          {isDefault && !hasValidationError && (
                            <div className="h-2 w-2 rounded-full bg-muted-foreground/30" title="ยังไม่ได้ประเมิน" />
                          )}
                          <Label className="text-base font-medium">{criterion.label}</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {criterion.description}
                        </p>
                      </div>
                      <div className="text-center min-w-[60px]">
                        <div className={`text-3xl font-bold ${
                          hasValidationError ? 'text-red-600' : 'text-foreground'
                        }`}>
                          {evaluation[criterion.key]}
                        </div>
                        <div className="text-xs text-muted-foreground">/ 5</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Radio Button Style - Google Form Style */}
                      <div className="bg-muted border border-border rounded-lg p-4">
                        <RadioGroup
                          value={evaluation[criterion.key].toString()}
                          onValueChange={(value) => handleSliderChange(criterion.key, [parseInt(value)])}
                          className="space-y-0"
                        >
                          <div className="flex items-center justify-between gap-2">
                            {/* Labels */}
                            <div className="flex flex-col items-start gap-1">
                              <span className="text-xs text-muted-foreground font-medium">ต่ำมาก</span>
                              <span className="text-xs text-muted-foreground">(1)</span>
                            </div>

                            {/* Radio Options */}
                            <div className="flex items-center gap-4 px-4">
                              {[1, 2, 3, 4, 5].map((score) => (
                                <div key={score} className="flex flex-col items-center gap-1.5">
                                  <RadioGroupItem
                                    value={score.toString()}
                                    id={`${criterion.key}-${score}`}
                                    className="h-5 w-5 border-2 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                                  />
                                  <Label 
                                    htmlFor={`${criterion.key}-${score}`}
                                    className="text-xs font-semibold text-muted-foreground cursor-pointer hover:text-primary"
                                  >
                                    {score}
                                  </Label>
                                </div>
                              ))}
                            </div>

                            {/* Labels */}
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xs text-muted-foreground font-medium">ดีเยี่ยม</span>
                              <span className="text-xs text-muted-foreground">(5)</span>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Anchor Descriptions */}
                      <div className="bg-muted border border-border rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {evaluation[criterion.key]}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              คำอธิบายระดับคะแนน:
                            </p>
                            <p className="text-sm text-foreground leading-relaxed">
                              {criterion.anchors[evaluation[criterion.key]]}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* All Levels Quick Reference */}
                      <details className="text-sm group">
                        <summary className="cursor-pointer hover:text-primary font-medium text-muted-foreground flex items-center gap-2">
                          <ChevronDown className="h-3 w-3 group-open:rotate-180 transition-transform" />
                          ดูคำอธิบายทุกระดับ
                        </summary>
                        <div className="mt-3 space-y-2 pl-3 border-l-2 border-primary/30">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <div key={score} className="flex gap-2 text-muted-foreground">
                              <span className="font-medium min-w-[20px] text-foreground">{score}.</span>
                              <span className="flex-1">{criterion.anchors[score]}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  </div>
                )})}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}

      {/* Overall Assessment */}
      <Card className="border-2 border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>การประเมินรวมและคำแนะนำ</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Score Summary */}
          <div className="bg-muted border border-border rounded-lg p-6">
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground mb-2">คะแนนรวมทั้งหมด</p>
              <div className="text-6xl font-bold text-foreground mb-2">
                {calculateOverallScore()}
              </div>
              <div className="text-xl text-muted-foreground">/ 5.00</div>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {evaluationCategories.map((category, idx) => (
                <div key={idx} className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-xl font-bold text-foreground">
                    {calculateCategoryAverage(category.criteria)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {category.title}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overall Impression */}
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">ความประทับใจโดยรวม</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  ประเมินความประทับใจโดยรวมจากการสัมภาษณ์
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {evaluation.overallImpression}
                </div>
                <div className="text-xs text-muted-foreground">/ 5</div>
              </div>
            </div>
            
            {/* Star Rating for Overall */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => handleSliderChange('overallImpression', [score])}
                  className="group transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-12 w-12 transition-all ${
                      score <= evaluation.overallImpression
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-300 group-hover:fill-yellow-200 group-hover:text-yellow-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Hiring Recommendation */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">คำแนะนำการจ้างงาน</Label>
            <RadioGroup
              value={evaluation.hiringRecommendation}
              onValueChange={(value) => 
                setEvaluation({ ...evaluation, hiringRecommendation: value })
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  evaluation.hiringRecommendation === 'strongly_recommend' 
                    ? 'border-green-500 bg-green-50' 
                        : 'border-border hover:border-green-300 hover:bg-green-50'
                }`}>
                  <RadioGroupItem value="strongly_recommend" id="strongly_recommend" className="mt-1" />
                  <div className="flex-1">
                    <div className="font-semibold text-green-700 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      แนะนำอย่างยิ่ง
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ผู้สมัครมีคุณสมบัติโดดเด่น ควรรับเข้าทำงานทันที
                    </p>
                  </div>
                </label>
                
                <label className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  evaluation.hiringRecommendation === 'recommend' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-border hover:border-blue-300 hover:bg-blue-50'
                }`}>
                  <RadioGroupItem value="recommend" id="recommend" className="mt-1" />
                  <div className="flex-1">
                    <div className="font-semibold text-blue-700 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      แนะนำ
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ผู้สมัครมีคุณสมบัติดี เหมาะสมกับตำแหน่ง
                    </p>
                  </div>
                </label>
                
                <label className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  evaluation.hiringRecommendation === 'consider' 
                    ? 'border-yellow-500 bg-yellow-50' 
                    : 'border-border hover:border-yellow-300 hover:bg-yellow-50'
                }`}>
                  <RadioGroupItem value="consider" id="consider" className="mt-1" />
                  <div className="flex-1">
                    <div className="font-semibold text-yellow-700 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      พิจารณา
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ผู้สมัครมีศักยภาพ แต่ต้องพิจารณาเพิ่มเติม
                    </p>
                  </div>
                </label>
                
                <label className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  evaluation.hiringRecommendation === 'neutral' 
                    ? 'border-gray-500 bg-gray-50' 
                    : 'border-border hover:border-gray-300 hover:bg-gray-50'
                }`}>
                  <RadioGroupItem value="neutral" id="neutral" className="mt-1" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-700 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      เฉยๆ
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ผู้สมัครมีคุณสมบัติพอใช้ ไม่โดดเด่น
                    </p>
                  </div>
                </label>
                
                <label className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  evaluation.hiringRecommendation === 'not_recommend' 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-border hover:border-orange-300 hover:bg-orange-50'
                }`}>
                  <RadioGroupItem value="not_recommend" id="not_recommend" className="mt-1" />
                  <div className="flex-1">
                    <div className="font-semibold text-orange-700 flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      ไม่แนะนำ
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ผู้สมัครไม่เหมาะสมกับตำแหน่ง
                    </p>
                  </div>
                </label>
                
                <label className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  evaluation.hiringRecommendation === 'strongly_not_recommend' 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-border hover:border-red-300 hover:bg-red-50'
                }`}>
                  <RadioGroupItem value="strongly_not_recommend" id="strongly_not_recommend" className="mt-1" />
                  <div className="flex-1">
                    <div className="font-semibold text-red-700 flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      ไม่แนะนำอย่างยิ่ง
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ผู้สมัครไม่เหมาะสมอย่างยิ่ง ไม่ควรรับเข้าทำงาน
                    </p>
                  </div>
                </label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Comments Section */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <Label htmlFor="strengths" className="font-medium">จุดเด่น</Label>
              </div>
              <Textarea
                id="strengths"
                value={evaluation.strengths}
                onChange={(e) => setEvaluation({ ...evaluation, strengths: e.target.value })}
                placeholder="• ทักษะที่โดดเด่น&#10;• ประสบการณ์ที่เกี่ยวข้อง&#10;• บุคลิกภาพที่ดี&#10;• จุดแข็งอื่นๆ..."
                className="min-h-[120px] font-mono text-sm"
              />
            </div>

            {/* Areas for Improvement */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="areasForImprovement" className="font-medium">จุดที่ควรพัฒนา</Label>
              </div>
              <Textarea
                id="areasForImprovement"
                value={evaluation.areasForImprovement}
                onChange={(e) => setEvaluation({ ...evaluation, areasForImprovement: e.target.value })}
                placeholder="• ทักษะที่ยังขาด&#10;• ประสบการณ์ที่ต้องเพิ่มเติม&#10;• จุดที่ต้องพัฒนา&#10;• ข้อควรระวัง..."
                className="min-h-[120px] font-mono text-sm"
              />
            </div>
          </div>

          {/* Interview Notes */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="interviewNotes" className="font-medium">บันทึกการสัมภาษณ์</Label>
            </div>
            <Textarea
              id="interviewNotes"
              value={evaluation.interviewNotes}
              onChange={(e) => setEvaluation({ ...evaluation, interviewNotes: e.target.value })}
              placeholder="บันทึกรายละเอียดจากการสัมภาษณ์:&#10;• คำถามที่ถามและคำตอบ&#10;• ความประทับใจ&#10;• พฤติกรรมที่สังเกต&#10;• ข้อมูลเพิ่มเติม..."
              className="min-h-[150px] font-mono text-sm"
            />
          </div>

          {/* Additional Comments */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="additionalComments" className="font-medium">ความคิดเห็นเพิ่มเติม</Label>
            </div>
            <Textarea
              id="additionalComments"
              value={evaluation.additionalComments}
              onChange={(e) => setEvaluation({ ...evaluation, additionalComments: e.target.value })}
              placeholder="ข้อเสนอแนะ ข้อสังเกต หรือความคิดเห็นอื่นๆ ที่ต้องการบันทึกเพิ่มเติม..."
              className="min-h-[100px] font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
  <Card className="bg-muted border-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            สรุปผลการประเมิน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">คะแนนรวมเฉลี่ย</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-foreground">
                    {calculateOverallScore()}
                  </span>
                  <span className="text-2xl text-muted-foreground">/ 5.00</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">คำแนะนำการจ้างงาน</p>
                <Badge className={`
                  ${evaluation.hiringRecommendation === 'strongly_recommend' ? 'bg-green-600' : ''}
                  ${evaluation.hiringRecommendation === 'recommend' ? 'bg-blue-600' : ''}
                  ${evaluation.hiringRecommendation === 'consider' ? 'bg-yellow-600' : ''}
                  ${evaluation.hiringRecommendation === 'neutral' ? 'bg-gray-600' : ''}
                  ${evaluation.hiringRecommendation === 'not_recommend' ? 'bg-orange-600' : ''}
                  ${evaluation.hiringRecommendation === 'strongly_not_recommend' ? 'bg-red-600' : ''}
                  text-white text-sm px-3 py-1
                `}>
                  {evaluation.hiringRecommendation === 'strongly_recommend' && 'แนะนำอย่างยิ่ง'}
                  {evaluation.hiringRecommendation === 'recommend' && 'แนะนำ'}
                  {evaluation.hiringRecommendation === 'consider' && 'พิจารณา'}
                  {evaluation.hiringRecommendation === 'neutral' && 'เฉยๆ'}
                  {evaluation.hiringRecommendation === 'not_recommend' && 'ไม่แนะนำ'}
                  {evaluation.hiringRecommendation === 'strongly_not_recommend' && 'ไม่แนะนำอย่างยิ่ง'}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">คะแนนแยกตามหมวด</p>
              {evaluationCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                  <span className="text-sm truncate">
                    {category.title}
                  </span>
                  <span className="font-bold text-foreground ml-2">
                    {calculateCategoryAverage(category.criteria)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sticky Action Buttons */}
  <div className="sticky bottom-0 z-40 bg-background border-t shadow-lg">
        <div className="max-w-7xl mx-auto py-4 px-6">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="lg" onClick={onCancel} className="gap-2">
                <XCircle className="h-4 w-4" />
                ยกเลิก
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleSaveDraft}
                disabled={submitting}
                className="gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                บันทึกร่าง
              </Button>
              
              {/* Progress Summary */}
              <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isFormComplete ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                  <span className="text-muted-foreground">
                    ประเมินแล้ว <strong className="text-foreground">{completedCriteria}/{totalCriteria}</strong> รายการ
                  </span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">คะแนนรวม</span>
                  <span className={`text-lg font-bold ${getScoreColor(parseFloat(calculateOverallScore()))}`}>
                    {calculateOverallScore()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-end gap-3">
              {!isInterviewOrLater && (
                <div className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded-md border border-yellow-200">
                  <strong>ยังไม่สามารถส่งการประเมินได้</strong>
                  <div>สถานะของผู้สมัครต้องเป็น <em>interview</em> ขึ้นไปก่อน ระบบจะอนุญาตให้ส่งการประเมิน</div>
                </div>
              )}

              <Button 
                size="lg" 
                onClick={handleSubmit}
                disabled={!isFormComplete || submitting || !isInterviewOrLater}
                className="gap-2 min-w-[200px]"
              >
                <CheckCircle2 className="h-5 w-5" />
                {isFormComplete ? 'บันทึกการประเมิน' : `กรุณาประเมินอีก ${totalCriteria - completedCriteria} รายการ`}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      {showConfirmDialog && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <Card className="max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                ยืนยันการบันทึกการประเมิน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                คุณกำลังจะบันทึกการประเมินสำหรับ <strong>{application.candidateName}</strong> 
                ในตำแหน่ง <strong>{application.jobTitle}</strong>
              </p>
              
              <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">คะแนนรวม:</span>
                  <span className="font-bold text-foreground">
                    {calculateOverallScore()} / 5.00
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">คำแนะนำ:</span>
                  <Badge className={`
                    ${evaluation.hiringRecommendation === 'strongly_recommend' ? 'bg-green-600' : ''}
                    ${evaluation.hiringRecommendation === 'recommend' ? 'bg-blue-600' : ''}
                    ${evaluation.hiringRecommendation === 'consider' ? 'bg-yellow-600' : ''}
                    text-white text-xs
                  `}>
                    {evaluation.hiringRecommendation === 'strongly_recommend' && 'แนะนำอย่างยิ่ง'}
                    {evaluation.hiringRecommendation === 'recommend' && 'แนะนำ'}
                    {evaluation.hiringRecommendation === 'consider' && 'พิจารณา'}
                    {evaluation.hiringRecommendation === 'neutral' && 'เฉยๆ'}
                    {evaluation.hiringRecommendation === 'not_recommend' && 'ไม่แนะนำ'}
                    {evaluation.hiringRecommendation === 'strongly_not_recommend' && 'ไม่แนะนำอย่างยิ่ง'}
                  </Badge>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                ⚠️ การประเมินนี้จะถูกส่งไปยังทีม HR และไม่สามารถแก้ไขได้
              </p>
              
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={submitting}
                >
                  ตรวจสอบอีกครั้ง
                </Button>
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleConfirmSubmit}
                  disabled={submitting}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  ยืนยันบันทึก
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
