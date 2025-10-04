import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, RotateCcw, Check, AlertTriangle, Eye } from 'lucide-react';
import { DiseaseInfo, type DiseaseType } from '@/shared/types';
import { leafValidator, createImageElement } from '@/react-app/utils/leafValidator';

export default function Scan() {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isSugarcaneLeaf: boolean;
    confidence: number;
    message: string;
  } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    disease: DiseaseType;
    confidence: number;
  } | null>(null);
  const [showCamera, setShowCamera] = useState(true);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setShowCamera(false);
    }
  }, [webcamRef]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
        setShowCamera(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateLeaf = async () => {
    if (!capturedImage) return;
    
    setIsValidating(true);
    
    try {
      const imageElement = await createImageElement(capturedImage);
      const result = await leafValidator.validateLeaf(imageElement);
      setValidationResult(result);
    } catch (error) {
      console.error('Validation failed:', error);
      setValidationResult({
        isSugarcaneLeaf: false,
        confidence: 0,
        message: 'Failed to validate image. Please try again.'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const analyzeImage = async () => {
    if (!capturedImage || !validationResult?.isSugarcaneLeaf) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis with random disease detection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const diseases: DiseaseType[] = ['healthy', 'red_rot', 'smut', 'rust', 'mosaic'];
    const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];
    const confidence = Math.random() * 0.3 + 0.7; // 70-100% confidence
    
    setAnalysisResult({
      disease: randomDisease,
      confidence: confidence
    });
    setIsAnalyzing(false);
  };

  const resetScan = () => {
    setCapturedImage(null);
    setValidationResult(null);
    setAnalysisResult(null);
    setShowCamera(true);
  };

  const saveScan = async () => {
    if (!capturedImage || !analysisResult) return;
    
    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Upload to R2
      const formData = new FormData();
      formData.append('image', blob, `scan-${Date.now()}.jpg`);
      
      const uploadResponse = await fetch('/api/upload-scan', {
        method: 'POST',
        body: formData
      });
      
      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        const scanId = uploadData.scanId;
        
        // Update scan record with analysis results
        const updateResponse = await fetch(`/api/scans/${scanId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image_key: uploadData.imageKey,
            disease_detected: analysisResult.disease,
            confidence_score: analysisResult.confidence,
            recommendations: DiseaseInfo[analysisResult.disease].treatment,
            scan_location: 'Mobile Device',
            user_notes: ''
          })
        });
        
        if (updateResponse.ok) {
          alert('Scan saved successfully!');
          resetScan();
        } else {
          alert('Failed to save scan results. Please try again.');
        }
      }
    } catch (error) {
      console.error('Failed to save scan:', error);
      alert('Failed to save scan. Please try again.');
    }
  };

  return (
    <div className="px-6 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Scan Sugarcane Leaf
        </h1>

        {showCamera && !capturedImage && (
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="w-full aspect-square object-cover"
                videoConstraints={{
                  width: 400,
                  height: 400,
                  facingMode: 'environment'
                }}
              />
            </div>
            
            <div className="flex gap-4 mt-4">
              <button
                onClick={capture}
                className="flex-1 bg-emerald-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-emerald-600 transition-colors flex items-center justify-center"
              >
                <Camera className="w-5 h-5 mr-2" />
                Capture
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-600 transition-colors flex items-center justify-center"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {capturedImage && (
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-4">
              <img
                src={capturedImage}
                alt="Captured leaf"
                className="w-full aspect-square object-cover"
              />
            </div>

            {!validationResult ? (
              <div className="flex gap-4">
                <button
                  onClick={validateLeaf}
                  disabled={isValidating}
                  className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isValidating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Validating...
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5 mr-2" />
                      Validate Leaf
                    </>
                  )}
                </button>
                
                <button
                  onClick={resetScan}
                  className="bg-gray-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            ) : validationResult.isSugarcaneLeaf ? (
              !analysisResult ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-green-800 font-medium">Sugarcane leaf detected!</p>
                        <p className="text-green-700 text-sm">
                          Confidence: {Math.round(validationResult.confidence * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={analyzeImage}
                      disabled={isAnalyzing}
                      className="flex-1 bg-emerald-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Analyzing Disease...
                        </>
                      ) : (
                        'Analyze for Diseases'
                      )}
                    </button>
                    
                    <button
                      onClick={resetScan}
                      className="bg-gray-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="text-center mb-4">
                    <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${
                      analysisResult.disease === 'healthy' 
                        ? 'bg-green-100' 
                        : DiseaseInfo[analysisResult.disease].severity === 'high'
                          ? 'bg-red-100'
                          : 'bg-yellow-100'
                    }`}>
                      <Check className={`w-8 h-8 ${
                        analysisResult.disease === 'healthy' 
                          ? 'text-green-600' 
                          : DiseaseInfo[analysisResult.disease].severity === 'high'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                      }`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {DiseaseInfo[analysisResult.disease].name}
                    </h3>
                    <p className="text-gray-600">
                      Confidence: {Math.round(analysisResult.confidence * 100)}%
                    </p>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Treatment Recommendation:</h4>
                    <p className="text-gray-700 leading-relaxed">
                      {DiseaseInfo[analysisResult.disease].treatment}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={saveScan}
                      className="flex-1 bg-emerald-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
                    >
                      Save Result
                    </button>
                    <button
                      onClick={resetScan}
                      className="bg-gray-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-red-800 font-medium">Not a sugarcane leaf</p>
                      <p className="text-red-700 text-sm mt-1">
                        Confidence: {Math.round(validationResult.confidence * 100)}%
                      </p>
                      <p className="text-red-700 text-sm mt-2">
                        {validationResult.message}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-blue-800 font-medium mb-2">Tips for better scanning:</h4>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Ensure the leaf fills most of the frame</li>
                    <li>• Use good lighting conditions</li>
                    <li>• Hold the camera steady</li>
                    <li>• Capture a clear, single sugarcane leaf</li>
                  </ul>
                </div>
                
                <button
                  onClick={resetScan}
                  className="w-full bg-gray-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-600 transition-colors flex items-center justify-center"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
