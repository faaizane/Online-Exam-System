import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/SSidebar';
import SHeader from '../components/SHeader';

/* 1 → 1st, 2 → 2nd … */
const toOrdinal = n => {
  const num = Number(n), rem100 = num % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${num}th`;
  switch (num % 10) {
    case 1: return `${num}st`;
    case 2: return `${num}nd`;
    case 3: return `${num}rd`;
    default: return `${num}th`;
  }
};

/* Memoised date/time strings */
function useFormatted(exam) {
  return useMemo(() => {
    if (!exam?.scheduleDate) return {};
    const dt = new Date(exam.scheduleDate);
    return isNaN(dt) ? {} : {
      examDate: dt.toLocaleDateString(),
      examTime: dt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
      dateTime: dt
    };
  }, [exam]);
}

/* Attempted / Ongoing / Scheduled */
const getStatus = (exam, dateTime) => {
  if (exam?.attempted) return 'Attempted';
  if (!dateTime) return '';
  const now = new Date();
  if (dateTime.toDateString() === now.toDateString()) return 'Ongoing';
  return dateTime > now ? 'Scheduled' : 'Completed';
};

export default function TestPage() {
  /* ─ Sidebar state ─ */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(o => !o);

  /* ─ Routing state ─ */
  const { state } = useLocation();
  const navigate  = useNavigate();
  const exams     = state?.exams ?? (state?.exam ? [state.exam] : []);

  /* Unconditional hook call to keep order stable */
  const firstExam        = exams[0];
  const formatted        = useFormatted(firstExam);
  const firstExamStatus  = firstExam ? getStatus(firstExam, formatted.dateTime) : '';

  /* Guard: if user refreshed directly on /test-page with no state */
  useEffect(() => { if (!exams.length) navigate(-1); }, [exams, navigate]);

  /* ───────── Multiple exams screen ───────── */
  if (exams.length > 1) {
    return (
      <Layout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
        <h2 className="text-[22px] md:text-2xl font-semibold text-[#002855] mb-4">
          Choose Your Exam
        </h2>

        {/* Mobile / tablet cards */}
        <div className="space-y-4 [@media(min-width:486px)]:hidden">
          {exams.map((exam, i) => (
            <ExamCard key={i} exam={exam} nav={navigate} />
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden [@media(min-width:486px)]:block bg-white rounded-xl shadow-md overflow-x-auto">
          <table className="w-full text-left">
            <TableHead />
            <tbody className="text-black text-md divide-y divide-gray-200">
              {exams.map(exam => (
                <ExamRow key={exam._id} exam={exam} nav={navigate} />
              ))}
            </tbody>
          </table>
        </div>
      </Layout>
    );
  }

  /* ───────── Single exam screen ───────── */
  const exam     = firstExam;
  const examDate = formatted.examDate;
  const examTime = formatted.examTime;
  const status   = firstExamStatus;

  return (
    <Layout sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar}>
      <h2 className="text-[22px] md:text-2xl font-semibold text-[#002855] mb-4">
        Exam Details
      </h2>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Card view */}
        <div className="space-y-4 [@media(min-width:486px)]:hidden px-4 py-4">
          <DetailRow label="Subject:"   value={exam.subjectName} />
          <DetailRow label="Exam No:"   value={exam.examNo} />
          <DetailRow label="Semester:"  value={toOrdinal(exam.semester)} />
          <DetailRow label="Date:"      value={examDate || '—'} />
          <DetailRow label="Time:"      value={examTime || '—'} />
          <DetailRow label="Duration:"  value={`${exam.duration} minutes`} />
          <DetailRow label="Status:"    value={status} />
          <div className="text-right pt-2">
            <ActionButton exam={exam} nav={navigate} />
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden [@media(min-width:486px)]:block overflow-x-auto">
          <table className="w-full text-left">
            <TableHead />
            <tbody className="text-black text-md divide-y divide-gray-200">
              <ExamRow exam={exam} nav={navigate} />
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

/* ───────── Layout with working sidebar ───────── */
const Layout = ({ children, sidebarOpen, toggleSidebar }) => (
  <div className="min-h-screen flex bg-[#f9f9f9] overflow-x-hidden">
    <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
    <div className="flex-1 flex flex-col [@media(min-width:845px)]:ml-64">
      <SHeader toggleSidebar={toggleSidebar} />
      <div className="px-2 md:px-4 lg:px-16 py-4 md:py-8">{children}</div>
    </div>
  </div>
);

/* ───────── Tiny components ───────── */

const TableHead = () => (
  <thead className="bg-[#002855] text-white text-sm font-light">
    <tr>
      <th className="p-3 rounded-tl-xl">Subject</th>
      <th className="p-3">Exam No</th>
      <th className="p-3">Semester</th>
      <th className="p-3">Date</th>
      <th className="p-3">Time</th>
      <th className="p-3">Duration</th>
      <th className="p-3">Status</th>
      <th className="p-3 rounded-tr-xl">Action</th>
    </tr>
  </thead>
);

function ExamCard({ exam, nav }) {
  const { examDate, examTime, dateTime } = useFormatted(exam);
  const status = getStatus(exam, dateTime);
  return (
    <div
      onClick={() => nav('/take-exam/test-page', { state: { exam } })}
      className="cursor-pointer bg-white rounded-xl shadow-md p-4 divide-y divide-gray-200"
    >
      <DetailRow label="Subject:"   value={exam.subjectName} />
      <DetailRow label="Exam No.:"  value={exam.examNo} />
      <DetailRow label="Semester:"  value={toOrdinal(exam.semester)} />
      <DetailRow label="Date:"      value={examDate || '—'} />
      <DetailRow label="Time:"      value={examTime || '—'} />
      <DetailRow label="Duration:"  value={`${exam.duration} minutes`} />
      <DetailRow label="Status:"    value={status} />
      <div className="text-right pt-2">
        <ActionButton exam={exam} nav={nav} />
      </div>
    </div>
  );
}

function ExamRow({ exam, nav }) {
  const { examDate, examTime, dateTime } = useFormatted(exam);
  const status = getStatus(exam, dateTime);
  return (
    <tr className="hover:bg-gray-50 cursor-pointer">
      <td className="p-3">{exam.subjectName}</td>
      <td className="p-3">{exam.examNo}</td>
      <td className="p-3">{toOrdinal(exam.semester)}</td>
      <td className="p-3">{examDate || '—'}</td>
      <td className="p-3">{examTime || '—'}</td>
      <td className="p-3">{exam.duration} minutes</td>
      <td className="p-3">{status}</td>
      <td className="p-3">
        <ActionButton exam={exam} nav={nav} />
      </td>
    </tr>
  );
}

const ActionButton = ({ exam, nav }) => (
  <button
    onClick={e => {
      e.stopPropagation();  
      const examId = exam._id || exam.examId;  // dono mē se jo mil jaye                            // stop event bubbling
      nav(
        exam.attempted
          ? `/view-answers/${exam.submissionId}`        // already attempted
          : `/give-exam/${examId}`                 // start test
      );
    }}
    className="bg-[#003366] text-white px-3 py-1 rounded hover:bg-blue-700 transition"
  >
    {exam.attempted ? 'View Answers' : 'Start Test'}
  </button>
);

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between py-2">
    <span className="font-semibold text-[#002855]">{label}</span>
    <span>{value}</span>
  </div>
);
