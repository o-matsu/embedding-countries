"use client"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
    </div>
  );
}