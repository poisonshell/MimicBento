'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center px-4">
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-red-500 mb-4">Oops!</h1>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Something went wrong
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                An unexpected error occurred. Please try again.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => reset()}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="px-6 py-3 bg-white text-black border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
