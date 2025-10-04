import { Leaf, Brain, Shield, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            About Unascan
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Empowering farmers with AI-driven sugarcane disease detection and treatment solutions.
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-emerald-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                <Brain className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">AI-Powered Detection</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Our advanced machine learning algorithms analyze sugarcane leaf images to detect common diseases 
              with high accuracy. The AI model has been trained on thousands of leaf samples to identify 
              patterns invisible to the human eye.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-emerald-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Expert Recommendations</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Each detection comes with detailed treatment recommendations based on agricultural best practices 
              and expert knowledge. Get specific guidance on fungicides, cultural practices, and prevention 
              strategies tailored to the detected condition.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-emerald-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Built for Farmers</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Designed with simplicity and accessibility in mind, SugarLeaf Doctor works offline and provides 
              instant results. Whether you're a small-scale farmer or managing large plantations, our tool 
              adapts to your needs.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-3">Supported Diseases</h2>
          <ul className="space-y-2">
            <li>• Red Rot - Early detection and treatment guidance</li>
            <li>• Smut Disease - Comprehensive management strategies</li>
            <li>• Rust Disease - Fungicide recommendations</li>
            <li>• Mosaic Virus - Vector control and prevention</li>
            <li>• Healthy Leaf Detection - Maintenance recommendations</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Unascan is continuously improving through machine learning and expert feedback.
          </p>
        </div>
      </div>
    </div>
  );
}
