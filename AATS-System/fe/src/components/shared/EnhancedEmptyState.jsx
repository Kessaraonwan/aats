import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { 
  SearchX, 
  FileText, 
  Inbox, 
  AlertCircle,
  Wifi,
  RefreshCw,
  Loader2
} from 'lucide-react';

export function EnhancedEmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  variant = 'default', // default, search, empty, error, offline, loading
  className = ''
}) {
  // Preset variants
  const variants = {
    search: {
      icon: SearchX,
      title: 'ไม่พบผลลัพธ์',
      description: 'ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองเพื่อค้นหาข้อมูลที่ต้องการ',
      illustration: null,
  bgColor: 'bg-muted'
    },
    empty: {
      icon: Inbox,
      title: 'ยังไม่มีข้อมูล',
      description: 'เริ่มต้นใช้งานโดยการเพิ่มข้อมูลใหม่',
      illustration: null,
  bgColor: 'bg-muted'
    },
    error: {
      icon: AlertCircle,
      title: 'เกิดข้อผิดพลาด',
      description: 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
      illustration: null,
  bgColor: 'bg-red-50'
    },
    offline: {
      icon: Wifi,
      title: 'ไม่มีการเชื่อมต่ออินเทอร์เน็ต',
      description: 'กรุณาตรวจสอบการเชื่อมต่อของคุณและลองใหม่อีกครั้ง',
      illustration: null,
  bgColor: 'bg-orange-50'
    },
    loading: {
      icon: Loader2,
      title: 'กำลังโหลดข้อมูล...',
      description: 'กรุณารอสักครู่',
      bgColor: 'bg-blue-50'
    }
  };

  const preset = variants[variant] || {};
  const FinalIcon = Icon || preset.icon || FileText;
  const finalTitle = title || preset.title;
  const finalDescription = description || preset.description;
  const illustration = preset.illustration;
  const bgColor = preset.bgColor || 'bg-muted';

  return (
    <Card className={`border-2 border-dashed ${className}`}>
      <CardContent className={`flex flex-col items-center justify-center py-12 px-6 ${bgColor} rounded-lg`}>
        {FinalIcon && (
          <div className={`rounded-full p-4 mb-4 ${
            variant === 'error' ? 'bg-red-100' :
            variant === 'offline' ? 'bg-orange-100' :
            variant === 'loading' ? 'bg-primary/10' :
            'bg-muted'
          }`}>
            <FinalIcon className={`size-10 ${
              variant === 'error' ? 'text-red-600' :
              variant === 'offline' ? 'text-orange-600' :
              variant === 'loading' ? 'text-primary animate-spin' :
              'text-muted-foreground'
            }`} />
          </div>
        )}
        <div className="space-y-2 text-center">
          <h3 className="text-lg font-semibold">{finalTitle}</h3>
          {finalDescription && (
            <p className="text-sm text-muted-foreground max-w-sm">
              {finalDescription}
            </p>
          )}
        </div>
        {action && variant !== 'loading' && (
          <Button 
            onClick={action.onClick} 
            className="mt-6"
            variant={variant === 'error' || variant === 'offline' ? 'outline' : 'default'}
          >
            {(variant === 'error' || variant === 'offline') && (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Specialized Empty States
export function NoJobsFound({ onReset }) {
  return (
    <EnhancedEmptyState
      variant="search"
      action={onReset ? { label: 'ล้างตัวกรอง', onClick: onReset } : null}
    />
  );
}

export function NoApplicationsYet({ onApply }) {
  return (
    <EnhancedEmptyState
      variant="empty"
      title="ยังไม่มีประวัติการสมัครงาน"
      description="คุณยังไม่ได้สมัครงานตำแหน่งใด เริ่มต้นค้นหาตำแหน่งที่เหมาะสมกับคุณได้เลย"
      action={onApply ? { label: 'เริ่มค้นหางาน', onClick: onApply } : null}
    />
  );
}

export function LoadingError({ onRetry }) {
  return (
    <EnhancedEmptyState
      variant="error"
      action={{ label: 'ลองใหม่อีกครั้ง', onClick: onRetry }}
    />
  );
}

export function OfflineError({ onRetry }) {
  return (
    <EnhancedEmptyState
      variant="offline"
      action={{ label: 'ลองเชื่อมต่อใหม่', onClick: onRetry }}
    />
  );
}

export function LoadingState({ message = 'กำลังโหลดข้อมูล...' }) {
  return (
    <EnhancedEmptyState
      variant="loading"
      title={message}
    />
  );
}
