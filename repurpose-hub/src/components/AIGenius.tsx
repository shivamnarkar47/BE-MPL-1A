import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import axios from "axios";

interface HistoryItem {
  id: string;
  question: string;
  answer: string;
  type: "text" | "image";
  image?: string;
  timestamp: Date;
  features?: string[];
}
import {
  Camera,
  Upload,
  Recycle,
  Lightbulb,
  Sparkles,
  Brain,
  X,
  Volume2,
  Image as ImageIcon,
  Wand2,
  History,
  Bookmark,
  Share2,
  ChevronDown,
  Globe,
  Scan,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Maximize2,
  Minimize2,
  Copy,
  Check,
} from "lucide-react";

interface AnalysisResult {
  suggestions: string;
  image_url: string;
  recyclable_info: string;
  recycling_steps: string[];
  detected_object: string;
  tts_url: string;
  confidence?: number;
  materials?: string[];
  environmental_impact?: {
    co2_saved: string;
    water_saved: string;
    waste_diverted: string;
  };
}

interface AnalysisHistory {
  id: string;
  image: string;
  detected_object: string;
  timestamp: Date;
  language: string;
}

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "hi", name: "हिंदी", flag: "🇮🇳" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
];

const AIGenius = () => {
  const [image, setImage] = useState<string>("");
  const [language, setLanguage] = useState<string>("en");
  const [output, setOutput] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>("");
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("upcycle");
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef<number>(0);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("aiGeniusHistory");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((h: HistoryItem) => ({ ...h, timestamp: new Date(h.timestamp) })));
      } catch (e) {
        console.error("Error loading history:", e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem("aiGeniusHistory", JSON.stringify(history));
    }
  }, [history]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please check permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.9);
        setImage(dataUrl);
        setIsCameraOpen(false);
        stopCamera();
        setOutput(null);
        setError(null);
      }
    }
  }, [stopCamera]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size must be less than 10MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setOutput(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        if (file.size > 10 * 1024 * 1024) {
          setError("Image size must be less than 10MB");
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          setImage(reader.result as string);
          setOutput(null);
          setError(null);
        };
        reader.readAsDataURL(file);
      } else {
        setError("Please upload an image file");
      }
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    setLoadingStage("Initializing analysis...");

    try {
      setLoadingStage("Processing image...");
      const response = await fetch(image);
      const blob = await response.blob();
      const imageFile = new File([blob], "image.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("language", language);

      setLoadingStage("AI is analyzing...");
      const res = await axios.post("http://localhost:3001/upcycle/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });

      const result: AnalysisResult = res.data;
      setOutput(result);
      setActiveTab("upcycle");

      // Add to history
      const historyItem: AnalysisHistory = {
        id: Date.now().toString(),
        image: image,
        detected_object: result.detected_object,
        timestamp: new Date(),
        language: language,
      };
      setHistory((prev) => [historyItem, ...prev].slice(0, 50)); // Keep last 50

      // Play audio if available
      if (result.tts_url) {
        const audio = new Audio(`http://localhost:3001${result.tts_url}`);
        audio.volume = 0.7;
        audio.play().catch((err) => console.warn("Autoplay failed:", err));
      }
    } catch (error: unknown) {
      console.error("Error:", error);
      const axiosError = error as any;
      if (axiosError?.code === "ECONNABORTED") {
        setError("Analysis timed out. Please try again.");
      } else if (axiosError?.response?.status === 413) {
        setError("Image too large. Please use a smaller image.");
      } else {
        setError("Error processing image. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
      setLoadingStage("");
    }
  }, [image, language]);

  const clearImage = useCallback(() => {
    setImage("");
    setOutput(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const loadFromHistory = useCallback((historyItem: AnalysisHistory) => {
    setImage(historyItem.image);
    setLanguage(historyItem.language);
    setOutput(null);
    setError(null);
    setShowHistory(false);
  }, []);

  const deleteHistoryItem = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-4 lg:p-8"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragging && (
        <div className="fixed inset-0 bg-emerald-500/20 backdrop-blur-sm z-50 flex items-center justify-center border-4 border-emerald-500 border-dashed m-4 rounded-3xl">
          <div className="text-center">
            <Upload className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <p className="text-2xl font-black text-emerald-700">Drop image here</p>
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center shadow-xl shadow-slate-900/20">
              <Brain className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                AI Genius
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-bold">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Pro
                </Badge>
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Transform waste into wonder with AI-powered upcycling
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(true)}
              className="rounded-xl border-slate-200"
            >
              <History className="w-4 h-4 mr-2" />
              History ({history.length})
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl border-slate-200">
                  <Globe className="w-4 h-4 mr-2" />
                  {currentLang.flag} {currentLang.name}
                  <ChevronDown className="w-3 h-3 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn(
                      "cursor-pointer",
                      language === lang.code && "bg-emerald-50 text-emerald-700"
                    )}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 font-medium flex-1">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-700 hover:bg-red-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Upload & Controls */}
          <div className="lg:col-span-3 space-y-4">
            {/* Upload Card */}
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <Scan className="w-5 h-5 text-emerald-400" />
                  Upload Image
                </CardTitle>
                <p className="text-slate-400 text-sm">Drag & drop or capture</p>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={cn(
                    "block w-full h-40 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-2",
                    image
                      ? "border-emerald-300 bg-emerald-50/50"
                      : "border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/30"
                  )}
                >
                  {image ? (
                    <>
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      <span className="text-sm font-bold text-emerald-700">Image loaded</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400" />
                      <span className="text-sm font-bold text-slate-500">Click or drag image</span>
                      <span className="text-xs text-slate-400">Max 10MB</span>
                    </>
                  )}
                </label>

                <Dialog
                  open={isCameraOpen}
                  onOpenChange={(open) => {
                    setIsCameraOpen(open);
                    if (open) startCamera();
                    else stopCamera();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-12 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30"
                    >
                      <Camera className="w-5 h-5 mr-2 text-emerald-600" />
                      Take Photo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg border-none rounded-3xl p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-0">
                      <DialogTitle className="text-xl font-black flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        Camera
                      </DialogTitle>
                      <DialogDescription>Position the object in frame</DialogDescription>
                    </DialogHeader>
                    <div className="p-6">
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <canvas ref={canvasRef} className="hidden" />
                        {/* Scanning overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute inset-8 border-2 border-emerald-500/50 rounded-xl">
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500" />
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500" />
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500" />
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500" />
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={capturePhoto}
                        className="w-full h-14 mt-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg"
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        CAPTURE
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {image && (
                  <Button
                    variant="ghost"
                    onClick={clearImage}
                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Image
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-none shadow-lg rounded-3xl">
              <CardContent className="p-6 space-y-3">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl h-auto py-3 flex flex-col items-center gap-1"
                    disabled={!output || !output.tts_url}
                    onClick={() => {
                      if (output?.tts_url) {
                        new Audio(`http://localhost:3001${output.tts_url}`).play();
                      }
                    }}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span className="text-xs">Audio</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl h-auto py-3 flex flex-col items-center gap-1"
                    disabled={!image}
                    onClick={() => setIsFullscreen(true)}
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span className="text-xs">Fullscreen</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl h-auto py-3 flex flex-col items-center gap-1"
                    disabled={!output}
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="text-xs">Share</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl h-auto py-3 flex flex-col items-center gap-1"
                    disabled={!output}
                  >
                    <Bookmark className="w-4 h-4" />
                    <span className="text-xs">Save</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Image Preview */}
          <div className="lg:col-span-5">
            <Card
              className={cn(
                "border-none shadow-2xl rounded-3xl overflow-hidden h-full min-h-[500px] relative group",
                !image && "bg-gradient-to-br from-slate-900 to-slate-800"
              )}
            >
              {image ? (
                <div className="relative h-full">
                  <img
                    src={image}
                    alt="Uploaded"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Object Detection Badge */}
                  <div className="absolute top-6 left-6">
                    <Badge className="bg-emerald-500/90 text-white border-0 font-bold text-sm px-4 py-2">
                      <Scan className="w-4 h-4 mr-2" />
                      {output?.detected_object || "Analyzing..."}
                    </Badge>
                  </div>

                  {/* Confidence Score */}
                  {output?.confidence && (
                    <div className="absolute top-6 right-6">
                      <Badge className="bg-white/90 text-slate-900 border-0 font-bold">
                        {(output.confidence * 100).toFixed(0)}% Match
                      </Badge>
                    </div>
                  )}

                  {/* Remove Button */}
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg"
                    onClick={clearImage}
                    style={{ right: output?.confidence ? "100px" : "24px" }}
                  >
                    <X className="w-5 h-5" />
                  </Button>

                  {/* Analysis Button */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full h-16 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg shadow-xl shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                          {loadingStage}
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-6 h-6 mr-3" />
                          {output ? "Re-analyze" : "Analyze with AI"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-white p-8">
                  <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <ImageIcon className="w-16 h-16 text-white/20" />
                  </div>
                  <h3 className="text-2xl font-black mb-2">Ready to Analyze</h3>
                  <p className="text-white/50 text-center max-w-sm">
                    Upload an image or take a photo to discover upcycling and recycling possibilities
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="w-full grid grid-cols-2 bg-slate-100 p-1 rounded-2xl mb-4">
                <TabsTrigger
                  value="upcycle"
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Upcycle
                </TabsTrigger>
                <TabsTrigger
                  value="recycle"
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold"
                >
                  <Recycle className="w-4 h-4 mr-2" />
                  Recycle
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcycle" className="mt-0">
                <Card className="border-none shadow-xl rounded-3xl h-[calc(100%-60px)]">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-black text-amber-900 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-600" />
                        Creative Ideas
                      </CardTitle>
                      {output?.suggestions && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8"
                          onClick={() => copyToClipboard(output.suggestions)}
                        >
                          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ScrollArea className="h-[400px]">
                      {output?.suggestions ? (
                        <div className="space-y-4">
                          <div className="prose prose-sm max-w-none">
                            {output.suggestions.split('\n').map((line, i) => (
                              <p key={i} className="text-slate-700 leading-relaxed mb-2">
                                {line}
                              </p>
                            ))}
                          </div>

                          {output.image_url && (
                            <div className="mt-4">
                              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                                Inspiration Image
                              </p>
                              <div className="rounded-2xl overflow-hidden border-2 border-amber-100 shadow-lg">
                                <img
                                  src={`http://localhost:3001${output.image_url}`}
                                  alt="Upcycling inspiration"
                                  className="w-full h-auto"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                          <Lightbulb className="w-16 h-16 mb-4 opacity-20" />
                          <p className="text-center font-medium">
                            Upload an image and analyze to get creative upcycling ideas
                          </p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recycle" className="mt-0">
                <Card className="border-none shadow-xl rounded-3xl h-[calc(100%-60px)]">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                    <CardTitle className="text-lg font-black text-emerald-900 flex items-center gap-2">
                      <Recycle className="w-5 h-5 text-emerald-600" />
                      Recycling Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ScrollArea className="h-[400px]">
                      {output?.recyclable_info ? (
                        <div className="space-y-6">
                          {/* Recyclability Status */}
                          <div
                            className={cn(
                              "p-4 rounded-2xl border-2",
                              output.recyclable_info.toLowerCase().includes("recyclable")
                                ? "bg-emerald-50 border-emerald-200"
                                : "bg-amber-50 border-amber-200"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              {output.recyclable_info.toLowerCase().includes("recyclable") ? (
                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                              ) : (
                                <AlertCircle className="w-8 h-8 text-amber-500" />
                              )}
                              <div>
                                <p className="font-black text-slate-900">{output.recyclable_info}</p>
                                <p className="text-sm text-slate-500">
                                  {output.recyclable_info.toLowerCase().includes("recyclable")
                                    ? "Great! This item can be recycled."
                                    : "Check local guidelines for disposal options."}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Recycling Steps */}
                          {output.recycling_steps.length > 0 && (
                            <div>
                              <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-3">
                                How to Recycle
                              </h4>
                              <div className="space-y-3">
                                {output.recycling_steps.map((step, i) => (
                                  <div
                                    key={i}
                                    className="flex gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm shrink-0">
                                      {i + 1}
                                    </div>
                                    <p className="text-slate-700 font-medium leading-relaxed">{step}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Materials Detected */}
                          {output.materials && output.materials.length > 0 && (
                            <div>
                              <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-3">
                                Materials Detected
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {output.materials.map((material, i) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="bg-slate-100 text-slate-700 font-medium px-3 py-1"
                                  >
                                    {material}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Environmental Impact */}
                          {output.environmental_impact && (
                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100">
                              <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4">
                                Environmental Impact
                              </h4>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                  <p className="text-2xl font-black text-blue-600">
                                    {output.environmental_impact.co2_saved}
                                  </p>
                                  <p className="text-xs text-slate-500 font-medium">CO2 Saved</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-2xl font-black text-cyan-600">
                                    {output.environmental_impact.water_saved}
                                  </p>
                                  <p className="text-xs text-slate-500 font-medium">Water Saved</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-2xl font-black text-teal-600">
                                    {output.environmental_impact.waste_diverted}
                                  </p>
                                  <p className="text-xs text-slate-500 font-medium">Waste Diverted</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                          <Recycle className="w-16 h-16 mb-4 opacity-20" />
                          <p className="text-center font-medium">
                            Upload an image to get recycling instructions and environmental impact data
                          </p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="sm:max-w-2xl border-none rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-2">
              <History className="w-6 h-6" />
              Analysis History
            </DialogTitle>
            <DialogDescription>Your recent analyses</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] mt-4">
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    <img
                      src={item.image}
                      alt={item.detected_object}
                      className="w-16 h-16 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{item.detected_object || "Unknown Object"}</p>
                      <p className="text-sm text-slate-500">
                        {item.timestamp.toLocaleDateString()} •{" "}
                        {LANGUAGES.find((l) => l.code === item.language)?.name}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => deleteHistoryItem(item.id, e)}
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <History className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>No history yet. Start analyzing!</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Image Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 border-none bg-transparent">
          <div className="relative">
            <img
              src={image}
              alt="Fullscreen"
              className="w-full h-full object-contain rounded-2xl"
            />
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90"
              onClick={() => setIsFullscreen(false)}
            >
              <Minimize2 className="w-5 h-5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIGenius;
