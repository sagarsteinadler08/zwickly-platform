import '../frontend/src/index.css'

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Zwickly Local Merged - Ready to Run!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Lovable frontend + Local backend successfully merged
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">✅ Frontend</h3>
            <p className="text-gray-600">Lovable UI preserved unchanged in <code>/frontend/</code></p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">✅ Backend</h3>
            <p className="text-gray-600">Next.js API + Prisma + Postgres ready</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">✅ Database</h3>
            <p className="text-gray-600">Supabase data import script included</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🚀 Quick Start</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">1</span>
              <code className="text-gray-700">docker compose up -d</code>
            </div>
            <div className="flex items-center space-x-3">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">2</span>
              <code className="text-gray-700">npm install</code>
            </div>
            <div className="flex items-center space-x-3">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">3</span>
              <code className="text-gray-700">npx prisma generate</code>
            </div>
            <div className="flex items-center space-x-3">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">4</span>
              <code className="text-gray-700">npx prisma migrate dev --name init</code>
            </div>
            <div className="flex items-center space-x-3">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">5</span>
              <code className="text-gray-700">python3 scripts/import_supabase.py --dir supabase_export_20251028_150354</code>
            </div>
            <div className="flex items-center space-x-3">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">6</span>
              <code className="text-gray-700">npm run dev</code>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            📖 See <code>README.md</code> for detailed setup instructions
          </p>
        </div>
      </div>
    </div>
  )
}
