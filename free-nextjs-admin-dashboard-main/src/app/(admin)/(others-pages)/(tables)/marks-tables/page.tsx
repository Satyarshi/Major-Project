import React from 'react';
import MarksTable from "@/components/tables/MarksTable";

interface MarksTablePageProps {
  searchParams: {
    courseId?: string;
    courseName?: string;
    session?: string;
    semester?: string;
    section?: string;
    sections?: string;
    class?: string;
    department?: string;
  };
}

const MarksTablePage: React.FC<MarksTablePageProps> = ({ searchParams }) => {
  const { courseId, courseName, session, semester, section, class: courseClass, department } = searchParams;

  // If required parameters are missing, show error message
  if (!courseId || !courseName || !session || !semester || !section || !courseClass || !department) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">Invalid Parameters</div>
            <div className="text-gray-600 mb-4">Required course information is missing.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">

      {/* MarksTable Component */}
      <MarksTable
        session={session}
        section={section}
        semester={semester}
        courseId={courseId}
        class={courseClass}
        department={department}
      />
    </div>
  );
};

export default MarksTablePage;