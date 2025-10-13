import { useState } from 'react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Search } from 'lucide-react';

export function JobFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    search: '',
    location: 'all',
    department: 'all',
    experienceLevel: 'all'
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-card border rounded-lg p-6 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search">ค้นหา</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="ชื่อตำแหน่ง, คำสำคัญ..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">สถานที่</Label>
          <Select
            value={filters.location}
            onValueChange={(value) => handleFilterChange('location', value)}
          >
            <SelectTrigger id="location">
              <SelectValue placeholder="เลือกสถานที่" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="สาขาเซ็นทรัล ลาดพร้าว">สาขาเซ็นทรัล ลาดพร้าว</SelectItem>
              <SelectItem value="สาขาเซ็นทรัล พระราม 9">สาขาเซ็นทรัล พระราม 9</SelectItem>
              <SelectItem value="สาขาเซ็นทรัล บางนา">สาขาเซ็นทรัล บางนา</SelectItem>
              <SelectItem value="สาขาเซ็นทรัล เชียงใหม่">สาขาเซ็นทรัล เชียงใหม่</SelectItem>
              <SelectItem value="สาขาเซ็นทรัล ขอนแก่น">สาขาเซ็นทรัล ขอนแก่น</SelectItem>
              <SelectItem value="สำนักงานใหญ่ กรุงเทพฯ">สำนักงานใหญ่</SelectItem>
              <SelectItem value="คลังสินค้า นวนคร">คลังสินค้า</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">แผนก</Label>
          <Select
            value={filters.department}
            onValueChange={(value) => handleFilterChange('department', value)}
          >
            <SelectTrigger id="department">
              <SelectValue placeholder="เลือกแผนก" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="ฝ่ายขาย">ฝ่ายขาย</SelectItem>
              <SelectItem value="ฝ่ายเทคนิค">ฝ่ายเทคนิค</SelectItem>
              <SelectItem value="ฝ่ายบริการลูกค้า">ฝ่ายบริการลูกค้า</SelectItem>
              <SelectItem value="ฝ่ายบริหาร">ฝ่ายบริหาร</SelectItem>
              <SelectItem value="ฝ่ายโลจิสติกส์">ฝ่ายโลจิสติกส์</SelectItem>
              <SelectItem value="ฝ่าย IT">ฝ่าย IT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">ระดับประสบการณ์</Label>
          <Select
            value={filters.experienceLevel}
            onValueChange={(value) => handleFilterChange('experienceLevel', value)}
          >
            <SelectTrigger id="experience">
              <SelectValue placeholder="เลือกระดับ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="entry">ไม่จำเป็นต้องมีประสบการณ์</SelectItem>
              <SelectItem value="mid">ประสบการณ์ 1-3 ปี</SelectItem>
              <SelectItem value="senior">ประสบการณ์ 3+ ปี</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}