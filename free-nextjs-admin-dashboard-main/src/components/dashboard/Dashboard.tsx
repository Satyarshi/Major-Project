"use client";

import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient'; // Adjust the import path as needed
import ComponentCard from "@/components/common/ComponentCard";


interface Course {
  _id: string;
  courseName: string;
  courseId: string;
  session: string;
  semester: string;
  department: string;
  class: string;
  sections: string[];
  outcomes: string[];
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

  const handleAddCourse = () => {
    // Navigate to add course page or open modal
    console.log('Add course clicked');
    // You can replace this with your navigation logic
    // router.push('/add-course') or setShowAddCourseModal(true)
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
    <div className="container mx-auto px-4 py-6">
      {/* Faculty Information Header */}
      <ComponentCard
        title={facultyData.name}
        // desc="Faculty Profile Information"
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
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
              You haven't added any courses yet. Start by adding your first course to get started.
            </p>
            <button
              onClick={handleAddCourse}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
            >
              Add Course
            </button>
          </div>
        ) : (
          // Courses list
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={handleAddCourse}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200 ease-in-out text-sm ml-auto"
              >
                Add New Course
              </button>
            </div>
            
            {facultyData.courses.map((course) => (
              <ComponentCard
                key={course._id}
                title={course.courseName}
                desc={`${course.courseId} • ${course.session}`}
                className="hover:shadow-md transition-shadow duration-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Course:</span>
                    <p className="text-gray-800 dark:text-white/90 mt-1">{course.class}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Semester:</span>
                    <p className="text-gray-800 dark:text-white/90 mt-1 ">{course.semester}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Sections:</span>
                    <p className="text-gray-800 dark:text-white/90 mt-1">{course.sections.join(', ')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Outcomes:</span>
                    <p className="text-gray-800 dark:text-white/90 mt-1">{course.outcomes.length} defined</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <span className="font-medium text-gray-600 dark:text-gray-300">Department:</span>
                  <p className="text-gray-800 dark:text-white/90 text-sm mt-1">{course.department}</p>
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