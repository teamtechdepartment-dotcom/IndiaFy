
import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { useOrderStore } from '../../store/orderStore';
import { 
  ArrowLeft, 
  ShieldCheck, 
  User, 
  FileText, 
  Image as ImageIcon, 
  Check, 
  AlertTriangle, 
  VideoOff, 
  CircleDot, 
  Upload, 
  Info, 
  Lock,
  Square,
  RefreshCcw,
  CheckCircle
} from 'lucide-react';

const VideoVerification = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchSellerOrders, updateOrderStatus } = useOrderStore();
  const [items, setItems] = useState([]);
  const [orderData, setOrderData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  React.useEffect(() => {
    // Fetch order details
    const fetchOrder = async () => {
      try {
        const res = await axiosInstance.get(`/orders/${id}`);
        const order = res.data.data;
        setOrderData(order);
        // map order items to checklist
        const checklist = order.orderItems.map((item, index) => ({
          id: item._id || index,
          name: item.product?.productName || 'Product',
          sku: item.product?.sku || `SKU-${index}`,
          qty: item.quantity,
          variant: item.product?.variant || 'Standard',
          checked: false
        }));
        // Add document step
        checklist.push({
          id: 'doc-verify',
          name: "Include Return Label & Invoice",
          sku: "DOC-VERIFY",
          qty: "Req",
          variant: "Document",
          isDoc: true,
          checked: false
        });
        setItems(checklist);
      } catch (err) {
        toast.error("Failed to load order details");
        navigate('/live');
      }
    };
    if (id) fetchOrder();
  }, [id, navigate]);

  const [isRecording, setIsRecording] = useState(false);
  const [videoSrc, setVideoSrc] = useState(null);
  const [stream, setStream] = useState(null);
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const fileInputRef = useRef(null);
  const chunksRef = useRef([]);

  const toggleItem = (id) => setItems(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  const allVerified = items.every(item => item.checked);

  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(mediaStream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoSrc(url);
        if (videoRef.current) videoRef.current.srcObject = null;
      };

      mediaRecorder.start();
      setIsRecording(true);
      setVideoSrc(null);
    } catch (err) {
      console.error("Camera Error:", err);
      alert("Could not access camera. Ensure permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };

  const clearVideo = () => {
    setVideoSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
    }
  };

  const handleVerifyAndCompleteOrder = async () => {
    if (!videoSrc || !allVerified) return;
    setIsUploading(true);

    try {
      // Create a blob from video URL to upload
      let videoBlob;
      try {
        const response = await fetch(videoSrc);
        videoBlob = await response.blob();
      } catch (err) {
        throw new Error("Could not read the recorded video.");
      }

      const formData = new FormData();
      formData.append('video', videoBlob, 'packing_video.webm');

      // 1. Upload video and update order status to Shipped
      await axiosInstance.post(`/orders/${id}/upload-video`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success("Video verified & Order Shipped!");
      fetchSellerOrders(); // Refresh orders in store
      navigate('/live'); // Go back to live dashboard
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Failed to upload verification video");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button 
            onClick={() => navigate('/live')}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors mb-3 text-sm font-bold"
          >
            <ArrowLeft size={16} /> Back to Live Orders
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Order Verification</h1>
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-900 text-white tracking-wider">ORD-{id?.substring(id.length - 8).toUpperCase()}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 w-fit">
          <ShieldCheck size={20} />
          <span className="text-sm font-bold">High-Value Order Protection</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Panel: Checklist */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900">Packing Checklist</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Verify each item before sealing.</p>
          </div>

          <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0"><User size={20} /></div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">{orderData?.customer?.firstName} {orderData?.customer?.lastName}</h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5 leading-relaxed">
                  {orderData?.shippingAddress?.address}, {orderData?.shippingAddress?.city}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-3">
            {items.map((item) => (
              <label key={item.id} className={`group flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer ${item.checked ? 'border-emerald-500/50 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50'}`}>
                <div className="relative flex items-center justify-center shrink-0">
                  <input type="checkbox" className="hidden" checked={item.checked} onChange={() => toggleItem(item.id)} />
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${item.checked ? 'bg-emerald-500 border-emerald-500 scale-110' : 'bg-white border-slate-300 group-hover:border-slate-400'}`}>
                    {item.checked && <Check size={16} className="text-white" strokeWidth={3} />}
                  </div>
                </div>
                
                {item.isDoc ? (
                  <div className="w-12 h-12 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 shrink-0"><FileText size={24} /></div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200"><ImageIcon size={20} /></div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`font-bold text-sm truncate transition-colors ${item.checked ? 'text-emerald-700' : 'text-slate-900'}`}>{item.name}</h4>
                    <span className="text-sm font-bold text-slate-900 shrink-0 bg-slate-100 px-2 py-0.5 rounded-md">{typeof item.qty === 'number' ? `x${item.qty}` : item.qty}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase bg-slate-100 px-1.5 py-0.5 rounded">{item.sku}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-600">{item.variant}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto">
            <button className="flex items-center text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wide">
              <AlertTriangle size={14} className="mr-2" /> Report Issue
            </button>
          </div>
        </div>

        {/* Right Panel: Video Recorder */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-slate-900 rounded-2xl shadow-lg overflow-hidden flex flex-col relative border border-slate-800">
            
            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                <span className="text-[10px] font-bold text-white tracking-widest uppercase">
                  {isRecording ? "REC" : videoSrc ? "Attached" : "Standby"}
                </span>
              </div>
            </div>

            {/* Video Display Area */}
            <div className="aspect-video bg-neutral-900 relative flex items-center justify-center overflow-hidden">
              
              {/* Live camera feed — always mounted so ref is available */}
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover z-10 scale-x-[-1] ${stream ? 'block' : 'hidden'}`}
              />

              {/* Recorded / uploaded video playback */}
              {videoSrc && !stream && (
                <video src={videoSrc} controls className="w-full h-full object-contain bg-black z-10" />
              )}

              {/* Standby placeholder */}
              {!stream && !videoSrc && (
                <div className="text-center z-10 p-6 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <VideoOff size={32} className="text-white/50" />
                  </div>
                  <h3 className="text-white font-bold text-lg">Camera Ready</h3>
                  <p className="text-slate-400 text-sm mt-2 max-w-xs">Start recording or upload a file.</p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="bg-slate-950 p-4 sm:p-6 border-t border-slate-800">
              {videoSrc ? (
                <button onClick={clearVideo} className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold transition-all">
                  <RefreshCcw size={20} /> Retake or Choose New File
                </button>
              ) : isRecording ? (
                <button onClick={stopRecording} className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-500 font-bold transition-all animate-pulse">
                  <Square size={20} fill="currentColor" /> Stop Recording
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={startRecording} className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all group">
                    <CircleDot size={24} className="text-red-500 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-white font-bold text-sm">Record Live</span>
                  </button>
                  
                  <input type="file" accept="video/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                  <button onClick={() => fileInputRef.current.click()} className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all group">
                    <Upload size={24} className="text-blue-400 mb-2 group-hover:-translate-y-1 transition-transform" />
                    <span className="text-white font-bold text-sm">Upload Video</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
              <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Verification Guidelines</h4>
                <ul className="mt-2 space-y-1.5">
                  <li className="text-xs font-medium text-slate-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span> Show shipping label clearly.
                  </li>
                </ul>
              </div>
            </div>

            <button 
              onClick={handleVerifyAndCompleteOrder}
              disabled={!allVerified || !videoSrc || isUploading}
              className={`w-full py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all ${
                allVerified && videoSrc && !isUploading
                  ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md transform hover:-translate-y-0.5' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
              ) : allVerified && videoSrc ? (
                <CheckCircle size={20} />
              ) : (
                <Lock size={20} />
              )}
              {isUploading ? "Uploading & Verifying..." : "Verify & Complete Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoVerification;