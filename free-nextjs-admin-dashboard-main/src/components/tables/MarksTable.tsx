'use client';
import React, { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";

type BadgeColor = "success" | "warning" | "error" | "default";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  children: ReactNode;
  color?: BadgeColor;
  size?: BadgeSize;
}
interface TableProps {
  children: ReactNode;
  className?: string;
}
interface TableCellProps {
  children: ReactNode;
  className?: string;
  isHeader?: boolean;
}
interface COData {
  coNumber: string;
  marksObtained: number | null;
  isApplicable: boolean;
  minMarks: number;
}

interface Exam {
  examType: string;
  totalMarks: number;
  coMarks: COData[];
}

interface Course {
  _id: string;
  courseName: string;
  courseId: string;
}

interface Student {
  _id: string;
  name: string;
  rollNo: string;
}

interface Mark {
  _id: string;
  semester: string;
  course: Course;
  session: string;
  student: Student;
  section: string;
  exams: Exam[];
  class: string;
  department: string;
  universityMark: number;
}

interface MarksData {
  marks: Mark[];
}

interface MarksTableProps {
  session?: string;
  section?: string;
  semester?: string;
  courseId?: string;
  class?: string;
  department?: string;
  onEditMarks?: (params: {
    session: string;
    section: string;
    semester: string;
    courseId: string;
    class: string;
    department: string;
  }) => void;
}

// Note: Token handling is now managed by the apiClient interceptors

// Badge component
const Badge = ({ children, color = "default", size = "md" }: BadgeProps) => {
  const colorClasses: Record<BadgeColor, string> = {
    success: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
    error: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
    default: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
  };

  const sizeClasses: Record<BadgeSize, string> = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm"
  };

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${colorClasses[color]} ${sizeClasses[size]}`}>
      {children}
    </span>
  );
};

// Table components
const Table = ({ children, className = "" }: TableProps) => (
  <table className={`w-full ${className}`}>
    {children}
  </table>
);

const TableHeader = ({ children, className = "" }: TableProps) => (
  <thead className={className}>
    {children}
  </thead>
);

const TableBody = ({ children, className = "" }: TableProps) => (
  <tbody className={className}>
    {children}
  </tbody>
);

const TableRow = ({ children, className = "" }: TableProps) => (
  <tr className={className}>
    {children}
  </tr>
);

const TableCell = ({ children, className = "", isHeader = false }: TableCellProps) => {
  const Tag = isHeader ? 'th' : 'td';
  return (
    <Tag className={className}>
      {children}
    </Tag>
  );
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600 dark:text-gray-400">Loading marks data...</span>
  </div>
);

// Error Component
const ErrorMessage = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error Loading Data</h3>
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  </div>
);

export default function MarksTable({
  session = "2025-26",
  section = "A",
  semester = "5",
  courseId = "689eda1793dd57cae6cc5f44",
  class: propClass,
  department: propDepartment,
  onEditMarks
}: MarksTableProps) {
  const [marksData, setMarksData] = useState<MarksData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExamType, setSelectedExamType] = useState<string>("preCT");
  
  const router = useRouter();

  const examTypes: string[] = ["preCT", "CT1", "CT2", "PUE", "UE"];
  const coNumbers: string[] = ["CO1", "CO2", "CO3", "CO4", "CO5"];

  // Handle Edit Marks click
  const handleEditMarks = () => {
    // Get class and department from either props or loaded data
    const classValue = propClass || marksData?.marks?.[0]?.class || "";
    const departmentValue = propDepartment || marksData?.marks?.[0]?.department || "";
    
    const params = {
      session,
      section,
      semester,
      courseId,
      class: classValue,
      department: departmentValue,
    };
    
    if (onEditMarks) {
      // If parent component provided a callback
      onEditMarks(params);
    } else {
      // Default behavior - navigate to edit page (adjust route as needed)
      // You can modify this route based on your routing structure
      const queryParams = new URLSearchParams({
        session,
        section,
        semester,
        courseId,
        class: classValue,
        department: departmentValue,
      });
      router.push(`/edit-tables?${queryParams.toString()}`);
    }
  };

  // API call function
  const fetchMarksData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/marks', {
        params: {
          session,
          section,
          semester,
          courseId
        }
      });

      if (response.data && response.data.marks) {
        setMarksData(response.data);
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err: any) {
      console.error("Error fetching marks data:", err);

      if (err.response?.status === 401) {
        // This will be handled by the apiClient interceptor
        setError("Authentication failed. You will be redirected to login.");
      } else if (err.response?.status === 404) {
        setError("No marks data found for the specified criteria.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to load marks data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when parameters change
  useEffect(() => {
    fetchMarksData();
  }, [session, section, semester, courseId]);

  // Get current exam data for selected exam type
  const getCurrentExamData = (student: Mark, examType: string): Exam | null => {
    return student.exams?.find((exam: Exam) => exam.examType === examType) || null;
  };

  const getCoBackgroundColor = (status: "pass" | "fail" | "na"): string => {
    switch (status) {
      case "pass":
        return "bg-green-100 dark:bg-green-900/20";
      case "fail":
        return "bg-red-100 dark:bg-red-900/20";
      case "na":
        return "bg-orange-100 dark:bg-orange-900/30";
      default:
        return "";
    }
  };

  // Get minimum marks for a CO
  const getCoMinMarks = (coNumber: string): number | "NA" => {
    if (!marksData?.marks?.[0]) return "NA";

    const firstStudentExam = marksData.marks[0]?.exams?.find(exam => exam.examType === selectedExamType);
    if (!firstStudentExam) return "NA";

    const coMark = firstStudentExam.coMarks?.find(co => co.coNumber === coNumber);
    return coMark?.minMarks || "NA";
  };

  // Get CO data
  const getCoData = (examData: Exam | null, coNumber: string): { marks: number | "NA"; status: "pass" | "fail" | "na" } => {
    if (!examData) return { marks: "NA", status: "na" };
    const coMark = examData.coMarks?.find(co => co.coNumber === coNumber);
    if (!coMark || !coMark.isApplicable || coMark.marksObtained === null) {
      return { marks: "NA", status: "na" };
    }
    const minMarks = coMark.minMarks || 0;
    const obtained = coMark.marksObtained;
    const status = obtained >= minMarks ? "pass" : "fail";
    return { marks: obtained, status };
  };

  // Calculate total marks for current exam
  const getTotalMarks = (examData: Exam | null): number | string => {
    if (!examData) return "NA";
    return (
      examData.coMarks
        ?.filter((co: COData) => co.isApplicable && co.marksObtained !== null)
        ?.reduce((sum, co) => sum + Number(co.marksObtained ?? 0), 0) || 0
    );
  };

  // Calculate total minimum marks for current exam
  const getTotalMinMarks = (examData: Exam | null): number | string => {
    if (!examData) return "NA";
    return Math.round(examData.totalMarks * 0.33);
  };

  const getPassStatus = (examData: Exam | null): boolean | "NA" => {
    if (!examData) return "NA";
    const total = getTotalMarks(examData);
    const totalMin = getTotalMinMarks(examData);
    if (total === "NA" || totalMin === "NA") return "NA";
    return (total as number) >= (totalMin as number);
  };

  // Show loading spinner
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            onClick={handleEditMarks}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Marks
          </button>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            onClick={handleEditMarks}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Marks
          </button>
        </div>
        <ErrorMessage message={error} onRetry={fetchMarksData} />
      </div>
    );
  }

  // Show no data message
  if (!marksData?.marks || marksData.marks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            onClick={handleEditMarks}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Marks
          </button>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            No marks data found for the specified criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Edit Marks Button */}
      <div className="flex justify-end">
        <button
          onClick={handleEditMarks}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Marks
        </button>
      </div>

      {/* Course Info Header */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
          {marksData.marks[0]?.course.courseName} ({marksData.marks[0]?.course.courseId})
        </h2>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Semester {marksData.marks[0]?.semester} • Section {marksData.marks[0]?.section} • Session {marksData.marks[0]?.session}
          {marksData.marks[0]?.class && ` • Class ${marksData.marks[0].class}`}
          {marksData.marks[0]?.department && ` • ${marksData.marks[0].department}`}
        </p>
      </div>

      {/* Exam Type Selection */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 py-2">
          Select Exam Type:
        </span>
        {examTypes.map((examType) => (
          <button
            key={examType}
            onClick={() => setSelectedExamType(examType)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedExamType === examType
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
          >
            {examType}
          </button>
        ))}
      </div>

      {/* Marks Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1000px]">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-left text-xs dark:text-gray-400"
                  >
                    Student
                  </TableCell>
                  {coNumbers.map((coNumber) => (
                    <TableCell
                      key={coNumber}
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-center text-xs dark:text-gray-400"
                    >
                      <div>{coNumber}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 font-normal">
                        (Min: {getCoMinMarks(coNumber)})
                      </div>
                    </TableCell>
                  ))}
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-center text-xs dark:text-gray-400"
                  >
                    <div>Total Marks</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 font-normal">
                      (Min: 33% of Max)
                    </div>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-center text-xs dark:text-gray-400"
                  >
                    Status
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {marksData.marks.map((mark) => {
                  const examData = getCurrentExamData(mark, selectedExamType);
                  const totalMarks = getTotalMarks(examData);
                  const totalMinMarks = getTotalMinMarks(examData);
                  const passStatus = getPassStatus(examData);

                  return (
                    <TableRow key={mark._id}>
                      <TableCell className="px-5 py-4 text-left">
                        <div>
                          <div className="font-medium text-gray-800 text-sm dark:text-white/90">
                            {mark.student.name}
                          </div>
                          <div className="text-gray-500 text-xs dark:text-gray-400">
                            Roll No: {mark.student.rollNo}
                          </div>
                        </div>
                      </TableCell>

                      {/* CO Marks with Min Marks */}
                      {coNumbers.map((coNumber) => {
                        const coData = getCoData(examData, coNumber);
                        return (
                          <TableCell
                            key={coNumber}
                            className={`px-5 py-4 text-center text-sm ${getCoBackgroundColor(coData.status)}`}
                          >
                            <span className={`font-medium ${coData.marks === "NA"
                              ? "text-gray-600 dark:text-gray-400"
                              : "text-gray-800 dark:text-white"
                              }`}>
                              {coData.marks}
                            </span>
                          </TableCell>
                        );
                      })}

                      {/* Total Marks */}
                      <TableCell className="px-5 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-semibold text-gray-800 dark:text-white">
                            {totalMarks}
                            {examData && ` / ${examData.totalMarks}`}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Min: {totalMinMarks}
                          </span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="px-5 py-4 text-center">
                        {passStatus === "NA" ? (
                          <Badge color="default" size="sm">NA</Badge>
                        ) : passStatus ? (
                          <Badge color="success" size="sm">Pass</Badge>
                        ) : (
                          <Badge color="error" size="sm">Fail</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Exam Details */}
      {(() => {
        const currentExam = marksData.marks[0]?.exams?.find(exam => exam.examType === selectedExamType);
        return currentExam ? (
          <div className="bg-white dark:bg-gray-900/20 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              {selectedExamType} Exam Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total Marks: </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{currentExam.totalMarks}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Applicable COs: </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {currentExam.coMarks?.filter(co => co.isApplicable).map(co => co.coNumber).join(", ")}
                </span>
              </div>
            </div>

            {/* CO-wise minimum marks breakdown */}
            <div className="mt-3">
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">CO-wise Minimum Marks:</h4>
              <div className="flex flex-wrap gap-2">
                {currentExam.coMarks
                  ?.filter(co => co.isApplicable)
                  ?.map(co => (
                    <div key={co.coNumber} className="bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded text-xs">
                      <span className="text-blue-700 dark:text-blue-300 font-medium">{co.coNumber}: </span>
                      <span className="text-blue-600 dark:text-blue-400">{co.minMarks} marks</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              No data available for {selectedExamType} exam.
            </p>
          </div>
        );
      })()}
    </div>
  );
}