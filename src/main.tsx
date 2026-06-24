import {StrictMode, useState} from 'react';
import {createRoot} from 'react-dom/client';
import { Smartphone, Monitor } from 'lucide-react';
import App from './App.tsx';
import './index.css';

function PreviewWrapper() {
  const [isMobilePreview, setIsMobilePreview] = useState(false);

  // If we are inside an iframe OR mobile preview is off, render the actual app
  if (window.top !== window.self || !isMobilePreview) {
    return (
      <>
        {/* Only show the FAB if we are at the top level */}
        {window.top === window.self && (
          <button 
            onClick={() => setIsMobilePreview(true)} 
            className="fixed bottom-4 right-4 z-50 bg-[#1b1b1a] text-[#cfcdc7] p-3 rounded-full shadow-lg hover:bg-[#3a3a37] transition-colors focus-ring"
            title="Switch to Mobile View"
            aria-label="Switch to Mobile View"
          >
            <Smartphone size={20} />
          </button>
        )}
        <App />
      </>
    );
  }

  // Otherwise, render the desktop wrapper with a mobile-sized iframe
  return (
    <div className="min-h-screen bg-[#33312d] flex flex-col items-center justify-center py-10 relative font-sans">
      <button 
        onClick={() => setIsMobilePreview(false)} 
        className="fixed top-4 right-4 z-50 bg-white/10 text-white p-3 rounded-full hover:bg-white/20 transition-colors focus-ring"
        title="Exit Mobile View"
        aria-label="Exit Mobile View"
      >
        <Monitor size={20} />
      </button>
      
      <div className="text-[#a09c93] font-mono text-xs tracking-widest mb-6 uppercase text-center">
        Mobile Preview Active
      </div>

      {/* Mobile Device Frame */}
      <div className="w-[375px] h-[812px] bg-black rounded-[44px] p-3 shadow-2xl relative border-4 border-[#4a4a47]">
        {/* Notch simulation */}
        <div className="absolute top-3 inset-x-0 h-6 flex justify-center z-10 pointer-events-none">
          <div className="w-40 h-6 bg-black rounded-b-[16px]"></div>
        </div>
        
        <div className="w-full h-full bg-white rounded-[32px] overflow-hidden relative">
           <iframe src={window.location.href} className="w-full h-full border-none" title="Mobile Preview" />
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PreviewWrapper />
  </StrictMode>,
);
