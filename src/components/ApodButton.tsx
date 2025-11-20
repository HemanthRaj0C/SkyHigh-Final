'use client';

import { useState } from 'react';
import Image from 'next/image';

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
      const response = await fetch('/api/apod');
      if (!response.ok) throw new Error('Failed to fetch APOD');
      
      const data = await response.json();
      setApodData(data);
      setShowModal(true);
    } catch (err) {
      setError('Failed to load Astronomy Picture of the Day');
      console.error('APOD error:', err);
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
        className="fixed top-4 left-1/2 -translate-x-1/2 z-20
                   bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700
                   text-white px-6 py-2.5 rounded-full
                   border border-white/20
                   transition-all duration-300
                   shadow-lg hover:shadow-xl hover:scale-105
                   flex items-center gap-2
                   backdrop-blur-sm
                   disabled:opacity-50 disabled:cursor-not-allowed"
        title="View Astronomy Picture of the Day"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="font-semibold">
          {loading ? 'Loading...' : 'APOD'}
        </span>
        <span className="text-xs opacity-80">NASA</span>
      </button>

      {/* Error Toast */}
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30
                        bg-red-500/90 backdrop-blur-md text-white px-6 py-3 rounded-xl
                        shadow-lg animate-fade-in">
          {error}
        </div>
      )}

      {/* APOD Modal */}
      {showModal && apodData && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="relative max-w-5xl w-full max-h-[90vh] bg-gray-900/95 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col lg:flex-row max-h-[90vh]">
              {/* Image Section */}
              <div className="lg:w-3/5 relative bg-black flex items-center justify-center p-4">
                {apodData.media_type === 'image' ? (
                  <div className="relative w-full h-[300px] lg:h-[600px]">
                    <Image
                      src={apodData.url}
                      alt={apodData.title}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : apodData.media_type === 'video' ? (
                  <iframe
                    src={apodData.url}
                    className="w-full h-[300px] lg:h-[600px]"
                    allowFullScreen
                  />
                ) : null}
              </div>

              {/* Content Section */}
              <div className="lg:w-2/5 p-6 overflow-y-auto">
                <div className="space-y-4">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-xs font-medium">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    NASA APOD
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-white">
                    {apodData.title}
                  </h2>

                  {/* Date */}
                  <p className="text-sm text-gray-400 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(apodData.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>

                  {/* Copyright */}
                  {apodData.copyright && (
                    <p className="text-xs text-gray-500">
                      © {apodData.copyright}
                    </p>
                  )}

                  {/* Description */}
                  <div className="text-gray-300 text-sm leading-relaxed space-y-2">
                    {apodData.explanation}
                  </div>

                  {/* HD Link */}
                  {apodData.hdurl && apodData.media_type === 'image' && (
                    <a
                      href={apodData.hdurl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      View HD Image
                    </a>
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
