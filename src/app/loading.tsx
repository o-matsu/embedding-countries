"use client"

import Globe from "@/components/globe"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="absolute ">
        <Globe active={null} data={null} />
      </div>
      <div className="animate-spin rounded-full h-96 w-96 border-b-2 border-white"></div>
    </div>
  );
}