import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import {
  Camera,
  Upload,
  Recycle,
  Lightbulb,
  Sparkles,
  Zap,
  Brain,
  X,
  Volume2,
  RefreshCw,
  Image as ImageIcon
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { cn } from "@/lib/utils";

const AIGenius = () => {
  const [image, setImage] = useState("");
  const [language, setLanguage] = useState("en");
  const [output, setOutput] = useState({
    suggestions: "",
    image_url: "",
    recyclable_info: "",
    recycling_steps: [] as string[],
    detected_object: "",
    tts_url: ""
  });
  const [loading, setLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL("image/jpeg");
        setImage(dataUrl);
        setIsCameraOpen(false);
        stopCamera();
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!image) return;
    setLoading(true);

    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const imageFile = new File([blob], "image.jpg", { type: "image/jpg" });

      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("language", language);

      const res = await axios.post("http://localhost:3001/upcycle/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setOutput(res.data);
    } catch (error) {
      console.error("Error:", error);
      alert("Error processing image. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (output.tts_url) {
      const audio = new Audio(`http://localhost:3001${output.tts_url}`);
      audio.play().catch(err => console.warn("Autoplay failed:", err));
    }
  }, [output.tts_url]);

  return (
    <div className="h-[calc(100vh-6rem)] w-full bg-slate-50/30 p-4 lg:p-10 overflow-hidden flex flex-col gap-4">
      {/* Header Area - Super Compact */}
      <div className="flex items-center justify-between px-2 shrink-0 h-14">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-100 shadow-md">
            <Brain className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">AI Genius</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Sustainability Studio</p>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/50 border border-emerald-200 text-emerald-700 text-[9px] font-black uppercase tracking-tighter">
          <Sparkles className="w-3 h-3" />
          Neural Engine Active
        </div>
      </div>

      {/* The Actual Bento Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 min-w-0">

        {/* Card 1: Input Controls (Upload/Capture/Lang) */}
        <div className="lg:col-span-3 flex flex-col gap-4 min-h-0">
          <Card className="flex-1 border-none bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl flex flex-col min-h-0 overflow-hidden group hover:shadow-emerald-900/5 transition-all">
            <CardHeader className="pt-5 pb-2 shrink-0">
              <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                Input Source
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 p-5 min-h-0 overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                <div className="relative group h-20 lg:h-24">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  <div className="h-full rounded-[1.25rem] border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center gap-1 group-hover:border-emerald-300 group-hover:bg-emerald-50/30 transition-all">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Upload Image</span>
                  </div>
                </div>

                <Dialog open={isCameraOpen} onOpenChange={(open) => {
                  setIsCameraOpen(open);
                  if (open) startCamera();
                  else stopCamera();
                }}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-20 lg:h-24 rounded-[1.25rem] border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center gap-1 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all"
                    >
                      <Camera className="w-4 h-4 text-emerald-600" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Visual Snap</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md border-none bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-6 shadow-3xl">
                    <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-slate-900 border-4 border-white shadow-2xl">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                    <Button onClick={capturePhoto} className="w-full h-14 mt-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg">
                      CAPTURE FRAME
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Locale</label>
                <div className="flex gap-1.5">
                  {['en', 'hi'].map((lang) => (
                    <Button
                      key={lang}
                      variant={language === lang ? "default" : "outline"}
                      onClick={() => setLanguage(lang)}
                      className={cn(
                        "flex-1 h-9 rounded-xl font-black text-[10px] transition-all",
                        language === lang
                          ? "bg-slate-900 text-white shadow-md"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      {lang.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading || !image}
                className="w-full h-12 mt-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-200/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "START ANALYSIS"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Card 2: Massive Immersive Preview */}
        <div className="lg:col-span-5 flex flex-col gap-4 min-h-0">
          <Card className="flex-[3] border-none bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
            {/* Preview Labels Overlay */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
              <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Viewport
              </div>
            </div>

            {image ? (
              <div className="absolute inset-0">
                <img src={image} alt="Input" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center gap-4 text-slate-600">
                <div className="w-20 h-20 rounded-full border-2 border-slate-700 flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 opacity-20" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Ready for Signal</p>
              </div>
            )}

            {image && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white z-20"
                onClick={() => setImage("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}

            <div className="absolute bottom-6 left-6 right-6 z-20 transition-all transform translate-y-0 group-hover:translate-y-[-4px]">
              <div className="p-5 rounded-[1.75rem] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-1 block">IDENTIFIED ENTITY</span>
                <h2 className="text-3xl font-black text-white tracking-tight leading-none drop-shadow-lg">
                  {output.detected_object || "Waiting..."}
                </h2>
              </div>
            </div>
          </Card>
        </div>

        {/* Card 3: Results (Upcycling & Recycling) */}
        <div className="lg:col-span-4 flex flex-col gap-4 min-h-0">
          {/* Upcycling Card */}
          <Card className="flex-[3] border-none bg-amber-50/40 backdrop-blur-xl rounded-[2rem] shadow-xl border border-amber-100/50 flex flex-col min-h-0 overflow-hidden">
            <CardHeader className="pt-5 pb-2 shrink-0 flex flex-row items-center justify-between px-6">
              <CardTitle className="text-[10px] font-black text-amber-900/60 uppercase tracking-[0.2em] flex items-center gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                Upcycle Genius
              </CardTitle>
              {output.tts_url && (
                <Button variant="ghost" size="icon" className="w-7 h-7 rounded-full hover:bg-amber-100/50" onClick={() => new Audio(`http://localhost:3001${output.tts_url}`).play()}>
                  <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6 pt-1 space-y-4">
              {output.suggestions ? (
                <div className="grid gap-4 animate-in fade-in slide-in-from-right-4">
                  <div className="p-4 rounded-2xl bg-white/70 border border-amber-200/40 shadow-sm transition-all hover:bg-white">
                    <p className="text-[13px] font-bold text-amber-900/80 leading-relaxed whitespace-pre-line">
                      {output.suggestions}
                    </p>
                  </div>
                  {output.image_url && (
                    <div className="rounded-2xl overflow-hidden border-2 border-white shadow-lg h-full">
                      <img src={`http://localhost:3001${output.image_url}`} alt="Inspo" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-10">
                  <Lightbulb className="w-16 h-16" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recycling Card */}
          <Card className="flex-[2] border-none bg-emerald-50/40 backdrop-blur-xl rounded-[2rem] shadow-xl border border-emerald-100/50 flex flex-col min-h-0 overflow-hidden">
            <CardHeader className="pt-5 pb-2 shrink-0 px-6">
              <CardTitle className="text-[10px] font-black text-emerald-900/60 uppercase tracking-[0.2em] flex items-center gap-2">
                <Recycle className="w-3.5 h-3.5 text-emerald-600" />
                Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6 pt-1">
              {output.recyclable_info ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-600 text-white shadow-md">
                    <p className="font-bold text-[11px] flex items-center gap-2">
                      <span className="text-sm">♻️</span> {output.recyclable_info}
                    </p>
                  </div>
                  <div className="grid gap-2">
                    {output.recycling_steps.map((step, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/60 border border-emerald-100 transition-all hover:bg-white group">
                        <span className="w-4 h-4 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-[9px] font-black shrink-0 group-hover:bg-emerald-600 group-hover:text-white">{i + 1}</span>
                        <p className="text-[10px] font-bold text-emerald-900/70 leading-tight">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-10">
                  <Recycle className="w-16 h-16" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default AIGenius;