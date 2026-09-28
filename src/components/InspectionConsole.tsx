import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Camera, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sliders, 
  ChevronRight, 
  RefreshCw, 
  Upload, 
  ShieldCheck, 
  Zap, 
  Filter, 
  Play, 
  Layers, 
  TrendingUp, 
  Gauge 
} from 'lucide-react';
import { 
  CameraChannel, 
  RotorSample, 
  SystemSettings 
} from '../types/inspection';
import { ROTOR_SAMPLES } from '../data/rotorSamples';
import { drawRotorOnCanvas, runVisionPipeline, VisionProcessResult } from '../utils/visionEngine';

interface InspectionConsoleProps {
  currentSample: RotorSample;
  onSelectSample: (sample: RotorSample) => void;
  onRecordInspection: (result: VisionProcessResult, sample: RotorSample) => void;
  settings: SystemSettings;
  setSettings: React.Dispatch<React.SetStateAction<SystemSettings>>;
  onTriggerPlc: (decision: 'PASS' | 'FAIL') => void;
  isAutoRunning?: boolean;
}

export const InspectionConsole: React.FC<InspectionConsoleProps> = ({
  currentSample,
  onSelectSample,
  onRecordInspection,
  settings,
  setSettings,
  onTriggerPlc,
  isAutoRunning,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeViewMode, setActiveViewMode] = useState<
    'composite' | 'heatmap' | 'sobel' | 'tensor64' | 'caliper'
  >('composite');

  const [specimenFilter, setSpecimenFilter] = useState<'ALL' | 'DEFECTIVE' | 'PASS'>('ALL');
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [visionResult, setVisionResult] = useState<VisionProcessResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [uploadVerdictMode, setUploadVerdictMode] = useState<'AUTO' | 'PASS' | 'FAIL'>('AUTO');

  // Render rotor onto the canvas and run vision pipeline
  const processImageAndDetect = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (isWebcamActive && videoRef.current && videoRef.current.readyState >= 2) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const res = runVisionPipeline(canvas, undefined, settings.confidenceThreshold, undefined, uploadVerdictMode);
      setVisionResult(res);
      return;
    }

    if (uploadedImageSrc) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const res = runVisionPipeline(canvas, undefined, settings.confidenceThreshold, uploadedImageSrc, uploadVerdictMode);
        setVisionResult(res);
      };
      img.src = uploadedImageSrc;
      return;
    }

    // Default: draw authentic procedural rotor specimen
    drawRotorOnCanvas(ctx, canvas.width, canvas.height, currentSample, settings.activeCamera);
    const res = runVisionPipeline(canvas, currentSample, settings.confidenceThreshold);
    setVisionResult(res);
  }, [currentSample, settings.activeCamera, settings.confidenceThreshold, isWebcamActive, uploadedImageSrc, uploadVerdictMode]);

  // Execute inspection cycle
  const handleTriggerInspection = useCallback(() => {
    setIsAnalyzing(true);
    processImageAndDetect();

    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const sampleToEvaluate = uploadedImageSrc || isWebcamActive ? undefined : currentSample;
        const res = runVisionPipeline(canvas, sampleToEvaluate, settings.confidenceThreshold, uploadedImageSrc ?? undefined, uploadVerdictMode);
        setVisionResult(res);
        onRecordInspection(res, currentSample);
        onTriggerPlc(res.decision);
      }
      setIsAnalyzing(false);
    }, 240);
  }, [currentSample, settings.confidenceThreshold, onRecordInspection, onTriggerPlc, processImageAndDetect, uploadedImageSrc, isWebcamActive, uploadVerdictMode]);

  useEffect(() => {
    processImageAndDetect();
  }, [processImageAndDetect]);

  // Auto-run loop if enabled from header
  useEffect(() => {
    if (!isAutoRunning) return;

    const interval = setInterval(() => {
      const currentIndex = ROTOR_SAMPLES.findIndex(s => s.id === currentSample.id);
      const nextIndex = (currentIndex + 1) % ROTOR_SAMPLES.length;
      setUploadedImageSrc(null);
      setIsWebcamActive(false);
      onSelectSample(ROTOR_SAMPLES[nextIndex]);
      handleTriggerInspection();
    }, 2200);

    return () => clearInterval(interval);
  }, [isAutoRunning, currentSample.id, onSelectSample, handleTriggerInspection]);

  // Handle Webcam toggle
  const toggleWebcam = async () => {
    if (isWebcamActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
      }
      setIsWebcamActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 640, facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsWebcamActive(true);
          setUploadedImageSrc(null);
        }
      } catch (err) {
        console.error('Webcam access error:', err);
      }
    }
  };

  // Handle image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImageSrc(event.target?.result as string);
        setIsWebcamActive(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Next sample helper
  const handleNextSample = () => {
    const currentIndex = ROTOR_SAMPLES.findIndex(s => s.id === currentSample.id);
    const nextIndex = (currentIndex + 1) % ROTOR_SAMPLES.length;
    setUploadedImageSrc(null);
    setIsWebcamActive(false);
    onSelectSample(ROTOR_SAMPLES[nextIndex]);
  };

  const isCurrentPass = visionResult?.decision === 'PASS';

  // Filtered samples
  const filteredSamples = ROTOR_SAMPLES.filter(s => {
    if (specimenFilter === 'DEFECTIVE') return s.intendedOutcome === 'FAIL';
    if (specimenFilter === 'PASS') return s.intendedOutcome === 'PASS';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Station Context Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-950 border border-cyan-800 rounded-lg text-cyan-400">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Station 1 · Machine Vision Optical Inspection Cell
            </h2>
            <p className="text-xs text-slate-400">
              GigE Monochromatic Camera + High-Frequency Strobe Diffuse Ring Illuminator
            </p>
          </div>
        </div>

        {/* Camera Selector Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(['CAM-01', 'CAM-02', 'CAM-03', 'CAM-04'] as CameraChannel[]).map((cam) => (
            <button
              key={cam}
              onClick={() => setSettings(prev => ({ ...prev, activeCamera: cam }))}
              className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                settings.activeCamera === cam
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cam}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Machine Vision Viewport on Left, Industrial Decision Engine on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Vision Viewport & Overlays */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col items-center justify-center min-h-[460px]">
            
            {/* View Mode Toolbar */}
            <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-700/80 text-xs">
                <button
                  onClick={() => setActiveViewMode('composite')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeViewMode === 'composite' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  AI Composite
                </button>
                <button
                  onClick={() => setActiveViewMode('heatmap')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeViewMode === 'heatmap' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Defect Heatmap
                </button>
                <button
                  onClick={() => setActiveViewMode('sobel')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeViewMode === 'sobel' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sobel Edges
                </button>
                <button
                  onClick={() => setActiveViewMode('tensor64')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeViewMode === 'tensor64' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  64×64 CNN Tensor
                </button>
                <button
                  onClick={() => setActiveViewMode('caliper')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeViewMode === 'caliper' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Metrology Calipers
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-700/80 text-xs font-mono text-slate-300">
                <button 
                  onClick={() => setZoomLevel(prev => Math.max(1, prev - 0.25))}
                  className="px-1.5 hover:text-white font-bold"
                >
                  -
                </button>
                <span>{Math.round(zoomLevel * 100)}%</span>
                <button 
                  onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.25))}
                  className="px-1.5 hover:text-white font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Hidden video element for live webcam */}
            <video ref={videoRef} className="hidden" playsInline muted />

            {/* Primary Interactive Canvas Container */}
            <div 
              className="relative w-full max-w-[520px] aspect-square flex items-center justify-center p-4 transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <canvas
                ref={canvasRef}
                width={520}
                height={520}
                className="w-full h-full rounded-lg shadow-inner object-contain bg-slate-950"
              />

              {/* View Overlay Mode 1: Sobel Edges Canvas Overlay */}
              {activeViewMode === 'sobel' && visionResult?.sobelCanvas && (
                <div className="absolute inset-4 pointer-events-none mix-blend-screen opacity-90">
                  <img 
                    src={visionResult.sobelCanvas.toDataURL()} 
                    alt="Sobel Filter" 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* View Overlay Mode 2: Grad-CAM Defect Heatmap Overlay */}
              {activeViewMode === 'heatmap' && (visionResult?.detectedDefects?.length ?? 0) > 0 && (
                <div className="absolute inset-4 pointer-events-none">
                  {visionResult?.detectedDefects.map(d => (
                    <div
                      key={d.id}
                      className="absolute rounded-full filter blur-md opacity-85"
                      style={{
                        left: `${d.x}%`,
                        top: `${d.y}%`,
                        width: `${Math.max(d.width, 18)}%`,
                        height: `${Math.max(d.height, 18)}%`,
                        background: 'radial-gradient(circle, rgba(239, 68, 68, 0.95) 0%, rgba(249, 115, 22, 0.6) 45%, rgba(234, 179, 8, 0.2) 75%, transparent 100%)',
                      }}
                    />
                  ))}
                </div>
              )}

              {/* View Overlay Mode 3: 64x64 CNN Input Tensor */}
              {activeViewMode === 'tensor64' && visionResult?.tensor64Data && (
                <div className="absolute inset-4 bg-slate-950/95 p-3 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-[11px] font-mono text-cyan-400 mb-2">
                    RESCALED 64×64×1 INPUT TENSOR (NORMALIZED [0..1])
                  </div>
                  <div className="grid grid-cols-16 gap-[1px] w-64 h-64 border border-cyan-500/40 p-1 bg-slate-900">
                    {visionResult.tensor64Data.slice(0, 16).map((row, rIdx) => (
                      <React.Fragment key={rIdx}>
                        {row.slice(0, 16).map((val, cIdx) => (
                          <div 
                            key={cIdx} 
                            className="w-full h-full"
                            style={{ 
                              backgroundColor: `rgb(${Math.floor(val * 255)}, ${Math.floor(val * 255)}, ${Math.floor(val * 255)})` 
                            }} 
                          />
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-2">
                    Batch Shape: (1, 64, 64, 1) · Conv2D (8 filters, 3×3, ReLU)
                  </div>
                </div>
              )}

              {/* View Overlay Mode 4: Precision Metrology Calipers */}
              {activeViewMode === 'caliper' && (
                <div className="absolute inset-4 pointer-events-none flex items-center justify-center">
                  <div className="absolute w-[88%] h-[88%] border-2 border-dashed border-cyan-400/70 rounded-full flex items-center justify-center">
                    <span className="absolute top-1 text-[11px] font-mono bg-slate-900/90 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">
                      OD: {currentSample.dimensions.outerDiameterMm.toFixed(2)} mm (Tol: ±0.5)
                    </span>
                  </div>
                  <div className="absolute w-[36%] h-[36%] border border-dashed border-amber-400/60 rounded-full flex items-center justify-center">
                    <span className="absolute -top-3 text-[10px] font-mono bg-slate-900/90 text-amber-400 px-1.5 py-0.2 rounded">
                      PCD: {currentSample.dimensions.boltCirclePcdMm.toFixed(2)} mm
                    </span>
                  </div>
                </div>
              )}

              {/* Real-time Bounding Box Highlights (Composite Mode) */}
              {(activeViewMode === 'composite' || activeViewMode === 'heatmap') && (visionResult?.detectedDefects ?? []).map(defect => (
                <div
                  key={defect.id}
                  className="absolute border-2 border-rose-500 bg-rose-500/15 pointer-events-none rounded transition-all animate-pulse"
                  style={{
                    left: `${defect.x}%`,
                    top: `${defect.y}%`,
                    width: `${defect.width}%`,
                    height: `${defect.height}%`,
                  }}
                >
                  <div className="absolute -top-6 left-0 bg-rose-600 text-white text-[10px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap shadow flex items-center gap-1">
                    <span>{defect.type}</span>
                    <span className="font-bold">{(defect.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}

              {/* Reticle Overlay Crosshairs */}
              <div className="absolute inset-4 pointer-events-none border border-slate-800/80 rounded-lg">
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-cyan-500/20" />
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-cyan-500/20" />
                <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-500">
                  FOV: 300×300 mm
                </div>
                <div className="absolute bottom-2 right-2 text-[10px] font-mono text-slate-500">
                  SCALE: 1.73 px/mm
                </div>
              </div>

            </div>

            {/* Quick Source Switch Bar */}
            <div className="w-full bg-slate-900/80 border-t border-slate-800 p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={toggleWebcam}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-medium ${
                    isWebcamActive 
                      ? 'bg-rose-600 text-white' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  {isWebcamActive ? 'Stop Webcam' : 'Use Webcam'}
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors font-medium"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Photo
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  onClick={() => {
                    setIsWebcamActive(false);
                    setUploadedImageSrc('/src/assets/images/clean_disc_brake_rotor_1790608741001.jpg');
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition-colors font-medium flex items-center gap-1.5 ${
                    uploadedImageSrc === '/src/assets/images/clean_disc_brake_rotor_1790608741001.jpg'
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                      : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  <img 
                    src="/src/assets/images/clean_disc_brake_rotor_1790608741001.jpg" 
                    alt="Good Rotor" 
                    className="w-4 h-4 rounded object-cover" 
                  />
                  <span>Test Good Photo</span>
                </button>

                <button
                  onClick={() => {
                    setIsWebcamActive(false);
                    setUploadedImageSrc('/src/assets/images/cracked_disc_brake_rotor_1790608779053.jpg');
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition-colors font-medium flex items-center gap-1.5 ${
                    uploadedImageSrc === '/src/assets/images/cracked_disc_brake_rotor_1790608779053.jpg'
                      ? 'bg-rose-950 border-rose-500 text-rose-200'
                      : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  <img 
                    src="/src/assets/images/cracked_disc_brake_rotor_1790608779053.jpg" 
                    alt="Cracked Rotor" 
                    className="w-4 h-4 rounded object-cover" 
                  />
                  <span>Test Cracked Photo</span>
                </button>

                {(uploadedImageSrc || isWebcamActive) && (
                  <div className="flex flex-wrap items-center gap-1.5 pl-2 border-l border-slate-700">
                    <span className="text-[11px] text-slate-400 font-medium">Evaluation:</span>
                    <button
                      onClick={() => setUploadVerdictMode('AUTO')}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                        uploadVerdictMode === 'AUTO' 
                          ? 'bg-cyan-600 text-white' 
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Auto Vision
                    </button>
                    <button
                      onClick={() => setUploadVerdictMode('PASS')}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                        uploadVerdictMode === 'PASS' 
                          ? 'bg-emerald-600 text-white font-bold' 
                          : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                      }`}
                    >
                      Mark PASS (OK)
                    </button>
                    <button
                      onClick={() => setUploadVerdictMode('FAIL')}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                        uploadVerdictMode === 'FAIL' 
                          ? 'bg-rose-600 text-white font-bold' 
                          : 'bg-slate-800 text-rose-400 hover:bg-slate-700'
                      }`}
                    >
                      Mark REJECT
                    </button>
                    <button
                      onClick={() => {
                        setUploadedImageSrc(null);
                        setIsWebcamActive(false);
                        setUploadVerdictMode('AUTO');
                        onSelectSample(currentSample);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-700 hover:bg-cyan-900 transition-colors font-medium ml-1"
                    >
                      Reset to Catalog Specimen
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                <span>Inference: <strong className="text-cyan-400">{visionResult?.inferenceTimeMs ?? 42}ms</strong></span>
                <span aria-hidden="true">·</span>
                <span>Threshold: <strong className="text-slate-200">{(settings.confidenceThreshold * 100).toFixed(0)}%</strong></span>
              </div>
            </div>

          </div>

          {/* Specimen Catalog Quick Selector with Filter Tabs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">Specimen Test Library</span>
                <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                  <button
                    onClick={() => setSpecimenFilter('ALL')}
                    className={`px-2 py-0.5 rounded transition-colors ${specimenFilter === 'ALL' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'}`}
                  >
                    All ({ROTOR_SAMPLES.length})
                  </button>
                  <button
                    onClick={() => setSpecimenFilter('DEFECTIVE')}
                    className={`px-2 py-0.5 rounded transition-colors ${specimenFilter === 'DEFECTIVE' ? 'bg-rose-950 text-rose-300 border border-rose-800 font-medium' : 'text-slate-400'}`}
                  >
                    Defective (7)
                  </button>
                  <button
                    onClick={() => setSpecimenFilter('PASS')}
                    className={`px-2 py-0.5 rounded transition-colors ${specimenFilter === 'PASS' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium' : 'text-slate-400'}`}
                  >
                    Non-Defective (2)
                  </button>
                </div>
              </div>

              <button
                onClick={handleNextSample}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors"
              >
                <span>Cycle Next Disc</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {filteredSamples.map((sample) => {
                const isSelected = currentSample.id === sample.id && !uploadedImageSrc && !isWebcamActive;
                const isPass = sample.intendedOutcome === 'PASS';
                return (
                  <button
                    key={sample.id}
                    onClick={() => {
                      setUploadedImageSrc(null);
                      setIsWebcamActive(false);
                      onSelectSample(sample);
                    }}
                    className={`p-2.5 rounded-lg text-left border transition-all text-xs flex flex-col justify-between ${
                      isSelected
                        ? isPass
                          ? 'bg-emerald-950/70 border-emerald-500 text-white ring-1 ring-emerald-500'
                          : 'bg-rose-950/70 border-rose-500 text-white ring-1 ring-rose-500'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] text-slate-400 truncate max-w-[85px]">
                        {sample.serialNumber}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isPass 
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80' 
                          : 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
                      }`}>
                        {isPass ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                    <span className="font-medium text-[11px] truncate leading-tight">
                      {sample.primaryDefect === 'OK' ? 'Nominal Spec' : sample.primaryDefect}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column (5 cols): Production Decision Engine & Quality Routing */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Module 7: Pass / Fail Production Decision Banner */}
          <div className={`p-5 rounded-xl border transition-all shadow-lg ${
            isCurrentPass
              ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-100 shadow-emerald-950/20'
              : 'bg-rose-950/50 border-rose-500/80 text-rose-100 shadow-rose-950/30'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                {isCurrentPass ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-8 h-8 text-rose-400 shrink-0" />
                )}
                <div>
                  <h3 className={`text-2xl font-black tracking-tight font-mono ${
                    isCurrentPass ? 'text-emerald-300' : 'text-rose-300'
                  }`}>
                    {isCurrentPass ? 'DECISION: PASS' : 'DECISION: REJECT'}
                  </h3>
                  <div className="text-xs text-slate-300 font-mono">
                    Status: <span className={`font-bold ${isCurrentPass ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isCurrentPass ? 'ACCEPTABLE PRODUCT' : 'DEFECTIVE PRODUCT'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confidence Score */}
              <div className="text-right font-mono">
                <div className="text-2xl font-bold text-white">
                  {((visionResult?.confidence ?? currentSample.confidence) * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-400">Confidence</div>
              </div>
            </div>

            {/* Defect Classification Summary */}
            <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Defect Classification:</span>
                <span className={`font-semibold font-mono ${
                  isCurrentPass ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {visionResult?.primaryDefect ?? currentSample.primaryDefect}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Part Serial ID:</span>
                <span className="font-mono text-slate-200">
                  {uploadedImageSrc ? 'UPLOADED_IMAGE_01' : currentSample.serialNumber}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Cycle Time:</span>
                <span className="font-mono text-cyan-400">
                  {visionResult?.inferenceTimeMs ?? 385} ms (42 ppm capable)
                </span>
              </div>
            </div>

            {/* Action Trigger Button */}
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={handleTriggerInspection}
                disabled={isAnalyzing}
                className="flex-1 py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] disabled:opacity-50 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-900/30"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing CNN & Metrology...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Trigger Inspection Cycle (DI 0.2)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Module 6: Real-time Defect Probability & CNN Feature Activation */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-semibold text-slate-200">Neural Network Defect Probability</h4>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Softmax Output</span>
            </div>

            {/* Probability Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Defect Probability:</span>
                <span className={isCurrentPass ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {((visionResult?.defectProbability ?? (isCurrentPass ? 0.01 : 0.98)) * 100).toFixed(1)}%
                </span>
              </div>

              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className={`h-full transition-all duration-300 ${
                    isCurrentPass ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, (visionResult?.defectProbability ?? (isCurrentPass ? 0.01 : 0.98)) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0% (Nominal)</span>
                <span>Threshold: {(settings.confidenceThreshold * 100).toFixed(0)}%</span>
                <span>100% (Critical)</span>
              </div>
            </div>
          </div>

          {/* Module 8 & 9: Industrial Controller & Rejection Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-semibold text-slate-200">Hardware & Rejection Route</h4>
              </div>
              <span className="text-[11px] font-mono text-slate-400">PLC 24V PNP Bus</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                isCurrentPass
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}>
                <span className="font-mono text-[10px]">ROUTE A (DO 0.2)</span>
                <span className="font-bold text-sm mt-1">Pass Line Bin</span>
                <span className="text-[10px] opacity-80">Proceeds to Packaging</span>
              </div>

              <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                !isCurrentPass
                  ? 'bg-rose-950/50 border-rose-500/60 text-rose-200 animate-pulse'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}>
                <span className="font-mono text-[10px]">ROUTE B (DO 0.3)</span>
                <span className="font-bold text-sm mt-1">Pneumatic Ejector</span>
                <span className="text-[10px] opacity-80">Diverted to Reject Bin</span>
              </div>
            </div>
          </div>

          {/* Defect Spec Sheet & Tolerance Check */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
            <h4 className="font-semibold text-slate-200 flex items-center justify-between">
              <span>Specimen Metadata & QA Notes</span>
              <span className="text-[10px] font-mono text-cyan-400">ISO 9001 / IATF 16949</span>
            </h4>
            <p className="text-slate-300 leading-relaxed">
              {currentSample.description}
            </p>
            <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
              {currentSample.visualHighlights.map((hl, i) => (
                <span key={i} className="px-2 py-0.5 bg-slate-950 rounded border border-slate-800 text-[10px] text-slate-300">
                  {hl}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
