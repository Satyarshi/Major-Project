"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient'; // Adjust the import path as needed
import ComponentCard from "@/components/common/ComponentCard";

interface Course {
  _id: string;
  courseName: string;
  courseId: string;
  courseCode: string;
  session: string;
  semester: string;
  department: string;
  class: string;
  sections: string[];
  outcomes: {
    coNumber: string;
    description: string;
    minMarks: number;
    _id: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface Dashboard {
  _id: string;
  session: string;
  name: string;
  facultyId: string;
  email: string;
  courses: Course[];
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [facultyData, setFacultyData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFacultyProfile = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/faculty/profile');
        setFacultyData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch faculty profile');
        console.error('Error fetching faculty profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyProfile();
  }, []);

  const handleViewMarks = (course: Course, section: string) => {
    // Navigate to marks table page with query parameters
    const queryParams = new URLSearchParams({
      courseId: course._id,
      courseName: course.courseName,
      session: course.session,
      semester: course.semester,
      section: section,
      class: course.class,
      department: course.department,
    });
    
    router.push(`/marks-tables?${queryParams.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">Error</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!facultyData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-600">No data found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 dark:bg-gray-900 dark:h-screen">
      {/* Faculty Information Header */}
      <ComponentCard
        title={facultyData.name}
        className="mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <span className="font-semibold">Faculty ID:</span> {facultyData.facultyId}
          </div>
          <div>
            <span className="font-semibold">Email:</span> {facultyData.email}
          </div>
          <div>
            <span className="font-semibold">Session:</span> {facultyData.session}
          </div>
        </div>
      </ComponentCard>

      {/* Courses Section */}
      <ComponentCard
        title="My Courses"
        desc={facultyData.courses.length === 0 ? "No courses found" : `${facultyData.courses.length} course${facultyData.courses.length !== 1 ? 's' : ''} assigned`}
      >
        {facultyData.courses.length === 0 ? (
          // Empty state - No courses
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-2">No courses added</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
              You haven't added any courses yet. Please contact your administrator to get courses assigned.
            </p>
          </div>
        ) : (
          // Courses list
          <div className="space-y-4">
            {facultyData.courses.map((course) => (
              <ComponentCard
                key={course._id}
                title={course.courseName}
                desc={`${course.courseId} • ${course.session}`}
                className="hover:shadow-md transition-shadow duration-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Course:</span>
                    <p className="text-gray-800 dark:text-white/90 mt-1">{course.class}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Semester:</span>
                    <p className="text-gray-800 dark:text-white/90 mt-1">{course.semester}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Sections:</span>
                    <p className="text-gray-800 dark:text-white/90 mt-1">{course.sections.join(', ')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Outcomes:</span>
                    <p className="text-gray-800 dark:text-white/90 mt-1">{course.outcomes.length}</p>
                  </div>
                </div>
                
                <div className="pb-4 border-b border-gray-100 dark:border-gray-700 mb-4">
                  <span className="font-medium text-gray-600 dark:text-gray-300">Department:</span>
                  <p className="text-gray-800 dark:text-white/90 text-sm mt-1">{course.department}</p>
                </div>

                {/* View Marks Buttons - One for each section */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-2">
                    View Marks:
                  </span>
                  {course.sections.map((section) => (
                    <button
                      key={section}
                      onClick={() => handleViewMarks(course, section)}
                      className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-medium py-2 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 flex items-center"
                    >
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      Section {section}
                    </button>
                  ))}
                </div>
              </ComponentCard>
            ))}
          </div>
        )}
      </ComponentCard>
    </div>
  );
};

export default Dashboard;