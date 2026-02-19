import React, { useContext, useState } from 'react';
import { TerminalContext } from '../../components/TerminalLayout';
import { imgbbService } from '../../services/imgbbService';
import Spinner from '../../components/Spinner';

const MediaTest: React.FC = () => {
  const { addLog } = useContext(TerminalContext);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setPreview(base64);
      
      setLoading(true);
      addLog("INITIATING IMGBB STORAGE UPLOAD", 'cmd');
      addLog(`Asset Profile: ${file.name} | ${Math.round(file.size / 1024)}KB | ${file.type}`);
      
      try {
        const res = await imgbbService.uploadImage(base64);
        if (res.status) {
          addLog("MEDIA_STORE_OK: Asset link generated.", 'success', { url: res.data });
          addLog(`Public link ready for deposit verification node.`, 'info');
        } else {
          addLog(`UPLOAD_FAILURE: ${res.message}`, 'error');
          addLog("Check if ImgBB API key is active or rate-limited.", 'warning');
        }
      } catch (err: any) {
        addLog(`FATAL_ERROR: ${err.message}`, 'error');
      }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 p-10 lg:p-16 rounded-[2.5rem] flex flex-col items-center">
            <div className="text-center mb-10">
               <h3 className="text-white text-3xl font-black tracking-tighter mb-4 uppercase">External Storage Node</h3>
               <p className="text-zinc-500 text-sm max-w-md mx-auto leading-relaxed">
                 Test the manual payment screenshot node. This replaces the need for users to send receipts via WhatsApp.
               </p>
            </div>

            <div className="w-full max-w-md relative group">
               <input 
                 type="file" 
                 accept="image/*" 
                 onChange={handleFileChange}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
               />
               <div className="border-4 border-dashed border-zinc-800 p-20 rounded-[3rem] flex flex-col items-center justify-center transition-all group-hover:border-green-900 group-hover:bg-zinc-900/50 bg-black/20">
                  {loading ? (
                    <Spinner />
                  ) : preview ? (
                    <div className="space-y-4 w-full">
                       <img src={preview} alt="preview" className="w-full h-48 object-cover rounded-2xl border-4 border-zinc-800 shadow-2xl" />
                       <p className="text-green-500 text-[10px] font-black text-center uppercase tracking-widest">Click again to switch asset</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-6">
                       <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-zinc-800 text-zinc-700 group-hover:text-green-500 transition-colors">
                          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                       </div>
                       <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">Drop Receipt Screenshot Here</p>
                    </div>
                  )}
               </div>
            </div>
         </div>

         <div className="lg:col-span-5 space-y-8">
            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl">
               <h4 className="text-white font-black uppercase text-xs tracking-widest mb-6">Diagnostic Status</h4>
               <div className="space-y-4">
                  <StatusRow label="API_KEY_SYNC" status="READY" active />
                  <StatusRow label="CDN_CLUSTER" status="OPTIMAL" active />
                  <StatusRow label="LATENCY_PING" status="12ms" active />
               </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl">
               <h4 className="text-white font-black uppercase text-xs tracking-widest mb-4">Architecture Info</h4>
               <p className="text-zinc-500 text-[11px] leading-relaxed">
                 ImgBB acts as our cold-storage node for binary payment evidence. This keeps our primary database lightweight and focused on transaction meta-data.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

const StatusRow = ({ label, status, active }: any) => (
  <div className="flex items-center justify-between p-4 bg-black rounded-xl border border-zinc-800">
    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
    <div className="flex items-center gap-2">
       <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-red-500'}`}></div>
       <span className={`text-[10px] font-black uppercase ${active ? 'text-green-400' : 'text-red-400'}`}>{status}</span>
    </div>
  </div>
);

export default MediaTest;