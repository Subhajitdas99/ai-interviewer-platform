"use client";

import ResumeUpload from "@/components/upload/ResumeUpload";

export default function UploadPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-black px-4 py-6 text-white md:px-6 md:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.12),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.06),transparent_18%)]" />

      <div className="relative mx-auto w-full max-w-6xl">
        <ResumeUpload />
      </div>
    </main>
  );
}
