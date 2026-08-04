import React, { useState, useRef } from 'react';
import PalmHandSVG from '../components/common/PalmHandSVG';
import { FiUpload, FiImage, FiX, FiCheck, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';

const PalmReadingPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);

  const palmLines = [
    { name: 'Life Line', color: '#f5a833', description: 'Represents vitality, physical energy, and major life changes.' },
    { name: 'Heart Line', color: '#ff6b6b', description: 'Indicates emotional relationships, cardiac health, and love style.' },
    { name: 'Head Line', color: '#8b3dff', description: 'Reflects intellectual tendencies, communication style, and learning approach.' },
    { name: 'Fate Line', color: '#51cf66', description: 'Shows career path, life direction, and destiny influences.' },
    { name: 'Sun Line', color: '#f5a833', description: 'Indicates fame, success, creativity, and public recognition.' },
  ];

  const fingerInfo = [
    { name: 'Thumb', meaning: 'Willpower & logic', emoji: '' },
    { name: 'Index', meaning: 'Ambition & authority', emoji: '' },
    { name: 'Middle', meaning: 'Responsibility & balance', emoji: '' },
    { name: 'Ring', meaning: 'Creativity & emotion', emoji: '' },
    { name: 'Pinky', meaning: 'Communication & relationships', emoji: '' },
  ];

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be less than 10MB');
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const simulateAnalysis = async () => {
    if (!selectedImage) {
      toast.error('Please upload a palm image first');
      return;
    }
    setAnalyzing(true);
    setTimeout(() => {
      setAnalysisResult({
        confidence: 87.5,
        palm_shape: 'Square',
        dominant_element: 'Earth',
        lines: {
          life_line: { presence: 'Strong', length: 'Medium', depth: 'Deep', clarity: 85 },
          heart_line: { presence: 'Strong', length: 'Long', depth: 'Moderate', clarity: 78 },
          head_line: { presence: 'Strong', length: 'Long', depth: 'Deep', clarity: 92 },
          fate_line: { presence: 'Moderate', length: 'Medium', depth: 'Light', clarity: 65 },
          sun_line: { presence: 'Faint', length: 'Short', depth: 'Light', clarity: 45 },
        },
        fingers: {
          thumb: 'Strong willpower, practical thinker',
          index: 'Natural leader, ambitious',
          middle: 'Responsible, disciplined',
          ring: 'Creative, emotionally expressive',
          pinky: 'Good communicator, social',
        },
      });
      setAnalyzing(false);
      toast.success('Palm analysis complete! 🔮');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-mystical text-3xl gradient-text font-bold mb-2">🖐️ Palm Reading</h1>
          <p className="text-gray-400">Upload your palm image for AI-powered analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Upload Section */}
          <div className="space-y-6">
            {/* Upload Area */}
            <div className="glass-card p-6">
              <h2 className="font-mystical text-lg gradient-text mb-4">Upload Palm Image</h2>

              {!previewUrl ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-primary-700/40 rounded-xl p-12 text-center hover:border-primary-500/60 transition-all"
                >
                  <FiUpload className="mx-auto text-primary-400 mb-4" size={48} />
                  <p className="text-gray-300 mb-2">Drag & drop your palm image here</p>
                  <p className="text-gray-500 text-sm mb-4">or click to browse</p>
                  <p className="text-gray-600 text-xs">Supports JPG, PNG, WEBP — Max 10MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Palm preview"
                    className="w-full rounded-xl border border-primary-700/30 max-h-80 object-contain bg-dark-800/50"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-3 right-3 p-2 rounded-full bg-red-900/80 text-red-300 hover:bg-red-800 transition-all"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              )}

              {selectedImage && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <FiImage className="text-primary-400" />
                    <span>{selectedImage.name}</span>
                    <span className="text-gray-600">({(selectedImage.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button
                    onClick={simulateAnalysis}
                    disabled={analyzing}
                    className="mystic-btn text-sm disabled:opacity-50"
                  >
                    {analyzing ? 'Analyzing...' : 'Analyze Palm 🔮'}
                  </button>
                </div>
              )}

              {analyzing && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">Analyzing palm features...</span>
                    <span className="text-primary-400">Processing</span>
                  </div>
                  <div className="w-full bg-dark-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary-600 to-mystic-500 h-2 rounded-full animate-pulse"
                      style={{ width: '70%' }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* 5-Finger Palm Reference */}
            <div className="glass-card p-6">
              <h2 className="font-mystical text-lg gradient-text mb-4">Palm Reference — 5 Fingers</h2>
              <div className="flex justify-center mb-4">
                <PalmHandSVG animate={true} showLabels={true} size={180} />
              </div>
              <div className="grid grid-cols-5 gap-2">
                {fingerInfo.map((finger, idx) => (
                  <div key={idx} className="text-center p-2 rounded-lg bg-dark-800/50 border border-primary-700/10">
                    <div className="text-lg mb-1">{finger.emoji}</div>
                    <p className="text-white text-xs font-medium">{finger.name}</p>
                    <p className="text-gray-500 text-[10px] mt-1">{finger.meaning}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Results & Info */}
          <div className="space-y-6">
            {/* Palm Lines Guide */}
            <div className="glass-card p-6">
              <h2 className="font-mystical text-lg gradient-text mb-4">Palm Lines Guide</h2>
              <div className="space-y-3">
                {palmLines.map((line, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 rounded-lg bg-dark-800/30">
                    <div
                      className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: line.color }}
                    ></div>
                    <div>
                      <h4 className="text-white text-sm font-medium">{line.name}</h4>
                      <p className="text-gray-400 text-xs mt-1">{line.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analysis Results */}
            {analysisResult && (
              <div className="glass-card p-6 border border-primary-600/30">
                <h2 className="font-mystical text-lg gradient-text mb-4">Analysis Results</h2>

                {/* Confidence Score */}
                <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-dark-800/50">
                  <span className="text-gray-300 text-sm">Confidence Score</span>
                  <span className="text-primary-400 font-bold text-lg">{analysisResult.confidence}%</span>
                </div>

                {/* Palm Shape & Element */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-dark-800/50 text-center">
                    <p className="text-gray-500 text-xs mb-1">Palm Shape</p>
                    <p className="text-white font-medium">{analysisResult.palm_shape}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-dark-800/50 text-center">
                    <p className="text-gray-500 text-xs mb-1">Dominant Element</p>
                    <p className="text-mystic-400 font-medium">{analysisResult.dominant_element}</p>
                  </div>
                </div>

                {/* Line Analysis */}
                <h3 className="text-white text-sm font-medium mb-3">Line Analysis</h3>
                <div className="space-y-3">
                  {Object.entries(analysisResult.lines).map(([key, line]) => {
                    const lineName = key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
                    const lineData = palmLines.find(
                      (pl) => pl.name.toLowerCase() === lineName.toLowerCase()
                    );
                    return (
                      <div key={key} className="p-3 rounded-lg bg-dark-800/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: lineData?.color || '#8b3dff' }}
                            ></div>
                            <span className="text-white text-sm font-medium">{lineName}</span>
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              line.presence === 'Strong'
                                ? 'bg-green-900/30 text-green-400'
                                : line.presence === 'Moderate'
                                ? 'bg-yellow-900/30 text-yellow-400'
                                : 'bg-red-900/30 text-red-400'
                            }`}
                          >
                            {line.presence}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span>Length: {line.length}</span>
                          <span>Depth: {line.depth}</span>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-500">Clarity</span>
                            <span className="text-primary-400">{line.clarity}%</span>
                          </div>
                          <div className="w-full bg-dark-800 rounded-full h-1.5">
                            <div
                              className="bg-gradient-to-r from-primary-600 to-primary-400 h-1.5 rounded-full"
                              style={{ width: `${line.clarity}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Finger Analysis */}
                <h3 className="text-white text-sm font-medium mb-3 mt-4">Finger Insights</h3>
                <div className="space-y-2">
                  {Object.entries(analysisResult.fingers).map(([key, insight]) => {
                    const fingerName = key.charAt(0).toUpperCase() + key.slice(1);
                    const fingerData = fingerInfo.find((f) => f.name.toLowerCase() === key);
                    return (
                      <div key={key} className="flex items-center space-x-3 p-2 rounded-lg bg-dark-800/30">
                        <span className="text-lg">{fingerData?.emoji || '🖐️'}</span>
                        <div>
                          <p className="text-white text-xs font-medium">{fingerName}</p>
                          <p className="text-gray-400 text-xs">{insight}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upload Tips */}
            <div className="glass-card p-6">
              <h2 className="font-mystical text-lg gradient-text mb-4">
                <FiInfo className="inline mr-2" />
                Upload Tips
              </h2>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start space-x-2">
                  <FiCheck className="text-green-400 mt-0.5 flex-shrink-0" size={14} />
                  <span>Open your dominant hand with all 5 fingers spread apart</span>
                </li>
                <li className="flex items-start space-x-2">
                  <FiCheck className="text-green-400 mt-0.5 flex-shrink-0" size={14} />
                  <span>Use good lighting — natural daylight works best</span>
                </li>
                <li className="flex items-start space-x-2">
                  <FiCheck className="text-green-400 mt-0.5 flex-shrink-0" size={14} />
                  <span>Keep the camera steady and focus on the palm center</span>
                </li>
                <li className="flex items-start space-x-2">
                  <FiCheck className="text-green-400 mt-0.5 flex-shrink-0" size={14} />
                  <span>Make sure all 5 fingers (Thumb, Index, Middle, Ring, Pinky) are visible</span>
                </li>
                <li className="flex items-start space-x-2">
                  <FiCheck className="text-green-400 mt-0.5 flex-shrink-0" size={14} />
                  <span>Avoid blurry or dark images</span>
                </li>
                <li className="flex items-start space-x-2">
                  <FiCheck className="text-green-400 mt-0.5 flex-shrink-0" size={14} />
                  <span>Remove rings and jewelry for better accuracy</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PalmReadingPage;