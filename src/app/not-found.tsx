'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200 select-none">404</h1>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-white text-black border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Go Back
          </button>
        </div>

        <div className="mt-12">
          <div className="w-16 h-1 bg-gray-300 mx-auto rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
