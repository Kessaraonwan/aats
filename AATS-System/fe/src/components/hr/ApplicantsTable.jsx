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
  const [showOfferWithoutEval, setShowOfferWithoutEval] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const filteredApplications = applications
    .filter((app) => {
      // hide inconsistent rows by default: if status is offer/hired but there is no evaluation, filter out
      if (!showOfferWithoutEval && (app.status === 'offer' || app.status === 'hired')) {
        // evaluation shape: app.evaluation?.overallScore or app.score?.hm?.overallScore may be present
        const hasEval = !!(app.evaluation || (app.score && app.score.hm && app.score.hm.overallScore));
        if (!hasEval) return false;
      }
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

  // score is expected 0-5 (float). Show colored badge based on ranges and display as X.X /5
  // If there's no score or score is 0, render nothing (per design request)
  const getScoreBadge = (score) => {
    if (score === null || score === undefined || Number(score) === 0) return null;
    const s = Number(score);
    const label = `${s.toFixed(1)}/5`;

    if (s >= 4.5) return <Badge className="bg-green-600 text-white">{label}</Badge>;
    if (s >= 3.5) return <Badge className="bg-sky-600 text-white">{label}</Badge>;
    if (s >= 2.5) return <Badge className="bg-amber-500 text-black">{label}</Badge>;
    if (s >= 1.5) return <Badge className="bg-violet-600 text-white">{label}</Badge>;
    return <Badge variant="destructive">{label}</Badge>;
  };

  // ฟังก์ชันแสดงคะแนน: ถ้ามี Evaluation Score ให้แสดงคะแนนนั้น ถ้าไม่มีแสดง Pre-Screen Score
  const getDisplayScore = (app) => {
    // Only show HM evaluation when application status is interview or later
    const hmAllowed = app.status === "interview" || app.status === "offer" || app.status === "hired";
    const hmScore = hmAllowed ? (app.score?.hm?.overallScore ?? app.evaluation?.overallScore ?? null) : null;

    if (hmScore !== null && hmScore !== undefined) {
      return getScoreBadge(hmScore);
    }

    // fall back to auto pre-screen score: if it's 0-100 convert to 0-5 scale
    const raw = app.score?.auto?.percent ?? app.preScreeningScore ?? null;
    if (raw === null || raw === undefined) return getScoreBadge(null);
    const converted = Number(raw) / 20;
    return getScoreBadge(converted);
  };

  const getRowLeftBorderClass = (app) => {
    // determine percentage used for color
    const hmAllowed = app.status === "interview" || app.status === "offer" || app.status === "hired";
    const hmScore = hmAllowed ? (app.score?.hm?.overallScore ?? app.evaluation?.overallScore ?? null) : null;
    const pct = hmScore ? Math.round(Number(hmScore) * 20) : (app.score?.auto?.percent ?? app.preScreeningScore ?? 0);

    if (pct >= 90) return "border-l-4 border-green-600";
    if (pct >= 80) return "border-l-4 border-sky-600";
    if (pct >= 70) return "border-l-4 border-amber-500";
    if (pct >= 50) return "border-l-4 border-violet-600";
    return "border-l-4 border-red-600";
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
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <input
            id="show-offer-no-eval"
            type="checkbox"
            checked={showOfferWithoutEval}
            onChange={(e) => setShowOfferWithoutEval(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="show-offer-no-eval" className="text-sm text-muted-foreground">แสดงรายการที่ถูกเสนอแต่ไม่มีคะแนน</label>
        </div>
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
                <TableRow key={app.id} className={"hover:bg-muted"}>
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
