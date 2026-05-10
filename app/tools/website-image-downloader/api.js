import { API_V1 } from "@/lib/api-config";

const API_BASE = `${API_V1}/tools/website-image-downloader`;

export async function extractImages(url, options = {}) {
    const { minWidth = 0, minSizeKb = 0, includeCssBackgrounds = true, includeSrcset = true } = options;
    
    const res = await fetch(`${API_BASE}/extract-images`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            url,
            min_width: minWidth,
            min_size_kb: minSizeKb,
            include_css_backgrounds: includeCssBackgrounds,
            include_srcset: includeSrcset
        })
    });

    if (!res.ok) {
        let errStr = "Unknown error";
        try {
            const err = await res.json();
            errStr = err.detail || err.message || errStr;
        } catch {
            errStr = `Server responded with status: ${res.status}`;
        }
        throw new Error(errStr);
    }
    return res.json();
}

export async function downloadSingle(url, filename) {
    const res = await fetch(`${API_BASE}/download-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, filename })
    });
    if (!res.ok) throw new Error("Failed to download image");
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || "image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}

export async function downloadBulk(urls, filenames = []) {
    // 60-second timeout handling using AbortController
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 60000);

    try {
        const res = await fetch(`${API_BASE}/download-bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls, filenames }),
            signal: controller.signal
        });
        
        clearTimeout(id);

        if (!res.ok) throw new Error("Failed to download ZIP");
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = "imagevault_download.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
        clearTimeout(id);
        if (err.name === 'AbortError') {
            throw new Error("Download timed out after 60 seconds.");
        }
        throw err;
    }
}
