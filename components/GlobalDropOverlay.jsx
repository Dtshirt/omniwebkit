"use client";

import React, { useState, useEffect, useRef } from "react";
import { UploadCloud } from "lucide-react";
import { toast } from "react-hot-toast";

export default function GlobalDropOverlay() {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    const handleDragEnter = (e) => {
      e.preventDefault();
      
      // If there are no file inputs on the current page, the user isn't using a tool. 
      // Do not show the global drop overlay.
      if (document.querySelectorAll('input[type="file"]').length === 0) return;

      dragCounter.current += 1;
      
      // Ensure the dragged item is actually a file, not text or a link
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        const hasFiles = Array.from(e.dataTransfer.items).some(item => item.kind === 'file');
        if (hasFiles) {
          setIsDragging(true);
        }
      }
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      if (document.querySelectorAll('input[type="file"]').length === 0) return;
      
      dragCounter.current -= 1;
      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      // Required to allow a drop
      e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (e) => {
      e.preventDefault();
      setIsDragging(false);
      dragCounter.current = 0;

      if (!e.dataTransfer || !e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

      const fileInputs = document.querySelectorAll('input[type="file"]');
      if (fileInputs.length === 0) return; // No tool active

      // Find the primary file input. Some tools have multiple (like watermark), 
      // routing to the first one is standard behavior.
      const targetInput = fileInputs[0];

      try {
        // We use the browser's native DataTransfer API to securely pass the files into the input
        const dataTransfer = new DataTransfer();
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          dataTransfer.items.add(e.dataTransfer.files[i]);
        }
        targetInput.files = dataTransfer.files;

        // Dispatch a synthetic 'change' event to trick React into processing the files
        const event = new Event('change', { bubbles: true });
        targetInput.dispatchEvent(event);
        
        toast.success("File routed successfully!", {
          id: 'global-drop-success',
          duration: 2000,
          style: {
            borderRadius: '10px',
            background: '#fff',
            color: '#333',
          },
        });
      } catch (err) {
        console.error("Global drop routing failed:", err);
      }
    };

    // Attach to window to catch drops ANYWHERE
    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  if (!isDragging) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md transition-all duration-300 pointer-events-none"
    >
      <div className="bg-white/10 p-12 rounded-full border border-white/20 shadow-2xl animate-pulse mb-8 backdrop-blur-xl">
        <UploadCloud className="w-24 h-24 text-white" />
      </div>
      <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg text-center px-4">
        Drop anywhere to begin
      </h2>
      <p className="text-sky-200 mt-4 text-lg font-medium drop-shadow-md text-center px-4 max-w-lg">
        We'll automatically route your files to the active tool securely.
      </p>
    </div>
  );
}
