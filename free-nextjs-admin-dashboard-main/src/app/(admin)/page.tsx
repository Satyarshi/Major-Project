import type { Metadata } from "next";
import React from "react";
import Dashboard from "@/components/dashboard/Dashboard";

export const metadata: Metadata = {
  title: "Faculty Profile | Dashboard",
  description: "Faculty profile and course management",
};

export default function Faculty() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Dashboard />
    </div>
  );
}