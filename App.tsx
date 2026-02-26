/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, Play, Activity, CheckCircle2, AlertCircle, Settings2, Image as ImageIcon, Layers, ChevronRight, X, Microscope, History, Lock, Database, FileText, Building2, ActivitySquare, GitCommit } from 'lucide-react';
import { GoogleGenAI } from '@google/generative-ai';
import Markdown from 'react-markdown';

// Apple-style minimalist UI
// Deep Blue: #0A2540
// Emerald Green: #10B981
// White: #FFFFFF

const MODELS = ['ResNet-50', 'VGG-16', 'EfficientNet'];

const PROVINCES = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Ninh', 'Bình Dương',
  'Bình Định', 'Bình Thuận', 'Cà Mau', 'Đắk Lắk', 'Đồng Nai',
  'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hải Dương', 'Hòa Bình',
  'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Lâm Đồng', 'Lạng Sơn',
  'Lào Cai', 'Nam Định', 'Nghệ An', 'Ninh Bình', 'Phú Thọ',
  'Quảng Ninh', 'Thái Bình', 'Thanh Hóa', 'Thừa Thiên Huế'
];

const HOSPITALS_BY_PROVINCE: Record<string, string[]> = {
  'Hà Nội': ['Bệnh viện Bạch Mai', 'Bệnh viện Việt Đức', 'Bệnh viện K', 'Bệnh viện Nhi Trung ương', 'Bệnh viện Phụ sản Trung ương', 'Bệnh viện E', 'Bệnh viện Xanh Pôn', 'Bệnh viện Thanh Nhàn'],
  'TP. Hồ Chí Minh': ['Bệnh viện Chợ Rẫy', 'Bệnh viện Đại học Y Dược', 'Bệnh viện Nhân dân 115', 'Bệnh viện Nhi Đồng 1', 'Bệnh viện Từ Dũ', 'Bệnh viện Ung Bướu TP.HCM', 'Bệnh viện Bệnh Nhiệt đới'],
  'Đà Nẵng': ['Bệnh viện C Đà Nẵng', 'Bệnh viện Đa khoa Đà Nẵng', 'Bệnh viện Phụ sản - Nhi Đà Nẵng', 'Bệnh viện Ung bướu Đà Nẵng'],
  'Hải Phòng': ['Bệnh viện Hữu nghị Việt Tiệp', 'Bệnh viện Trẻ em Hải Phòng', 'Bệnh viện Phụ sản Hải Phòng'],
  'Cần Thơ': ['Bệnh viện Đa khoa Trung ương Cần Thơ', 'Bệnh viện Nhi đồng Cần Thơ', 'Bệnh viện Phụ sản Cần Thơ'],
  'An Giang': ['Bệnh viện Đa khoa Trung tâm An Giang', 'Bệnh viện Sản Nhi An Giang'],
  'Bà Rịa - Vũng Tàu': ['Bệnh viện Bà Rịa', 'Bệnh viện Vũng Tàu'],
  'Bắc Giang': ['Bệnh viện Đa khoa Tỉnh Bắc Giang', 'Bệnh viện Sản Nhi Bắc Giang'],
  'Bắc Ninh': ['Bệnh viện Đa khoa Tỉnh Bắc Ninh', 'Bệnh viện Sản Nhi Bắc Ninh'],
  'Bình Dương': ['Bệnh viện Đa khoa Tỉnh Bình Dương'],
  'Bình Định': ['Bệnh viện Đa khoa Tỉnh Bình Định'],
  'Bình Thuận': ['Bệnh viện Đa khoa Tỉnh Bình Thuận'],
  'Cà Mau': ['Bệnh viện Đa khoa Tỉnh Cà Mau'],
  'Đắk Lắk': ['Bệnh viện Đa khoa Vùng Tây Nguyên'],
  'Đồng Nai': ['Bệnh viện Đa khoa Đồng Nai', 'Bệnh viện Đa khoa Thống Nhất'],
  'Đồng Tháp': ['Bệnh viện Đa khoa Đồng Tháp'],
  'Gia Lai': ['Bệnh viện Đa khoa Tỉnh Gia Lai'],
  'Hà Giang': ['Bệnh viện Đa khoa Tỉnh Hà Giang'],
  'Hải Dương': ['Bệnh viện Đa khoa Tỉnh Hải Dương'],
  'Hòa Bình': ['Bệnh viện Đa khoa Tỉnh Hòa Bình'],
  'Hưng Yên': ['Bệnh viện Đa khoa Tỉnh Hưng Yên'],
  'Khánh Hòa': ['Bệnh viện Đa khoa Tỉnh Khánh Hòa'],
  'Kiên Giang': ['Bệnh viện Đa khoa Tỉnh Kiên Giang'],
  'Lâm Đồng': ['Bệnh viện Đa khoa Tỉnh Lâm Đồng'],
  'Lạng Sơn': ['Bệnh viện Đa khoa Tỉnh Lạng Sơn'],
  'Lào Cai': ['Bệnh viện Đa khoa Tỉnh Lào Cai'],
  'Nam Định': ['Bệnh viện Đa khoa Tỉnh Nam Định'],
  'Nghệ An': ['Bệnh viện Hữu nghị Đa khoa Nghệ An', 'Bệnh viện Sản Nhi Nghệ An'],
  'Ninh Bình': ['Bệnh viện Đa khoa Tỉnh Ninh Bình'],
  'Phú Thọ': ['Bệnh viện Đa khoa Tỉnh Phú Thọ'],
  'Quảng Ninh': ['Bệnh viện Đa khoa Tỉnh Quảng Ninh', 'Bệnh viện Bãi Cháy'],
  'Thái Bình': ['Bệnh viện Đa khoa Tỉnh Thái Bình', 'Bệnh viện Nhi Thái Bình'],
  'Thanh Hóa': ['Bệnh viện Đa khoa Tỉnh Thanh Hóa', 'Bệnh viện Nhi Thanh Hóa'],
  'Thừa Thiên Huế': ['Bệnh viện Trung ương Huế']
};
const DEPARTMENTS_BY_HOSPITAL: Record<string, string[]> = {
  'Bệnh viện Bạch Mai': ['Viện Tim mạch', 'Viện Thần kinh', 'Trung tâm Chống độc', 'Khoa Khám bệnh', 'Trung tâm Y học hạt nhân', 'Trung tâm cấp cứu A9', 'Chấn thương chỉnh hình', 'Nhi', 'Sản', 'Tiêu hóa', 'Thận nhân tạo'],
  'Bệnh viện Việt Đức': ['Khoa Phẫu thuật Thần kinh', 'Khoa Ung bướu', 'Khoa Xét nghiệm', 'Khoa Giải phẫu bệnh'],
  'Bệnh viện K': ['Khoa Ngoại Thần kinh', 'Khoa Nội Ung bướu', 'Khoa Xét nghiệm', 'Khoa Giải phẫu bệnh', 'Khoa Xạ trị', 'Khoa Chẩn đoán hình ảnh', 'Khoa Hồi sức cấp cứu', 'Khoa Nội', 'Khoa Ngoại'],
  'Bệnh viện Chợ Rẫy': ['Khoa Nội Thần kinh', 'Khoa Ngoại Thần kinh', 'Khoa Ung bướu', 'Khoa Xét nghiệm', 'Khoa Giải phẫu bệnh'],
  'Bệnh viện Đại học Y Dược': ['Khoa Thần kinh', 'Khoa Ung bướu', 'Khoa Xét nghiệm', 'Khoa Giải phẫu bệnh', 'Trung tâm Phân tử'],
  'Bệnh viện Trung ương Huế': ['Khoa Thần kinh', 'Trung tâm Ung bướu', 'Khoa Xét nghiệm', 'Khoa Giải phẫu bệnh'],
  'default': ['Khoa Thần kinh', 'Khoa Ung bướu', 'Khoa Xét nghiệm', 'Khoa Giải phẫu bệnh']
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [province, setProvince] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [department, setDepartment] = useState('');
  const [medicalRecordId, setMedicalRecordId] = useState('');
  const [geneTag, setGeneTag] = useState('');

  const [isGeneLibraryOpen, setIsGeneLibraryOpen] = useState(false);
  const [selectedGeneTag, setSelectedGeneTag] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportContent, setReportContent] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUsername === 'siliconmedi3443' && loginPassword === 'yteviet24h@') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Sai tên tài khoản hoặc mật khẩu');
    }
  };

  const loadHistoryItem = (item: any) => {
    setSelectedImage(item.image);
    setSelectedModel(item.model);
    setPredictionResult(item.result);
    setReportContent(item.reportContent);
    setIsHistoryOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setPredictionResult(null); // Reset results on new upload
        setReportContent(null);
      };
      reader.readAsDataURL(file);
    }
  };

// ==========================================
  // 1. HÀM DỰ ĐOÁN CHÍNH (START PREDICTION)
  // ==========================================
 Hải, tao đã soi lại file App (12).tsx mà mày vừa gửi. Đây là bản "tổng kết" trung thực nhất để mày không phải điên đầu nữa:

📍 Tình trạng file của mày:
File này vẫn đang bị lỗi cú pháp cực nặng ở vùng giữa (do các lần dán đè trước đó để lại dấu ngoặc thừa). Cụ thể là từ dòng 219 đến 225, có một đống code "mồ côi" làm app chết đứng.

🛠️ Cách sửa "Chốt hạ" (Trích xuất chính xác):
Để giữ lại toàn bộ giao diện xịn sò của mày mà chỉ thay đúng phần "não bộ" cho nó chạy, mày hãy làm đúng 2 bước này:

Bước 1: Bôi đen và XÓA SẠCH từ dòng 132 (chỗ const startPrediction) kéo xuống hết dòng 285 (hết hàm handleViewReport).

Bước 2: Dán đúng khối "não bộ" đã được tao tinh chỉnh, ép kiểu số và lắp Prompt Harvard của mày vào đây:

TypeScript

  const startPrediction = async () => {
    if (!selectedImage) return;
    setIsPredicting(true);
    setPredictionResult(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
      if (!apiKey) {
        alert("Hari ơi, nạp Key VITE_GEMINI_API_KEY vào Vercel đi!");
        throw new Error("Missing API Key");
      }

      const genAI = new GoogleGenAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.split(';')[0].split(':')[1];
      
      const prompt = `Analyze this microscopy image. Return ONLY a JSON object: 
      {
        "cellAnalysis": "string",
        "cellType": "Neuron/Cancer/Blood",
        "quantitativeData": { "cellCount": number, "density": number, "averageAxonLength": number, "ncRatio": number, "nuclearPleomorphismScore": number, "branchingIndex": number },
        "healthAssessment": { "nucleusState": "string", "cytoskeletonIntegrity": "string", "overallRisk": "string" },
        "overallConfidence": number,
        "processingTime": number
      }`;

      const genResult = await model.generateContent([prompt, { inlineData: { data: base64Data, mimeType } }]);
      const responseText = genResult.response.text();
      const cleanJson = responseText.replace(/```json|```/g, "").trim();
      const rawData = JSON.parse(cleanJson);
      
      const finalResult = {
        ...rawData,
        quantitativeData: {
          cellCount: Number(rawData.quantitativeData?.cellCount || 0),
          density: Number(rawData.quantitativeData?.density || 0),
          averageAxonLength: Number(rawData.quantitativeData?.averageAxonLength || 0),
          ncRatio: Number(rawData.quantitativeData?.ncRatio || 0),
          nuclearPleomorphismScore: Number(rawData.quantitativeData?.nuclearPleomorphismScore || 0),
          branchingIndex: Number(rawData.quantitativeData?.branchingIndex || 0)
        }
      };
      
      setPredictionResult(finalResult);
      setHistory(prev => [{ 
        id: Date.now().toString(), 
        timestamp: new Date().toLocaleString(), 
        image: selectedImage, 
        model: selectedModel, 
        result: finalResult, 
        medicalRecordId, geneTag, province, hospitalName, department 
      }, ...prev]);
    } catch (error: any) {
      console.error("AI Error:", error);
      alert("Lỗi AI: " + error.message);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleViewReport = async () => {
    setIsReportModalOpen(true);
    if (reportContent || !predictionResult) return;
    setIsGeneratingReport(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
      if (!apiKey) throw new Error("API Key missing!");
      
      const genAI = new GoogleGenAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const base64Data = selectedImage!.split(',')[1];
      const mimeType = selectedImage!.split(';')[0].split(':')[1];

      const prompt = `
Role: Mày là một chuyên gia hàng đầu về Computer Vision trong Y sinh và Bioinformatics tại Harvard.
Task: Dựa trên dữ liệu phân tích hình thái học sau đây từ model ${selectedModel}, hãy viết một báo cáo đánh giá chuyên sâu.

Loại tế bào: ${predictionResult.cellType}
Dữ liệu định lượng:
- Số lượng tế bào: ${predictionResult.quantitativeData.cellCount}
- Mật độ (Cells/mm²): ${predictionResult.quantitativeData.density}
${predictionResult.cellType === 'Neuron' ? `- Chiều gia sợi trục TB (µm): ${predictionResult.quantitativeData.averageAxonLength} - Chỉ số phân nhánh: ${predictionResult.quantitativeData.branchingIndex}/10` : ''}
${predictionResult.cellType === 'Cancer' ? `- Điểm đa hình thái nhân (Pleomorphism): ${predictionResult.quantitativeData.nuclearPleomorphismScore}/10 - Tỉ lệ Nhân/Tế bào chất (N/C Ratio): ${predictionResult.quantitativeData.ncRatio}` : ''}

Đánh giá sức khỏe:
- Trạng thái nhân: ${predictionResult.healthAssessment.nucleusState}
- Khung xương tế bào: ${predictionResult.healthAssessment.cytoskeletonIntegrity}
- Nguy cơ tổng thể: ${predictionResult.healthAssessment.overallRisk}

Format Báo cáo BẮT BUỘC:
### Phần 1: Thông số định lượng (Quantitative Data)
### Phần 2: Đánh giá sức khỏe tế bào (Cellular Health Assessment)
### Phần 3: Khuyến nghị chuyên sâu (Advanced Recommendations)

*Constraints: BẮT BUỘC có câu: "Dữ liệu hình thái chưa đủ cơ sở để kết luận biểu hiện phiên mã, cần bổ sung dữ liệu NGS." ở cuối.*`;

      const result = await model.generateContent([prompt, { inlineData: { data: base64Data, mimeType } }]);
      setReportContent(result.response.text());
    } catch (error: any) {
      setReportContent("**Lỗi báo cáo:** " + error.message);
    } finally {
      setIsGeneratingReport(false);
    }
  };
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden font-sans">
        {/* Blurred background image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/medical/1920/1080?blur=10" 
            alt="Medical Background" 
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
        </div>
        
        {/* Login Card */}
        <div className="relative z-10 bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/20 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#000080] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Activity size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#0A2540] tracking-tight">Silicon ENAI</h1>
            <p className="text-sm text-slate-500 mt-1">Secure Authentication Gateway</p>
          </div>

          {loginError && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-center animate-in slide-in-from-top-2">
              <p className="text-sm text-red-600 font-medium">{loginError}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Username</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#007bff]/20 focus:border-[#007bff] transition-all outline-none"
                  placeholder="Enter username"
                />
                <Lock size={16} className="absolute left-4 top-3.5 text-slate-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#007bff]/20 focus:border-[#007bff] transition-all outline-none"
                  placeholder="Enter password"
                />
                <Lock size={16} className="absolute left-4 top-3.5 text-slate-400" />
              </div>
            </div>
            <button 
              type="submit"
              className="w-full bg-[#007bff] hover:bg-[#0056b3] text-white font-semibold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all mt-2"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F5F7FA] font-sans text-slate-800 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0A2540] flex items-center justify-center text-white shadow-md">
            <Activity size={24} className="text-[#10B981]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0A2540] tracking-tight">GENE-VISION AI</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Silicon Research Prototype</p>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-8">
          {/* Pre-Analysis Form */}
          <section>
            <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Building2 size={16} className="text-[#0A2540]" />
              Clinical Information
            </h2>
            <div className="space-y-3">
              <select 
                value={province} 
                onChange={(e) => { setProvince(e.target.value); setHospitalName(''); setDepartment(''); }}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] outline-none"
              >
                <option value="">Chọn Tỉnh/Thành phố</option>
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              <select 
                value={hospitalName} 
                onChange={(e) => { setHospitalName(e.target.value); setDepartment(''); }}
                disabled={!province}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] outline-none disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">Chọn Bệnh viện</option>
                {province && HOSPITALS_BY_PROVINCE[province]?.map(h => <option key={h} value={h}>{h}</option>)}
              </select>

              <select 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)}
                disabled={!hospitalName}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] outline-none disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">Chọn Khoa chuyên môn</option>
                {hospitalName && (DEPARTMENTS_BY_HOSPITAL[hospitalName] || DEPARTMENTS_BY_HOSPITAL['default']).map(d => <option key={d} value={d}>{d}</option>)}
              </select>

              <input 
                type="text" 
                placeholder="Số bệnh án (Medical Record ID)"
                value={medicalRecordId}
                onChange={(e) => setMedicalRecordId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] outline-none"
              />

              <input 
                type="text" 
                placeholder="Mã loại Gene (Gene Tag)"
                value={geneTag}
                onChange={(e) => setGeneTag(e.target.value.toUpperCase())}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] outline-none uppercase"
              />
            </div>
          </section>

          {/* Upload Section */}
          <section>
            <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Upload size={16} className="text-[#0A2540]" />
              Input Imagery
            </h2>
            <div 
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer
                ${selectedImage ? 'border-[#10B981] bg-[#10B981]/5' : 'border-slate-300 hover:border-[#0A2540] hover:bg-slate-50'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg, image/tiff"
                onChange={handleImageUpload}
              />
              {selectedImage ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 size={32} className="text-[#10B981]" />
                  <span className="text-sm font-medium text-[#10B981]">Image Loaded Successfully</span>
                  <span className="text-xs text-slate-500">Click to replace</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                    <ImageIcon size={24} className="text-slate-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Upload Microscopic Image</span>
                  <span className="text-xs text-slate-500">PNG, JPG, TIFF up to 50MB</span>
                </div>
              )}
            </div>
          </section>

          {/* Model Selection */}
          <section>
            <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Settings2 size={16} className="text-[#0A2540]" />
              AI Architecture
            </h2>
            <div className="flex flex-col gap-2">
              {MODELS.map(model => (
                <label 
                  key={model}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all
                    ${selectedModel === model ? 'border-[#0A2540] bg-[#0A2540] text-white shadow-md' : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'}`}
                  onClick={() => setSelectedModel(model)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                      ${selectedModel === model ? 'border-[#10B981]' : 'border-slate-300'}`}>
                      {selectedModel === model && <div className="w-2 h-2 rounded-full bg-[#10B981]" />}
                    </div>
                    <span className="text-sm font-medium">{model}</span>
                  </div>
                  {selectedModel === model && <ChevronRight size={16} className="text-[#10B981]" />}
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <button
            onClick={startPrediction}
            disabled={!(province && hospitalName && department && medicalRecordId && geneTag && selectedImage) || isPredicting}
            className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg
              ${!(province && hospitalName && department && medicalRecordId && geneTag && selectedImage)
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : isPredicting 
                  ? 'bg-[#0A2540] text-white opacity-90' 
                  : 'bg-[#0A2540] hover:bg-[#0A2540]/90 text-white hover:shadow-xl hover:-translate-y-0.5'}`}
          >
            {isPredicting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play size={18} />
                Start Prediction
              </>
            )}
          </button>
          <p className="text-xs text-center text-slate-500 mt-4">
            Targeting 40% GDP impact through precision medicine.
          </p>
        </div>
      </aside>

      {/* Main Dashboard */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <header className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-[#0A2540] tracking-tight">Analysis Dashboard</h2>
              <p className="text-slate-500 mt-1">Real-time gene expression mapping from cellular morphology.</p>
            </div>
            <div className="flex items-center gap-4">
              {predictionResult && (
                <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Confidence</p>
                    <p className="text-xl font-bold text-[#10B981]">{(predictionResult.overallConfidence * 100).toFixed(1)}%</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Processing Time</p>
                    <p className="text-xl font-bold text-[#0A2540]">{predictionResult.processingTime}s</p>
                  </div>
                </div>
              )}
              <button 
                onClick={() => setIsGeneLibraryOpen(true)}
                className="p-3 rounded-2xl bg-white shadow-sm border border-slate-100 hover:bg-slate-50 text-slate-600 transition-colors relative"
                title="Gene Library"
              >
                <Database size={24} />
              </button>
              <button 
                onClick={() => setIsHistoryOpen(true)}
                className="p-3 rounded-2xl bg-white shadow-sm border border-slate-100 hover:bg-slate-50 text-slate-600 transition-colors relative"
                title="Prediction History"
              >
                <History size={24} />
                {history.length > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#007bff] rounded-full border-2 border-white"></span>
                )}
              </button>
            </div>
          </header>

          {!selectedImage ? (
            <div className="h-[60vh] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                <Layers size={32} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Awaiting Input Data</h3>
              <p className="text-slate-500 max-w-md text-center">
                Upload a microscopic image from the sidebar to begin the AI-driven gene expression prediction workflow.
              </p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* Image Comparison */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <ImageIcon size={16} className="text-[#0A2540]" />
                    Original Micrograph
                  </h3>
                  <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 relative group">
                    <img src={selectedImage} alt="Original" className="w-full h-full object-cover" />
                  </div>
                </div>
                
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <Layers size={16} className="text-[#10B981]" />
                    Segmentation Mask
                  </h3>
                  <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 relative">
                    {isPredicting ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A2540]/5 backdrop-blur-sm">
                        <div className="w-12 h-12 border-4 border-[#10B981]/30 border-t-[#10B981] rounded-full animate-spin mb-4" />
                        <p className="text-sm font-medium text-[#0A2540] animate-pulse">Running {selectedModel} inference...</p>
                      </div>
                    ) : predictionResult ? (
                      <div className="w-full h-full relative">
                        <img src={selectedImage} alt="Processed" className="w-full h-full object-cover grayscale opacity-50" />
                        {/* Simulated segmentation overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#10B981]/40 via-transparent to-[#0A2540]/40 mix-blend-overlay" />
                        <div className="absolute inset-0" style={{
                          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.4) 0%, transparent 60%)',
                          filter: 'contrast(150%) brightness(120%)'
                        }} />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                        <p className="text-sm">Awaiting prediction...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Results Section */}
              {predictionResult && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                  <div className="grid grid-cols-3 gap-6">
                    
                    {/* Quantitative Data */}
                    <div className="col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
                        <Activity size={16} className="text-[#0A2540]" />
                        Quantitative Morphological Metrics
                      </h3>
                      <div className="grid grid-cols-2 gap-4 h-80">
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center">
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Cell Count</p>
                          <p className="text-4xl font-bold text-[#0A2540]">{predictionResult.quantitativeData?.cellCount || 0}</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center">
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Density (Cells/mm²)</p>
                          <p className="text-4xl font-bold text-[#0A2540]">{predictionResult.quantitativeData?.density || 0}</p>
                        </div>
                        {predictionResult.cellType === 'Neuron' ? (
                          <>
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center">
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Avg Axon Length (µm)</p>
                              <p className="text-4xl font-bold text-[#0A2540]">{predictionResult.quantitativeData?.averageAxonLength || 0}</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center">
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Branching Index</p>
                              <p className="text-4xl font-bold text-[#0A2540]">{predictionResult.quantitativeData?.branchingIndex || 0}<span className="text-lg text-slate-400 font-normal">/10</span></p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center">
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Pleomorphism Score</p>
                              <p className="text-4xl font-bold text-[#0A2540]">{predictionResult.quantitativeData?.nuclearPleomorphismScore || 0}<span className="text-lg text-slate-400 font-normal">/10</span></p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center">
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">N/C Ratio</p>
                              <p className="text-4xl font-bold text-[#0A2540]">{predictionResult.quantitativeData?.ncRatio || 0}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Health Assessment */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
                      <h3 className="text-sm font-semibold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
                        <AlertCircle size={16} className="text-[#0A2540]" />
                        Health Assessment
                      </h3>
                      <div className="flex-1 space-y-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Nucleus State</p>
                          <p className="font-semibold text-[#0A2540]">{predictionResult.healthAssessment?.nucleusState || 'Unknown'}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Cytoskeleton Integrity</p>
                          <p className="font-semibold text-[#0A2540]">{predictionResult.healthAssessment?.cytoskeletonIntegrity || 'Unknown'}</p>
                        </div>
                        <div className={`p-4 rounded-xl border ${predictionResult.healthAssessment?.overallRisk?.includes('High') ? 'bg-red-50 border-red-100 text-red-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                          <p className="text-xs uppercase tracking-wider mb-1 opacity-80">Overall Risk</p>
                          <p className="font-bold">{predictionResult.healthAssessment?.overallRisk || 'Unknown'}</p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Trigger Button */}
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={handleViewReport}
                      className="bg-[#000080] hover:bg-[#000080]/90 text-white font-semibold py-4 px-8 rounded-full shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl flex items-center gap-3"
                    >
                      <Microscope size={20} />
                      View AI Diagnostic Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* History Sidebar */}
      {isHistoryOpen && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsHistoryOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-100">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#007bff]/10 flex items-center justify-center text-[#007bff]">
                  <History size={18} />
                </div>
                <h2 className="text-lg font-bold text-[#0A2540]">Prediction History</h2>
              </div>
              <button 
                onClick={() => setIsHistoryOpen(false)}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
              {history.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <History size={32} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No prediction history yet.</p>
                </div>
              ) : (
                history.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => loadHistoryItem(item)}
                    className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#007bff]/30 cursor-pointer transition-all group"
                  >
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                        <img src={item.image} alt="Thumbnail" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400 mb-1">{item.timestamp}</p>
                        <p className="text-sm font-semibold text-[#0A2540] truncate">
                          {item.result.cellAnalysis ? item.result.cellAnalysis.split('.')[0] : 'Analysis Result'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                            {item.model}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] font-medium">
                            Conf: {(item.result.overallConfidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Gene Library Modal */}
      {isGeneLibraryOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#000080]/10 flex items-center justify-center text-[#000080]">
                  <Database size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#0A2540]">Gene Library & Longitudinal History</h2>
                  <p className="text-sm text-slate-500">Hệ thống lưu trữ và truy xuất lịch sử phân tích Gene</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsGeneLibraryOpen(false); setSelectedGeneTag(null); }}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden flex">
              {/* Gene List */}
              <div className="w-1/3 border-r border-slate-100 bg-slate-50/30 overflow-y-auto p-4 space-y-2">
                {Array.from(new Set(history.map(h => h.geneTag))).map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedGeneTag(tag)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${selectedGeneTag === tag ? 'bg-white border-[#007bff] shadow-md ring-1 ring-[#007bff]' : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#0A2540]">{tag}</span>
                      <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                        {history.filter(h => h.geneTag === tag).length} records
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      Latest: {history.find(h => h.geneTag === tag)?.timestamp}
                    </p>
                  </button>
                ))}
                {history.length === 0 && (
                  <div className="text-center py-10 text-slate-400">
                    <Database size={32} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Chưa có dữ liệu Gene nào.</p>
                  </div>
                )}
              </div>
              
              {/* Timeline View */}
              <div className="flex-1 overflow-y-auto p-6 bg-white">
                {selectedGeneTag ? (
                  <div className="space-y-8">
                    <h3 className="text-xl font-bold text-[#0A2540] mb-6 border-b pb-4">Timeline: {selectedGeneTag}</h3>
                    <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
                      {history.filter(h => h.geneTag === selectedGeneTag).map((item, index) => (
                        <div key={item.id} className="relative pl-8">
                          <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-[#10B981]" />
                          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <p className="text-sm font-bold text-[#0A2540]">{item.timestamp}</p>
                                <p className="text-xs text-slate-500 mt-1">BA: {item.medicalRecordId} | {item.hospitalName} - {item.department}</p>
                              </div>
                              <span className="text-xs font-medium bg-[#0A2540]/5 text-[#0A2540] px-3 py-1 rounded-full">
                                Model: {item.model}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="bg-white p-3 rounded-xl border border-slate-100">
                                <p className="text-[10px] uppercase text-slate-400 font-semibold mb-1">Mật độ Nơ-ron</p>
                                <p className="text-lg font-bold text-[#0A2540]">{item.result.quantitativeData?.density} <span className="text-xs font-normal text-slate-500">/mm²</span></p>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-slate-100">
                                <p className="text-[10px] uppercase text-slate-400 font-semibold mb-1">Sợi trục TB</p>
                                <p className="text-lg font-bold text-[#0A2540]">{item.result.quantitativeData?.averageAxonLength} <span className="text-xs font-normal text-slate-500">µm</span></p>
                              </div>
                            </div>
                            
                            <div className="flex gap-4 items-center">
                              <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                <img src={item.image} alt="Micrograph" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-slate-700 line-clamp-2">{item.result.cellAnalysis}</p>
                              </div>
                              <button 
                                onClick={() => {
                                  loadHistoryItem(item);
                                  setIsGeneLibraryOpen(false);
                                }}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-[#007bff] hover:bg-slate-50 transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <GitCommit size={48} className="mb-4 opacity-20" />
                    <p>Chọn một Mã Gene để xem lịch sử phân tích</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Overlay */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#000080]/10 flex items-center justify-center text-[#000080]">
                  <Microscope size={20} />
                </div>
                <h3 className="text-xl font-bold text-[#0A2540]">Silicon - Detailed Genetic Analysis</h3>
              </div>
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-8 overflow-y-auto flex-1 bg-slate-50">
              {isGeneratingReport ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-6">
                  <div className="w-16 h-16 border-4 border-[#000080]/20 border-t-[#000080] rounded-full animate-spin" />
                  <p className="text-[#0A2540] font-medium animate-pulse text-lg">Đang phân tích dữ liệu biểu hiện gene...</p>
                </div>
              ) : (
                <div className="prose prose-slate max-w-none prose-headings:text-[#0A2540] prose-a:text-[#10B981] prose-strong:text-[#000080]">
                  <Markdown>{reportContent || 'Không có dữ liệu báo cáo.'}</Markdown>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
