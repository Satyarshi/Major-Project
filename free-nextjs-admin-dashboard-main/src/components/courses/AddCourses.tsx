"use client"
import React, { useState,useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "../form/Label";
import apiClient from "@/lib/apiClient"; // Import your API client

const initialTargetLevels = [
  { level: 1, targetValue: "" },
  { level: 2, targetValue: "" },
  { level: 3, targetValue: "" },
];

const initialOutcomes = [
  { coNumber: "", description: "", minMarks: "" },
];

const classOptions = [
  { value: "", label: "Select Class" },
  { value: "B.Tech", label: "B.Tech" },
  { value: "B.Pharma", label: "B.Pharma" },
  { value: "MCA", label: "MCA" },
  { value: "MBA", label: "MBA" },
];

const departmentOptions = [
  { value: "", label: "Select Department" },
  { value: "Department of Computer Science", label: "Computer Science" },
  { value: "Department of Electrical Engineering", label: "Electrical Engineering" },
  { value: "Department of Information Technology", label: "Information Technology" },
  { value: "Department of Mechanical Engineering", label: "Mechanical Engineering" },
  { value: "Department of Civil Engineering", label: "Civil Engineering" },
  { value: "Department of Electronics and Communication", label: "Electronics and Communication" },
  { value: "Department of Chemical Engineering", label: "Chemical Engineering" },
  { value: "Department of Pharmacy", label: "Pharmacy" },
  { value: "Department of Management Studies", label: "Management Studies" },
  { value: "Department of Applied Sciences", label: "Applied Sciences" },
];


const Addcourse = () => {
  const [form, setForm] = useState({
    courseName: "",
    courseId: "", // Changed from courseCode to courseId to match backend
    session: "",
    semester: "",
    class: "",
    department: "",
    sections: "",
    targetLevels: initialTargetLevels,
    outcomes: initialOutcomes,
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (msg && msg.includes('successfully')) {
      const timer = setTimeout(() => {
        setMsg("");
      }, 5000); // 5 seconds

      return () => clearTimeout(timer);
    }
  }, [msg]);

  // Function to check if all fields are filled
  const isFormValid = () => {
    // Check basic form fields
    const basicFieldsValid = form.courseName && form.courseId && form.session && 
                            form.semester && form.class && form.department && form.sections;
    
    // Check if all target levels have values
    const targetLevelsValid = form.targetLevels.every(t => t.level && t.targetValue);
    
    // Check if all outcomes have values
    const outcomesValid = form.outcomes.every(o => o.coNumber && o.description && o.minMarks);
    
    return basicFieldsValid && targetLevelsValid && outcomesValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, sections: e.target.value });
  };

  const handleTargetLevelChange = (
    idx: number,
    field: "level" | "targetValue",
    value: string
  ) => {
    const updated = [...form.targetLevels];
    if (field === "level") {
      updated[idx].level = Number(value);
    } else if (field === "targetValue") {
      updated[idx].targetValue = value;
    }
    setForm({ ...form, targetLevels: updated });
  };

  const handleOutcomeChange = (
    idx: number,
    field: "coNumber" | "description" | "minMarks",
    value: string
  ) => {
    const updated = [...form.outcomes];
    updated[idx][field] = value;
    setForm({ ...form, outcomes: updated });
  };

  const addOutcome = () => {
    setForm({ ...form, outcomes: [...form.outcomes, { coNumber: "", description: "", minMarks: "" }] });
  };

  const removeOutcome = (idx: number) => {
    const updated = form.outcomes.filter((_, i) => i !== idx);
    setForm({ ...form, outcomes: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    
    try {
      // Transform the form data to match the expected backend format
      const requestData = {
        courseName: form.courseName,
        courseId: form.courseId, // Using courseId instead of courseCode
        session: form.session,
        semester: form.semester,
        department: form.department,
        class: form.class,
        sections: form.sections.split(",").map(s => s.trim()), // Convert to array
        targetLevels: form.targetLevels.map(t => ({
          level: Number(t.level),
          targetValue: Number(t.targetValue)
        })),
        outcomes: form.outcomes.map(o => ({
          coNumber: o.coNumber,
          description: o.description,
          minMarks: Number(o.minMarks)
        }))
      };

      // Use the apiClient which automatically handles cookies and token
      const response = await apiClient.post("/courses/create", requestData);
      
      if (response.status === 200 || response.status === 201) {
        setMsg("Course added successfully!");
        // Reset form to initial state
        setForm({
          courseName: "",
          courseId: "",
          session: "",
          semester: "",
          class: "",
          department: "",
          sections: "",
          targetLevels: initialTargetLevels,
          outcomes: initialOutcomes,
        });
      }
    } catch (error: any) {
      console.error("Error creating course:", error);
      
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || error.response.data?.error || "Error adding course";
        setMsg(errorMessage);
      } else if (error.request) {
        // Network error
        setMsg("Network error. Please check your connection.");
      } else {
        // Other error
        setMsg("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 dark:bg-gray-900 dark:min-h-screen">
      {/* Success/Error Messages - Moved to top */}
      {msg && (
        <ComponentCard title="" desc="" className={`mb-6 ${msg.includes('successfully')
          ? 'bg-green-50 border-green-200 dark:bg-green-900 dark:bg-opacity-20 dark:border-green-700'
          : 'bg-red-50 border-red-200 dark:bg-red-900 dark:bg-opacity-20 dark:border-red-700'
          }`}>
          <div className={`flex items-center gap-2 ${msg.includes('successfully')
            ? 'text-green-800 dark:text-green-400'
            : 'text-red-800 dark:text-red-400'
            }`}>
            {msg.includes('successfully') ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {msg}
          </div>
        </ComponentCard>
      )}

      {/* Header Section */}
      <ComponentCard
        title="Course Management"
        desc="Create and manage your courses with ease"
        className="mb-8"
      >
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Fill in all the required course details and outcomes to create a new course.
        </div>
      </ComponentCard>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Course Information Section */}
        <ComponentCard
          title="Course Information"
          desc="Basic course details and identification"
          icon={<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="courseName">Course Name</Label>
              <input
                name="courseName"
                value={form.courseName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all duration-200 hover:border-blue-400"
                placeholder="Enter course name"
                required
              />
            </div>
            <div>
              <Label htmlFor="courseId">Course ID</Label>
              <input
                name="courseId"
                value={form.courseId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all duration-200 hover:border-blue-400"
                placeholder="Enter course ID (e.g., CSE305)"
                required
              />
            </div>
            <div>
              <Label htmlFor="session">Session</Label>
              <input
                name="session"
                value={form.session}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all duration-200 hover:border-blue-400"
                placeholder="e.g., 2025-26"
                required
              />
            </div>
            <div>
              <Label htmlFor="semester">Semester</Label>
              <input
                name="semester"
                value={form.semester}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all duration-200 hover:border-blue-400"
                placeholder="Enter semester"
                required
              />
            </div>
            <div>
              <Label htmlFor="class">Class</Label>
              <select
                name="class"
                value={form.class}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all duration-200 hover:border-blue-400"
                required
              >
                {classOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all duration-200 hover:border-blue-400"
                required
              >
                {departmentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="sections">Sections</Label>
              <input
                name="sections"
                value={form.sections}
                onChange={handleSectionChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all duration-200 hover:border-blue-400"
                placeholder="A, B, C (comma separated)"
                required
              />
            </div>
          </div>
        </ComponentCard>

        {/* Target Levels Section */}
        <ComponentCard
          title="Target Levels"
          desc="Define achievement levels and their target values"
          icon={<svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>}
        >
          <div className="space-y-3">
            {form.targetLevels.map((t, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <Label htmlFor={`level-${idx}`}>Level</Label>
                  <input
                    id={`level-${idx}`}
                    type="number"
                    min={1}
                    value={t.level}
                    onChange={e => handleTargetLevelChange(idx, "level", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md  dark:bg-gray-700 dark:text-white"
                    placeholder="Level"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`target-${idx}`}>Target Value</Label>
                  <input
                    id={`target-${idx}`}
                    type="number"
                    value={t.targetValue}
                    onChange={e => handleTargetLevelChange(idx, "targetValue", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md  dark:bg-gray-700 dark:text-white"
                    placeholder="Target Value"
                    required
                  />
                </div>
              </div>
            ))}
          </div>
        </ComponentCard>

        {/* Course Outcomes Section */}
        <ComponentCard
          title="Course Outcomes"
          desc="Define the learning outcomes for this course"
          icon={<svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>}
        >
          <div className="space-y-4">
            {form.outcomes.map((o, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <Label htmlFor={`co-number-${idx}`}>CO Number</Label>
                  <input
                    id={`co-number-${idx}`}
                    value={o.coNumber}
                    onChange={e => handleOutcomeChange(idx, "coNumber", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md  dark:bg-gray-700 dark:text-white"
                    placeholder="CO1, CO2, etc."
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor={`description-${idx}`}>Description</Label>
                  <input
                    id={`description-${idx}`}
                    value={o.description}
                    onChange={e => handleOutcomeChange(idx, "description", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md  dark:bg-gray-700 dark:text-white"
                    placeholder="Describe the learning outcome"
                    required
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label htmlFor={`min-marks-${idx}`}>Min Marks</Label>
                    <input
                      id={`min-marks-${idx}`}
                      type="number"
                      value={o.minMarks}
                      onChange={e => handleOutcomeChange(idx, "minMarks", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md  dark:bg-gray-700 dark:text-white"
                      placeholder="Marks"
                      required
                    />
                  </div>
                  {form.outcomes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOutcome(idx)}
                      className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 dark:hover:bg-opacity-20 rounded-lg transition-all duration-200"
                      title="Remove outcome"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addOutcome}
              className="w-full py-3 border-2 border-dashed border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 dark:hover:bg-opacity-20 transition-all duration-200 font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Outcome
            </button>
          </div>
        </ComponentCard>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <button
            type="submit"
            className={`px-8 py-3 rounded-lg font-medium shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              !isFormValid() || loading
                ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white hover:shadow-xl transform hover:scale-105'
            }`}
            disabled={!isFormValid() || loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating Course...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Create Course
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Addcourse;