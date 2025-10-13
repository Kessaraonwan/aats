import { Button } from '../ui/button';
import { 
  Users as UsersIcon, 
  Briefcase as BriefcaseIcon, 
  Clock as ClockIcon, 
  BarChart3 as BarChart3Icon, 
  Home as HomeIcon,
  Building2 as Building2Icon,
  User as UserIcon,
  LogOut as LogOutIcon,
  ChevronDown as ChevronDownIcon,
  FileText as FileTextIcon
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export function Navigation({ user, currentPage, onNavigate, onLogout }) {
  const candidateNavItems = [
    { id: 'jobs', label: 'ตำแหน่งงาน', icon: BriefcaseIcon },
    { id: 'track', label: 'ติดตามสถานะ', icon: ClockIcon },
    { id: 'application-history', label: 'ประวัติการสมัคร', icon: FileTextIcon }
  ];

  const hrNavItems = [
    { id: 'hr-dashboard', label: 'แดชบอร์ด', icon: BarChart3Icon },
    { id: 'hr-applicants', label: 'ผู้สมัครงาน', icon: UsersIcon },
    { id: 'hr-jobs', label: 'จัดการตำแหน่ง', icon: BriefcaseIcon },
    { id: 'hr-reports', label: 'รายงาน', icon: HomeIcon }
  ];

  const hmNavItems = [
    { id: 'hm-dashboard', label: 'แดชบอร์ด', icon: BarChart3Icon },
    { id: 'hm-notifications', label: 'การแจ้งเตือน', icon: ClockIcon },
    { id: 'hm-review', label: 'ประเมินผู้สมัคร', icon: UsersIcon },
    { id: 'hm-reports', label: 'รายงาน', icon: FileTextIcon }
  ];

  const navItems = user.role === 'hr' ? hrNavItems : user.role === 'hm' ? hmNavItems : candidateNavItems;

  const getInitials = (name) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0].charAt(0) + parts[1].charAt(0);
    }
    return name.substring(0, 2);
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'hr':
        return 'เจ้าหน้าที่ HR';
      case 'hm':
        return 'ผู้จัดการ';
      case 'candidate':
      default:
        return 'ผู้สมัครงาน';
    }
  };

  const handleLogoClick = () => {
    // Navigate to home based on role without logging out
    if (user.role === 'candidate') {
      onNavigate('jobs');
    } else if (user.role === 'hr') {
      onNavigate('hr-dashboard');
    } else {
      onNavigate('hm-dashboard');
    }
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav className="premium-header premium-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <button 
              onClick={handleLogoClick}
              className="flex items-center gap-2.5 transition-opacity bg-white px-3 py-1 rounded-md border-0"
            >
              <Building2Icon className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold tracking-tight text-primary">AATS</span>
            </button>

            {/* Navigation Items */}
            <div className="hidden md:flex gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? 'default' : 'ghost'}
                  onClick={() => onNavigate(item.id)}
                  className={`gap-2 rounded-2xl font-semibold ${currentPage === item.id ? 'bg-white text-primary shadow-sm' : 'bg-white/6 text-white/70 hover:bg-white/10'}`}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  className="gap-2 premium-btn rounded-2xl px-3 py-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-white text-primary font-bold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-bold leading-none text-white">{user.name}</p>
                    <p className="text-xs leading-none mt-1 text-white/90">{getRoleLabel(user.role)}</p>
                  </div>
                  <ChevronDownIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-white border">
                <DropdownMenuLabel className="bg-primary/5">
                  <div>
                    <p className="font-bold text-base text-foreground">{user.name}</p>
                    <p className="text-sm text-gray-600 font-medium">{user.email}</p>
                    <p className="text-sm text-primary font-semibold mt-1">
                      {getRoleLabel(user.role)}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onNavigate('profile')}
                  className="cursor-pointer"
                >
                  <UserIcon className="size-4 mr-2" />
                  แก้ไขโปรไฟล์
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={onLogout} 
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOutIcon className="size-4 mr-2" />
                  ออกจากระบบ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4 flex gap-2 overflow-x-auto">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={currentPage === item.id ? 'default' : 'ghost'}
              onClick={() => onNavigate(item.id)}
              size="sm"
              className={`gap-2 whitespace-nowrap ${currentPage === item.id ? 'bg-white text-primary shadow-sm' : 'bg-white/6 text-white/70'}`}
            >
              <item.icon className="size-4" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </nav>
    </>
  );
}
