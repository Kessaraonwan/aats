import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Search, ArrowUpDown } from "lucide-react";

const statusLabels = {
  submitted: "ส่งใบสมัครแล้ว",
  screening: "กำลังคัดกรอง",
  interview: "นัดสัมภาษณ์",
  offer: "เสนอตำแหน่งงาน",
  rejected: "ไม่ผ่านการคัดเลือก",
};

const statusColors = {
  submitted: "secondary",
  screening: "default",
  interview: "default",
  offer: "default",
  rejected: "destructive",
};

export function ApplicantsTable({ applications, onViewDetails }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const filteredApplications = applications
    .filter((app) => {
      const matchesSearch =
        app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;

      if (sortBy === "date") {
        comparison =
          new Date(a.submittedDate).getTime() -
          new Date(b.submittedDate).getTime();
      } else if (sortBy === "score") {
        // ถ้ามี Evaluation Score ให้เรียงตามนั้น ถ้าไม่มีใช้ Pre-Screen Score
        const scoreA = a.evaluation?.overallScore || (a.preScreeningScore || 0) / 20; // แปลง 0-100 เป็น 0-5
        const scoreB = b.evaluation?.overallScore || (b.preScreeningScore || 0) / 20;
        comparison = scoreA - scoreB;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getScoreBadge = (score) => {
    if (!score) return <span className="text-muted-foreground">-</span>;

    if (score >= 90)
      return <Badge className="bg-green-600">A ({score})</Badge>;
    if (score >= 80)
      return <Badge className="bg-blue-600">B ({score})</Badge>;
    if (score >= 70)
      return <Badge className="bg-yellow-600">C ({score})</Badge>;
    return <Badge variant="secondary">D ({score})</Badge>;
  };

  // ฟังก์ชันแสดงคะแนน: ถ้ามี Evaluation Score ให้แสดงคะแนนนั้น ถ้าไม่มีแสดง Pre-Screen Score
  const getDisplayScore = (app) => {
    if (app.evaluation?.overallScore) {
      return (
        <div className="flex items-center gap-1">
          <span className="font-medium text-primary">{app.evaluation.overallScore}</span>
          <span className="text-muted-foreground text-sm">/5</span>
        </div>
      );
    }
    return getScoreBadge(app.preScreeningScore);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อ, อีเมล, ตำแหน่ง..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="กรองสถานะ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">สถานะทั้งหมด</SelectItem>
            <SelectItem value="submitted">ส่งใบสมัครแล้ว</SelectItem>
            <SelectItem value="screening">กำลังคัดกรอง</SelectItem>
            <SelectItem value="interview">นัดสัมภาษณ์</SelectItem>
            <SelectItem value="offer">เสนอตำแหน่งงาน</SelectItem>
            <SelectItem value="rejected">ไม่ผ่านการคัดเลือก</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="premium-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อผู้สมัคร</TableHead>
              <TableHead>ตำแหน่ง</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort("date")}
                  className="flex items-center gap-1 bg-muted p-0"
                >
                  วันที่สมัคร
                  <ArrowUpDown className="size-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort("score")}
                  className="flex items-center gap-1 bg-muted p-0"
                >
                  คะแนน
                  <ArrowUpDown className="size-4" />
                </Button>
              </TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground h-32"
                >
                  ไม่พบข้อมูลผู้สมัคร
                </TableCell>
              </TableRow>
            ) : (
              filteredApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div>
                      <p>{app.candidateName}</p>
                      <p className="text-muted-foreground">
                        {app.candidateEmail}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{app.jobTitle}</TableCell>
                  <TableCell>{formatDate(app.submittedDate)}</TableCell>
                  <TableCell>{getDisplayScore(app)}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[app.status]}>
                      {statusLabels[app.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(app.id)}
                    >
                      ดูรายละเอียด
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center text-muted-foreground">
        <p>
          แสดง {filteredApplications.length} จาก {applications.length} รายการ
        </p>
      </div>
    </div>
  );
}
