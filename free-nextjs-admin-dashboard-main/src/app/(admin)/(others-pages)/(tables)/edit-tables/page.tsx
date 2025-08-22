'use client';
import { useSearchParams } from 'next/navigation';
import MarksEditPage from "@/components/tables/MarksEdit";

export default function Page() {
  const searchParams = useSearchParams();
  
  // Get parameters from URL query string
  const session = searchParams.get('session') || "2025-26";
  const section = searchParams.get('section') || "A";
  const semester = searchParams.get('semester') || "5";
  const courseId = searchParams.get('courseId') || "689eda1793dd57cae6cc5f44";
  const classValue = searchParams.get('class') || "";
  const department = searchParams.get('department') || "";

  return (
    <div>
      <MarksEditPage 
        session={session}
        section={section}
        semester={semester}
        courseId={courseId}
        class={classValue}
        department={department}
      />
    </div>
  );
}