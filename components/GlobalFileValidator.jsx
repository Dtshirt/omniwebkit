"use client";

import { useEffect } from "react";
import { toast } from "react-hot-toast";

// Constants for file size limits
const VIDEO_LIMIT = 1024 * 1024 * 1024; // 1 GB
const GENERAL_LIMIT = 500 * 1024 * 1024; // 500 MB

export default function GlobalFileValidator() {
  useEffect(() => {
    const handleFileEvent = (e) => {
      // Determine the files array based on the event type
      let files = null;
      if (e.type === "change" && e.target && e.target.type === "file") {
        files = e.target.files;
      } else if (e.type === "drop" && e.dataTransfer && e.dataTransfer.files) {
        files = e.dataTransfer.files;
      }

      if (files && files.length > 0) {
        let totalSize = 0;
        let containsVideo = false;

        // Iterate through all selected/dropped files
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          totalSize += file.size;
          if (file.type.startsWith("video/")) {
            containsVideo = true;
          }
        }

        const applicableLimit = containsVideo ? VIDEO_LIMIT : GENERAL_LIMIT;
        
        if (totalSize > applicableLimit) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          
          if (e.type === "change" && e.target) {
            e.target.value = "";
          }
          
          const formattedLimit = containsVideo ? "1GB" : "500MB";
          const formattedSize = (totalSize / (1024 * 1024)).toFixed(1) + "MB";
          
          toast.error(
            `Upload Limit Exceeded!\nYour selection (${formattedSize}) exceeds the maximum allowed size of ${formattedLimit}.`,
            {
              duration: 5000,
              icon: '⚠️',
              style: {
                borderRadius: '10px',
                background: '#fff',
                color: '#333',
                maxWidth: '400px',
              },
            }
          );
        }
      }
    };

    // Attach to both change (file inputs) and drop (drag & drop) events
    window.addEventListener("change", handleFileEvent, true);
    window.addEventListener("drop", handleFileEvent, true);

    return () => {
      window.removeEventListener("change", handleFileEvent, true);
      window.removeEventListener("drop", handleFileEvent, true);
    };
  }, []);

  return null;
}
