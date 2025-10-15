import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { Badge } from '../ui/badge';

const statusLabels = {
  submitted: 'ส่งใบสมัคร',
  screening: 'ตรวจสอบใบสมัคร',
  interview: 'สัมภาษณ์',
  offer: 'เสนอตำแหน่ง',
  rejected: 'ไม่ผ่านการคัดกรอง'
};

const statusColors = {
  submitted: 'bg-blue-500',
  screening: 'bg-yellow-500',
  interview: 'bg-purple-500',
  offer: 'bg-green-500',
  rejected: 'bg-red-500'
};

export function StatusTimeline({ timeline = [], currentStatus }) {
  const allStatuses = ['submitted', 'screening', 'interview', 'offer'];

  const getStatusState = (status) => {
    const currentStatusIndex = allStatuses.indexOf(currentStatus);
    const statusIndex = allStatuses.indexOf(status);

    if (currentStatus === 'rejected') {
      return timeline.some((t) => t.status === status) ? 'completed' : 'pending';
    }

    if (statusIndex < currentStatusIndex) return 'completed';
    if (statusIndex === currentStatusIndex) return 'current';
    return 'pending';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (currentStatus === 'rejected') {
    return (
      <div className="space-y-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <CheckCircle2 className="size-5" />
            <span>ไม่ผ่านการคัดเลือก</span>
          </div>
          <p className="text-muted-foreground">
            {timeline.find(t => t.status === 'rejected')?.description || 'ขอบคุณสำหรับความสนใจในตำแหน่งนี้'}
          </p>
          <p className="text-muted-foreground mt-1">
            {timeline.find((t) => t.status === 'rejected')?.date && formatDate(timeline.find((t) => t.status === 'rejected')?.date)}
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-lg font-medium">ประวัติการสมัคร</h4>
          {timeline.filter(t => t.status !== 'rejected').map((event, index) => (
            <div key={event.id} className="flex gap-4 pl-2">
              <div className="flex flex-col items-center">
                <CheckCircle2 className="size-5 text-muted-foreground" />
                {index < timeline.length - 2 && <div className="w-px h-full bg-border mt-1" />}
              </div>
              <div className="pb-4">
                <p className="font-medium">{statusLabels[event.status]}</p>
                <p className="text-muted-foreground">{event.description}</p>
                <p className="text-muted-foreground">{formatDate(event.date)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {allStatuses.map((status, index) => {
          const state = getStatusState(status);
          const Icon = state === 'completed' ? CheckCircle2 : state === 'current' ? Clock : Circle;
          
          return (
            <div key={status} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`rounded-full p-2 ${
                  state === 'completed' ? 'bg-green-500 text-white' :
                  state === 'current' ? 'bg-blue-500 text-white' :
                  'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="size-5" />
                </div>
                <p className="mt-2 text-center">{statusLabels[status]}</p>
              </div>
              {index < allStatuses.length - 1 && (
                <div className={`flex-1 h-px mx-2 ${
                  state === 'completed' ? 'bg-green-500' : 'bg-border'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <h4 className="text-lg font-medium">รายละเอียด</h4>
        <div className="space-y-2">
          {timeline.map((event, index) => (
            <div key={event.id} className="flex gap-4 pl-2">
              <div className="flex flex-col items-center">
                <CheckCircle2 className="size-5 text-green-500" />
                {index < timeline.length - 1 && <div className="w-px h-full bg-border mt-1" />}
              </div>
              <div className="pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={statusColors[event.status]}>{statusLabels[event.status]}</Badge>
                  <span className="text-muted-foreground">{formatDate(event.date)}</span>
                </div>
                <p className="text-muted-foreground">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}