import { Link } from 'react-router';
import { Camera, Leaf, Shield, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="px-6 py-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 to-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <img src="/logo.png" alt="Logo" className="w-20 h-20" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            UnaScan
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            AI-powered sugarcane disease detection and treatment recommendations
          </p>
        </div>

        {/* Quick Scan Button */}
        <Link
          to="/scan"
          className="block w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white text-lg font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-center mb-8"
        >
          <img src="/logo.png" alt="Logo" className="w-6 h-6 inline mr-2" />
          Start Scanning
        </Link>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-emerald-100">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                <img src="/logo.png" alt="Logo" className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Instant Detection</h3>
            </div>
            <p className="text-gray-600">
              Get immediate AI-powered analysis of your sugarcane leaf health with confidence scores.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-emerald-100">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                <img src="/logo.png" alt="Logo" className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Treatment Plans</h3>
            </div>
            <p className="text-gray-600">
              Receive detailed treatment recommendations and prevention strategies for detected diseases.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-emerald-100">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                <img src="/logo.png" alt="Logo" className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Disease Database</h3>
            </div>
            <p className="text-gray-600">
              Access comprehensive information about common sugarcane diseases and their symptoms.
            </p>
          </div>
        </div>

        {/* Recent Scans Preview */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-emerald-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Link to="/history" className="text-emerald-600 font-medium">
              View All
            </Link>
          </div>
          <p className="text-gray-500 text-center py-8">
            No scans yet. Start by scanning your first leaf!
          </p>
        </div>
      </div>
    </div>
  );
}
