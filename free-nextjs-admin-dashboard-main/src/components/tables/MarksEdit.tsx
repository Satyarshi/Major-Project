'use client';
import React, { useState, useEffect, ReactNode } from "react";
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
  marksObtained: number | string | null;
  minMarks: number;
}

interface ExamData {
  examType: string;
  totalMarks: number;
  coMarks: COData[];
}

interface StudentData {
  rollNo: string;
  name?: string;
  exams: ExamData[];
  universityMark: number;
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
  exams: ExamData[];
  universityMark: number;
}

interface MarksData {
  marks: Mark[];
}

interface MarksEditPageProps {
  session?: string;
  section?: string;
  semester?: string;
  courseId?: string;
  class?: string;
  department?: string;
}

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

// Updated component function signature
export default function MarksEditPage({
  session = "2025-26",
  section = "A",
  semester = "5",
  courseId = "689eda1793dd57cae6cc5f44",
  class: className,  // Rename 'class' to 'className' since 'class' is a reserved word
  department
}: MarksEditPageProps) {
  const [marksData, setMarksData] = useState<MarksData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExamType, setSelectedExamType] = useState<string>("preCT");
  const [editableData, setEditableData] = useState<StudentData[]>([]);
  const [originalData, setOriginalData] = useState<StudentData[]>([]);
  const [changedStudents, setChangedStudents] = useState<Set<string>>(new Set());
  const [examConfig, setExamConfig] = useState<{ [key: string]: { totalMarks: number; coNumbers: string[]; minMarks: { [key: string]: number } } }>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const examTypes: string[] = ["preCT", "CT1", "CT2", "PUE", "UE"];
  const allCoNumbers: string[] = ["CO1", "CO2", "CO3", "CO4", "CO5"];


  // API call function to fetch existing data
  
// Updated fetchMarksData function
const fetchMarksData = async () => {
  try {
    setLoading(true);
    setError(null);

    // First, always fetch all students
    const studentsResponse = await apiClient.post('/students/fetch', {
      session,
      semester,
      section, 
      courseId,
      class: className,
      department
    });
    const allStudents = studentsResponse.data?.students || [];

    // Then try to fetch existing marks
    try {
      const marksResponse = await apiClient.get('/marks', {
        params: {
          session,
          section,
          semester,
          courseId,
          class: className,
          department
        }
      });

      if (marksResponse.data && marksResponse.data.marks) {
        setMarksData(marksResponse.data);
        // Merge all students with existing marks data
        initializeEditableDataWithAllStudents(allStudents, marksResponse.data.marks);
      } else {
        // Initialize with all students but empty marks
        initializeWithAllStudents(allStudents);
      }
    } catch (marksErr: any) {
      console.log("No existing marks found, initializing with all students");
      // Initialize with all students but empty marks
      initializeWithAllStudents(allStudents);
    }

  } catch (err: any) {
    console.error("Error fetching data:", err);
    handleApiError(err);
  } finally {
    setLoading(false);
  }
};

  const handleApiError = (err: any) => {
    if (err.response?.status === 401) {
      setError("Authentication failed. You will be redirected to login.");
    } else if (err.response?.data?.message) {
      setError(err.response.data.message);
    } else if (err.message) {
      setError(err.message);
    } else {
      setError("Failed to load marks data. Please try again.");
    }
  };

  const initializeWithAllStudents = (students: any[]) => {
    const studentData: StudentData[] = students.map(student => ({
      rollNo: student.rollNo,
      name: student.name,
      exams: [],
      universityMark: 0
    }));

    setEditableData(studentData);
    setOriginalData(JSON.parse(JSON.stringify(studentData))); // Deep copy for comparison
    setChangedStudents(new Set());
  };

  const initializeEditableDataWithAllStudents = (allStudents: any[], existingMarks: Mark[]) => {
    // Create a map of existing marks by rollNo for quick lookup
    const existingMarksMap = new Map();
    existingMarks.forEach(mark => {
      existingMarksMap.set(mark.student.rollNo, mark);
    });

    // Create student data for all students, merging with existing marks if available
    const studentData: StudentData[] = allStudents.map(student => {
      const existingMark = existingMarksMap.get(student.rollNo);
      
      return {
        rollNo: student.rollNo,
        name: student.name,
        exams: existingMark?.exams || [],
        universityMark: existingMark?.universityMark || 0
      };
    });

    setEditableData(studentData);
    setOriginalData(JSON.parse(JSON.stringify(studentData))); // Deep copy for comparison
    setChangedStudents(new Set());

    // Extract exam configurations from existing marks (if any)
    const config: { [key: string]: { totalMarks: number; coNumbers: string[]; minMarks: { [key: string]: number } } } = {};
    
    existingMarks.forEach(mark => {
      mark.exams?.forEach(exam => {
        if (!config[exam.examType]) {
          const coNumbers = exam.coMarks?.map(co => co.coNumber) || [];
          const minMarks: { [key: string]: number } = {};
          exam.coMarks?.forEach(co => {
            minMarks[co.coNumber] = co.minMarks;
          });
          
          config[exam.examType] = {
            totalMarks: exam.totalMarks,
            coNumbers,
            minMarks
          };
        }
      });
    });

    setExamConfig(config);
  };

  // Update exam configuration
  const updateExamConfig = (examType: string, totalMarks: number, coNumbers: string[], minMarks: { [key: string]: number }) => {
    setExamConfig(prev => ({
      ...prev,
      [examType]: { totalMarks, coNumbers, minMarks }
    }));

    // Update all students' exam data with new configuration
    setEditableData(prev => prev.map(student => {
      const existingExam = student.exams.find(exam => exam.examType === examType);
      const updatedCoMarks = coNumbers.map(coNumber => {
        const existingCo = existingExam?.coMarks.find(co => co.coNumber === coNumber);
        return {
          coNumber,
          marksObtained: existingCo?.marksObtained || null,
          minMarks: minMarks[coNumber] || 0
        };
      });

      if (existingExam) {
        return {
          ...student,
          exams: student.exams.map(exam => 
            exam.examType === examType 
              ? { ...exam, totalMarks, coMarks: updatedCoMarks }
              : exam
          )
        };
      } else {
        return {
          ...student,
          exams: [...student.exams, {
            examType,
            totalMarks,
            coMarks: updatedCoMarks
          }]
        };
      }
    }));
  };

  // Helper function to mark student as changed
  const markStudentAsChanged = (rollNo: string) => {
    setChangedStudents(prev => new Set(prev).add(rollNo));
  };

  // Update individual mark
  const updateMark = (rollNo: string, examType: string, coNumber: string, value: string | number | null) => {
    setEditableData(prev => prev.map(student => {
      if (student.rollNo !== rollNo) return student;

      const examIndex = student.exams.findIndex(exam => exam.examType === examType);
      if (examIndex === -1) {
        // Create new exam if it doesn't exist
        const config = examConfig[examType];
        if (!config) return student;

        const newExam: ExamData = {
          examType,
          totalMarks: config.totalMarks,
          coMarks: config.coNumbers.map(cn => ({
            coNumber: cn,
            marksObtained: cn === coNumber ? value : null,
            minMarks: config.minMarks[cn] || 0
          }))
        };

        markStudentAsChanged(rollNo);
        return {
          ...student,
          exams: [...student.exams, newExam]
        };
      }

      const updatedExams = [...student.exams];
      const exam = { ...updatedExams[examIndex] };
      const coIndex = exam.coMarks.findIndex(co => co.coNumber === coNumber);
      
      if (coIndex !== -1) {
        exam.coMarks = [...exam.coMarks];
        exam.coMarks[coIndex] = { ...exam.coMarks[coIndex], marksObtained: value };
        updatedExams[examIndex] = exam;
      }

      markStudentAsChanged(rollNo);
      return { ...student, exams: updatedExams };
    }));
  };

  // Update university mark
  const updateUniversityMark = (rollNo: string, value: number) => {
    setEditableData(prev => prev.map(student => {
      if (student.rollNo === rollNo) {
        markStudentAsChanged(rollNo);
        return { ...student, universityMark: value };
      }
      return student;
    }));
  };

  // Save marks (only changed students)
const saveMarks = async () => {
  try {
    setSaving(true);
    setSaveSuccess(false);
    setError(null);

    // Get only the students that have been modified
    const changedStudentsData = editableData.filter(student => 
      changedStudents.has(student.rollNo)
    );

    if (changedStudentsData.length === 0) {
      setError("No changes to save.");
      return;
    }

    const payload = {
      session,
      semester,
      section,
      courseId,
      class: className,
      department,
      marksData: changedStudentsData.map(student => ({
        rollNo: student.rollNo,
        exams: student.exams,
        universityMark: student.universityMark
      }))
    };

    console.log(`Saving marks for ${changedStudentsData.length} students:`, changedStudentsData.map(s => s.rollNo));
    
    await apiClient.post('/students/fillMarks', payload);
    
    // Update original data to reflect saved changes
    setOriginalData(JSON.parse(JSON.stringify(editableData)));
    setChangedStudents(new Set());
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  } catch (err: any) {
    console.error("Error saving marks:", err);
    handleApiError(err);
  } finally {
    setSaving(false);
  }
};

  useEffect(() => {
  fetchMarksData();
}, [session, section, semester, courseId, className, department]);

  // Get current exam data for a student
  const getCurrentExamData = (student: StudentData): ExamData | null => {
    return student.exams.find(exam => exam.examType === selectedExamType) || null;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Course Info Header */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
          Edit Marks - {marksData?.marks?.[0]?.course?.courseName || "Course"} 
          {marksData?.marks?.[0]?.course?.courseId && ` (${marksData.marks[0].course.courseId})`}
        </h2>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Semester {semester} • Section {section} • Session {session}
        </p>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage message={error} onRetry={fetchMarksData} />}

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-200">
            Marks saved successfully!
          </p>
        </div>
      )}

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

      {/* Exam Configuration */}
      <div className="bg-white dark:bg-gray-900/20 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">
          {selectedExamType} Exam Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Marks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Total Marks
            </label>
            <input
              type="number"
              value={examConfig[selectedExamType]?.totalMarks || 0}
              onChange={(e) => {
                const totalMarks = parseInt(e.target.value) || 0;
                const currentConfig = examConfig[selectedExamType];
                if (currentConfig) {
                  updateExamConfig(selectedExamType, totalMarks, currentConfig.coNumbers, currentConfig.minMarks);
                } else {
                  updateExamConfig(selectedExamType, totalMarks, ["CO1", "CO2"], { CO1: 0, CO2: 0 });
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Applicable COs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Applicable COs
            </label>
            <div className="flex flex-wrap gap-2">
              {allCoNumbers.map(coNumber => (
                <label key={coNumber} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={examConfig[selectedExamType]?.coNumbers.includes(coNumber) || false}
                    onChange={(e) => {
                      const currentConfig = examConfig[selectedExamType];
                      const currentCoNumbers = currentConfig?.coNumbers || [];
                      const currentMinMarks = currentConfig?.minMarks || {};
                      
                      let newCoNumbers: string[];
                      let newMinMarks = { ...currentMinMarks };
                      
                      if (e.target.checked) {
                        newCoNumbers = [...currentCoNumbers, coNumber];
                        if (!newMinMarks[coNumber]) {
                          newMinMarks[coNumber] = 0;
                        }
                      } else {
                        newCoNumbers = currentCoNumbers.filter(co => co !== coNumber);
                        delete newMinMarks[coNumber];
                      }
                      
                      updateExamConfig(
                        selectedExamType,
                        currentConfig?.totalMarks || 0,
                        newCoNumbers,
                        newMinMarks
                      );
                    }}
                    className="mr-1"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{coNumber}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* CO Minimum Marks */}
        {examConfig[selectedExamType]?.coNumbers && examConfig[selectedExamType].coNumbers.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              CO Minimum Marks
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {examConfig[selectedExamType].coNumbers.map(coNumber => (
                <div key={coNumber}>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {coNumber} Min Marks
                  </label>
                  <input
                    type="number"
                    value={examConfig[selectedExamType]?.minMarks[coNumber] || 0}
                    onChange={(e) => {
                      const minMarks = parseInt(e.target.value) || 0;
                      const currentConfig = examConfig[selectedExamType];
                      const newMinMarks = { ...currentConfig.minMarks, [coNumber]: minMarks };
                      updateExamConfig(selectedExamType, currentConfig.totalMarks, currentConfig.coNumbers, newMinMarks);
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Marks Editing Table */}
      {examConfig[selectedExamType] && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-left text-xs dark:text-gray-400"
                    >
                      Student
                    </TableCell>
                    {examConfig[selectedExamType].coNumbers.map(coNumber => (
                      <TableCell
                        key={coNumber}
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-center text-xs dark:text-gray-400"
                      >
                        <div>{coNumber}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 font-normal">
                          (Min: {examConfig[selectedExamType].minMarks[coNumber]})
                        </div>
                      </TableCell>
                    ))}
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-center text-xs dark:text-gray-400"
                    >
                      University Mark
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {editableData.map((student, index) => (
                    <TableRow key={student.rollNo}>
                      <TableCell className="px-5 py-4 text-left">
                        <div>
                          <div className="font-medium text-gray-800 text-sm dark:text-white/90">
                            {student.name || `Student ${index + 1}`}
                          </div>
                          <div className="text-gray-500 text-xs dark:text-gray-400">
                            Roll No: {student.rollNo}
                          </div>
                        </div>
                      </TableCell>

                      {/* CO Marks Input Fields */}
                      {examConfig[selectedExamType].coNumbers.map(coNumber => {
                        const examData = getCurrentExamData(student);
                        const coData = examData?.coMarks.find(co => co.coNumber === coNumber);
                        return (
                          <TableCell key={coNumber} className="px-5 py-4 text-center">
                            <input
                              type="text"
                              value={coData?.marksObtained || ""}
                              placeholder="Enter marks"
                              onChange={(e) => {
                                const value = e.target.value;
                                // Allow empty, "A", "NA", "N" (for typing NA), or valid numbers
                                if (value === "" || 
                                    value === "A" || 
                                    value === "NA" || 
                                    value === "N" ||
                                    value.match(/^\d*\.?\d*$/)) {
                                  updateMark(student.rollNo, selectedExamType, coNumber, value === "" ? null : value);
                                }
                              }}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            />
                          </TableCell>
                        );
                      })}

                      {/* University Mark */}
                      <TableCell className="px-5 py-4 text-center">
                        <input
                          type="number"
                          value={student.universityMark || ""}
                          placeholder="0"
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            updateUniversityMark(student.rollNo, value);
                          }}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end items-center">
        
        <button
          onClick={saveMarks}
          disabled={saving || changedStudents.size === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "Saving..." : `Save Changes${changedStudents.size > 0 ? ` (${changedStudents.size})` : ''}`}
        </button>
      </div>

      {/* Note */}
      <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Notes:</h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Use "NA" for not applicable marks</li>
          <li>• Use "A" for absent students</li>
          <li>• Enter numeric values for obtained marks</li>
          <li>• Configure exam settings before entering marks</li>
          <li>• All changes are saved when you click "Save Marks"</li>
        </ul>
      </div>
    </div>
  );
}