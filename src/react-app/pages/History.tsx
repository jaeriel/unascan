import { useState, useEffect } from 'react';
import { Calendar, Search, Filter, Leaf } from 'lucide-react';
import { ScanResult, DiseaseInfo } from '@/shared/types';

export default function History() {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDisease, setFilterDisease] = useState('all');

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      const response = await fetch('/api/scans');
      if (response.ok) {
        const data = await response.json();
        setScans(data.scans || []);
      }
    } catch (error) {
      console.error('Failed to fetch scans:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredScans = scans.filter(scan => {
    const matchesSearch = scan.scan_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scan.disease_detected?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterDisease === 'all' || scan.disease_detected === filterDisease;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Scan History
        </h1>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by location or disease..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterDisease}
              onChange={(e) => setFilterDisease(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors appearance-none"
            >
              <option value="all">All Diseases</option>
              <option value="healthy">Healthy</option>
              <option value="red_rot">Red Rot</option>
              <option value="smut">Smut Disease</option>
              <option value="rust">Rust Disease</option>
              <option value="mosaic">Mosaic Virus</option>
            </select>
          </div>
        </div>

        {/* Scan Results */}
        {filteredScans.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Leaf className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No scans found</h3>
            <p className="text-gray-600">
              {scans.length === 0 
                ? "Start scanning leaves to build your history"
                : "Try adjusting your search or filter criteria"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredScans.map((scan) => {
              const diseaseInfo = scan.disease_detected ? DiseaseInfo[scan.disease_detected as keyof typeof DiseaseInfo] : null;
              
              return (
                <div key={scan.id} className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-emerald-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          scan.disease_detected === 'healthy' 
                            ? 'bg-green-500' 
                            : diseaseInfo?.severity === 'high'
                              ? 'bg-red-500'
                              : 'bg-yellow-500'
                        }`}></div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {diseaseInfo?.name || 'Unknown'}
                        </h3>
                      </div>
                      
                      {scan.confidence_score && (
                        <p className="text-sm text-gray-600 mb-2">
                          Confidence: {Math.round(scan.confidence_score * 100)}%
                        </p>
                      )}
                      
                      {scan.scan_location && (
                        <p className="text-sm text-gray-600 mb-2">
                          Location: {scan.scan_location}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(scan.created_at)}
                      </div>
                    </div>
                  </div>

                  {scan.recommendations && (
                    <div className="bg-emerald-50 p-4 rounded-lg mb-4">
                      <h4 className="font-medium text-emerald-900 mb-2">Treatment Recommendation:</h4>
                      <p className="text-emerald-800 text-sm leading-relaxed">
                        {scan.recommendations}
                      </p>
                    </div>
                  )}

                  {scan.user_notes && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Notes:</h4>
                      <p className="text-gray-700 text-sm">
                        {scan.user_notes}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
