"use client";

import { useState } from "react";
import Image from "next/image";

interface ApodData {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: string;
  date: string;
  copyright?: string;
}

export default function ApodButton() {
  const [showModal, setShowModal] = useState(false);
  const [apodData, setApodData] = useState<ApodData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApod = async () => {
    if (apodData) {
      setShowModal(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/apod");
      if (!response.ok) throw new Error("Failed to fetch APOD");

      const data = await response.json();
      setApodData(data);
      setShowModal(true);
    } catch (err) {
      setError("Failed to load Astronomy Picture of the Day");
      console.error("APOD error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* APOD Button */}
      <button
        onClick={fetchApod}
        disabled={loading}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-20 group
          bg-black/40 hover:bg-black/60 backdrop-blur-md
          text-white/90 hover:text-white px-5 py-2 rounded-full
          border border-white/10 hover:border-white/30
          transition-all duration-300 ease-out
          shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.3)]
          flex items-center gap-3
          disabled:opacity-50 disabled:cursor-not-allowed"
        title="Astronomy Picture of the Day"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-purple-500/50 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <svg
            className="w-5 h-5 relative z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <span className="text-sm font-medium tracking-wide">
          {loading ? "Loading..." : "APOD"}
        </span>
      </button>

      {/* Error Toast */}
      {error && (
        <div
          className="fixed top-24 left-1/2 -translate-x-1/2 z-30
          bg-red-500/10 backdrop-blur-xl border border-red-500/20
          text-red-200 px-6 py-3 rounded-full shadow-lg animate-fade-in
          flex items-center gap-3"
        >
          <svg
            className="w-5 h-5 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* APOD Modal */}
      {showModal && apodData && (
        <div
          // FIX: Changed from fixed 'p-10' to responsive 'p-4 md:p-8'
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8
            bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-6xl max-h-[85vh] bg-[#0a0a0a]
              rounded-3xl overflow-hidden border border-white/10 shadow-2xl
              flex flex-col lg:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full
                bg-black/50 text-white/70 hover:text-white hover:bg-white/10
                transition-all duration-200 backdrop-blur-sm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Image Section */}
            <div
              className="lg:w-3/5 relative bg-black flex items-center justify-center
              min-h-[300px] lg:min-h-full group"
            >
              {apodData.media_type === "image" ? (
                <div className="relative w-full h-full min-h-[300px] lg:h-auto">
                  <Image
                    src={apodData.url}
                    alt={apodData.title}
                    fill
                    className="object-contain transition-transform duration-700 group-hover:scale-105"
                    unoptimized
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent
                    opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                </div>
              ) : apodData.media_type === "video" ? (
                <iframe
                  src={apodData.url}
                  className="w-full h-full min-h-[300px]"
                  allowFullScreen
                />
              ) : null}
            </div>

            {/* Content Section */}
            <div className="lg:w-2/5 flex flex-col bg-[#0a0a0a]">
              {/* FIX: Changed from 'p-8' to 'p-6 lg:p-8' for better mobile spacing */}
              <div className="p-6 lg:p-8 overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase
                        bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      >
                        NASA APOD
                      </span>
                      <span className="text-xs font-medium text-gray-500 tracking-wide">
                        {new Date(apodData.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-light text-white leading-tight tracking-tight">
                      {apodData.title}
                    </h2>

                    {apodData.copyright && (
                      <p className="text-xs text-gray-500 font-mono">
                        Captured by {apodData.copyright}
                      </p>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />

                  {/* Description */}
                  <div className="text-gray-300 text-sm leading-7 font-light tracking-wide">
                    {apodData.explanation}
                  </div>

                  {/* Actions */}
                  {apodData.hdurl && apodData.media_type === "image" && (
                    <div className="pt-4">
                      <a
                        href={apodData.hdurl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                          bg-white/5 hover:bg-white/10 border border-white/10
                          text-sm font-medium text-white transition-all duration-200 group"
                      >
                        <span>View High Resolution</span>
                        <svg
                          className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}