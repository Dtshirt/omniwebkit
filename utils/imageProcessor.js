/**
 * Image Processing Utilities with Watermark Support
 * Handles image conversion, compression, resizing, and watermarking
 */

/**
 * Advanced Watermark Configuration
 */
export const WATERMARK_PRESETS = {
  subtle: {
    opacity: 0.3,
    fontSize: 14,
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 6
  },
  standard: {
    opacity: 0.7,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8
  },
  bold: {
    opacity: 0.9,
    fontSize: 20,
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10
  }
};


// Watermark configuration
// const WATERMARK_CONFIG = {
//   text: 'omniwebkit.com',
//   fontSize: 16,
//   color: 'rgba(255, 255, 255, 0.8)',
//   backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   padding: 8,
//   position: 'bottom-right',
//   margin: 10
// };

/**
 * Add watermark to canvas
 */
// export const addWatermark = (canvas, config = WATERMARK_CONFIG) => {
//   const ctx = canvas.getContext('2d');
//   const { text, fontSize, color, backgroundColor, padding, position, margin } = config;

//   // Set font
//   ctx.font = `${fontSize}px Arial, sans-serif`;
//   ctx.textBaseline = 'middle';

//   // Measure text
//   const textMetrics = ctx.measureText(text);
//   const textWidth = textMetrics.width;
//   const textHeight = fontSize;

//   // Calculate position
//   let x, y;
//   switch (position) {
//     case 'top-left':
//       x = margin;
//       y = margin + textHeight / 2;
//       break;
//     case 'top-right':
//       x = canvas.width - textWidth - padding * 2 - margin;
//       y = margin + textHeight / 2;
//       break;
//     case 'bottom-left':
//       x = margin;
//       y = canvas.height - margin - textHeight / 2;
//       break;
//     case 'bottom-right':
//     default:
//       x = canvas.width - textWidth - padding * 2 - margin;
//       y = canvas.height - margin - textHeight / 2;
//       break;
//   }

//   // Draw background
//   ctx.fillStyle = backgroundColor;
//   ctx.fillRect(x - padding, y - textHeight / 2 - padding, textWidth + padding * 2, textHeight + padding * 2);

//   // Draw text
//   ctx.fillStyle = color;
//   ctx.fillText(text, x, y);
// };

/**
 * Convert image file to different format with watermark
 */
export const convertImage = async (file, outputFormat, quality = 0.9, addWatermarkFlag = true) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Add watermark if requested
        if (addWatermarkFlag) {
          addWatermark(canvas);
        }

        // Convert to desired format
        const mimeType = `image/${outputFormat}`;
        const dataUrl = canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert image'));
          }
        }, mimeType, quality);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Compress image with watermark  ( OLD CODE )
 */
// export const compressImage = async (file, quality = 0.8, maxWidth = null, maxHeight = null, addWatermarkFlag = true) => {
//   return new Promise((resolve, reject) => {
//     const canvas = document.createElement('canvas');
//     const ctx = canvas.getContext('2d');
//     const img = new Image();

//     img.onload = () => {
//       try {
//         let { width, height } = img;

//         // Calculate new dimensions if limits are set
//         if (maxWidth && width > maxWidth) {
//           height = (height * maxWidth) / width;
//           width = maxWidth;
//         }
//         if (maxHeight && height > maxHeight) {
//           width = (width * maxHeight) / height;
//           height = maxHeight;
//         }

//         canvas.width = width;
//         canvas.height = height;

//         // Draw resized image
//         ctx.drawImage(img, 0, 0, width, height);

//         // Add watermark if requested
//         if (addWatermarkFlag) {
//           addWatermark(canvas);
//         }

//         // Convert with compression
//         canvas.toBlob((blob) => {
//           if (blob) {
//             resolve(blob);
//           } else {
//             reject(new Error('Failed to compress image'));
//           }
//         }, file.type, quality);
//       } catch (error) {
//         reject(error);
//       }
//     };

//     img.onerror = () => reject(new Error('Failed to load image'));
//     img.src = URL.createObjectURL(file);
//   });
// };

/**
 * Resize image with watermark
 */
export const resizeImage = async (file, width, height, maintainAspectRatio = true, addWatermarkFlag = true) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        let newWidth = width;
        let newHeight = height;

        if (maintainAspectRatio) {
          const aspectRatio = img.width / img.height;
          if (width / height > aspectRatio) {
            newWidth = height * aspectRatio;
          } else {
            newHeight = width / aspectRatio;
          }
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw resized image
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Add watermark if requested
        if (addWatermarkFlag) {
          addWatermark(canvas);
        }

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to resize image'));
          }
        }, file.type, 0.9);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Crop image with watermark
 */
// export const cropImage = async (file, x, y, width, height, addWatermarkFlag = true) => {
//   return new Promise((resolve, reject) => {
//     const canvas = document.createElement('canvas');
//     const ctx = canvas.getContext('2d');
//     const img = new Image();

//     img.onload = () => {
//       try {
//         canvas.width = width;
//         canvas.height = height;

//         // Draw cropped image
//         ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

//         // Add watermark if requested
//         if (addWatermarkFlag) {
//           addWatermark(canvas);
//         }

//         canvas.toBlob((blob) => {
//           if (blob) {
//             resolve(blob);
//           } else {
//             reject(new Error('Failed to crop image'));
//           }
//         }, file.type, 0.9);
//       } catch (error) {
//         reject(error);
//       }
//     };

//     img.onerror = () => reject(new Error('Failed to load image'));
//     img.src = URL.createObjectURL(file);
//   });
// };

/**
 * Rotate image with watermark
 */
export const rotateImage = async (file, degrees, addWatermarkFlag = true) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        const radians = (degrees * Math.PI) / 180;
        const sin = Math.abs(Math.sin(radians));
        const cos = Math.abs(Math.cos(radians));

        const newWidth = img.height * sin + img.width * cos;
        const newHeight = img.height * cos + img.width * sin;

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Translate to center and rotate
        ctx.translate(newWidth / 2, newHeight / 2);
        ctx.rotate(radians);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        // Reset transformation for watermark
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Add watermark if requested
        if (addWatermarkFlag) {
          addWatermark(canvas);
        }

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to rotate image'));
          }
        }, file.type, 0.9);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Apply image filters with watermark
 */
export const applyImageFilter = async (file, filterType, intensity = 1, addWatermarkFlag = true) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Apply filter
        switch (filterType) {
          case 'grayscale':
            ctx.filter = `grayscale(${intensity})`;
            break;
          case 'sepia':
            ctx.filter = `sepia(${intensity})`;
            break;
          case 'brightness':
            ctx.filter = `brightness(${intensity})`;
            break;
          case 'contrast':
            ctx.filter = `contrast(${intensity})`;
            break;
          case 'blur':
            ctx.filter = `blur(${intensity}px)`;
            break;
          default:
            ctx.filter = 'none';
        }

        // Redraw with filter
        ctx.drawImage(img, 0, 0);

        // Reset filter for watermark
        ctx.filter = 'none';

        // Add watermark if requested
        if (addWatermarkFlag) {
          addWatermark(canvas);
        }

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to apply filter'));
          }
        }, file.type, 0.9);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Get image dimensions and metadata
 */
export const getImageInfo = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height,
        size: file.size,
        type: file.type,
        name: file.name
      });
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Download processed image
 */
export const downloadImage = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Batch process images
 */
export const batchProcessImages = async (files, processor, options = {}) => {
  const results = [];

  for (const file of files) {
    try {
      const result = await processor(file, options);
      results.push({ file, result, success: true });
    } catch (error) {
      results.push({ file, error, success: false });
    }
  }

  return results;
};

/**
 * Add text watermark to image
 */
export const addTextWatermark = async (file, watermarkConfig) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Apply text watermark
        addTextToCanvas(ctx, canvas, watermarkConfig);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to add watermark'));
          }
        }, file.type, 0.9);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Add image watermark to image
 */
export const addImageWatermark = async (file, watermarkFile, watermarkConfig) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const watermarkImg = new Image();

    let imagesLoaded = 0;

    const checkIfReady = () => {
      if (imagesLoaded === 2) {
        try {
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw original image
          ctx.drawImage(img, 0, 0);

          // Apply image watermark
          addImageToCanvas(ctx, canvas, watermarkImg, watermarkConfig);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to add watermark'));
            }
          }, file.type, 0.9);
        } catch (error) {
          reject(error);
        }
      }
    };

    img.onload = () => {
      imagesLoaded++;
      checkIfReady();
    };

    watermarkImg.onload = () => {
      imagesLoaded++;
      checkIfReady();
    };

    img.onerror = () => reject(new Error('Failed to load main image'));
    watermarkImg.onerror = () => reject(new Error('Failed to load watermark image'));

    img.src = URL.createObjectURL(file);
    watermarkImg.src = URL.createObjectURL(watermarkFile);
  });
};

/**
 * Add text to canvas
 */
const addTextToCanvas = (ctx, canvas, config) => {
  const {
    text = 'omniwebkit.com',
    fontSize = 16,
    color = '#FFFFFF',
    backgroundColor = 'rgba(0, 0, 0, 0.5)',
    padding = 8,
    position = 'bottom-right',
    margin = 10,
    opacity = 0.7,
    fontFamily = 'Arial',
    rotation = 0
  } = config;

  // Set font
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textBaseline = 'middle';

  // Measure text
  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;
  const textHeight = fontSize;

  // Calculate position
  const positions = calculateWatermarkPosition(
    canvas.width,
    canvas.height,
    textWidth + padding * 2,
    textHeight + padding * 2,
    position,
    margin
  );

  // Save context for rotation
  ctx.save();

  // Apply rotation if specified
  if (rotation !== 0) {
    ctx.translate(positions.x + textWidth / 2, positions.y + textHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-textWidth / 2, -textHeight / 2);
  }

  // Set opacity
  ctx.globalAlpha = opacity;

  // Draw background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(
    rotation !== 0 ? -textWidth / 2 - padding : positions.x - padding,
    rotation !== 0 ? -textHeight / 2 - padding : positions.y - textHeight / 2 - padding,
    textWidth + padding * 2,
    textHeight + padding * 2
  );

  // Draw text
  ctx.fillStyle = color;
  ctx.fillText(
    text,
    rotation !== 0 ? -textWidth / 2 : positions.x,
    rotation !== 0 ? 0 : positions.y
  );

  // Restore context
  ctx.restore();
};

/**
 * Add image to canvas
 */
const addImageToCanvas = (ctx, canvas, watermarkImg, config) => {
  const {
    position = 'bottom-right',
    margin = 10,
    opacity = 0.7,
    scale = 0.2, // Scale relative to main image
    rotation = 0
  } = config;

  // Calculate watermark size
  const maxSize = Math.min(canvas.width, canvas.height) * scale;
  const aspectRatio = watermarkImg.width / watermarkImg.height;

  let watermarkWidth, watermarkHeight;
  if (aspectRatio > 1) {
    watermarkWidth = maxSize;
    watermarkHeight = maxSize / aspectRatio;
  } else {
    watermarkHeight = maxSize;
    watermarkWidth = maxSize * aspectRatio;
  }

  // Calculate position
  const positions = calculateWatermarkPosition(
    canvas.width,
    canvas.height,
    watermarkWidth,
    watermarkHeight,
    position,
    margin
  );

  // Save context
  ctx.save();

  // Apply rotation if specified
  if (rotation !== 0) {
    ctx.translate(positions.x + watermarkWidth / 2, positions.y + watermarkHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-watermarkWidth / 2, -watermarkHeight / 2);
  }

  // Set opacity
  ctx.globalAlpha = opacity;

  // Draw watermark image
  ctx.drawImage(
    watermarkImg,
    rotation !== 0 ? -watermarkWidth / 2 : positions.x,
    rotation !== 0 ? -watermarkHeight / 2 : positions.y,
    watermarkWidth,
    watermarkHeight
  );

  // Restore context
  ctx.restore();
};

/**
 * Calculate watermark position
 */
const calculateWatermarkPosition = (canvasWidth, canvasHeight, itemWidth, itemHeight, position, margin) => {
  let x, y;

  switch (position) {
    case 'top-left':
      x = margin;
      y = margin + itemHeight / 2;
      break;
    case 'top-center':
      x = (canvasWidth - itemWidth) / 2;
      y = margin + itemHeight / 2;
      break;
    case 'top-right':
      x = canvasWidth - itemWidth - margin;
      y = margin + itemHeight / 2;
      break;
    case 'middle-left':
      x = margin;
      y = canvasHeight / 2;
      break;
    case 'middle-center':
      x = (canvasWidth - itemWidth) / 2;
      y = canvasHeight / 2;
      break;
    case 'middle-right':
      x = canvasWidth - itemWidth - margin;
      y = canvasHeight / 2;
      break;
    case 'bottom-left':
      x = margin;
      y = canvasHeight - margin - itemHeight / 2;
      break;
    case 'bottom-center':
      x = (canvasWidth - itemWidth) / 2;
      y = canvasHeight - margin - itemHeight / 2;
      break;
    case 'bottom-right':
    default:
      x = canvasWidth - itemWidth - margin;
      y = canvasHeight - margin - itemHeight / 2;
      break;
  }

  return { x, y };
};

/**
 * Create tiled watermark pattern
 */
export const addTiledWatermark = async (file, watermarkConfig) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Add tiled watermarks
        addTiledTextToCanvas(ctx, canvas, watermarkConfig);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to add tiled watermark'));
          }
        }, file.type, 0.9);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Add tiled text watermarks
 */
const addTiledTextToCanvas = (ctx, canvas, config) => {
  const {
    text = 'omniwebkit.com',
    fontSize = 24,
    color = '#FFFFFF',
    opacity = 0.1,
    spacing = 200,
    rotation = -45
  } = config;

  ctx.save();
  ctx.font = `${fontSize}px Arial`;
  ctx.fillStyle = color;
  ctx.globalAlpha = opacity;

  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;

  // Calculate how many tiles we need
  const tilesX = Math.ceil(canvas.width / spacing) + 2;
  const tilesY = Math.ceil(canvas.height / spacing) + 2;

  for (let i = 0; i < tilesX; i++) {
    for (let j = 0; j < tilesY; j++) {
      const x = i * spacing - spacing;
      const y = j * spacing - spacing;

      ctx.save();
      ctx.translate(x + textWidth / 2, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.fillText(text, -textWidth / 2, 0);
      ctx.restore();
    }
  }

  ctx.restore();
};

/**
 * Enhanced Image Processing Utilities with Advanced Cropping Support
 * Handles image conversion, compression, resizing, cropping, and watermarking
 */

// Enhanced Watermark configuration
const WATERMARK_CONFIG = {
  text: 'omniwebkit.com',
  fontSize: 16,
  color: 'rgba(255, 255, 255, 0.8)',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  padding: 8,
  position: 'bottom-right',
  margin: 10
};

/**
 * Add watermark to canvas with enhanced positioning
 */
export const addWatermark = (canvas, config = WATERMARK_CONFIG) => {
  const ctx = canvas.getContext('2d');
  const { text, fontSize, color, backgroundColor, padding, position, margin } = config;

  // Set font
  ctx.font = `${fontSize}px Arial, sans-serif`;
  ctx.textBaseline = 'middle';

  // Measure text
  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;
  const textHeight = fontSize;

  // Calculate position based on canvas size
  let x, y;
  const minSize = Math.min(canvas.width, canvas.height);
  const scaledFontSize = Math.max(10, Math.min(fontSize, minSize * 0.08));
  const scaledPadding = Math.max(4, padding * (scaledFontSize / fontSize));
  const scaledMargin = Math.max(5, margin * (scaledFontSize / fontSize));

  // Recalculate with scaled font
  ctx.font = `${scaledFontSize}px Arial, sans-serif`;
  const scaledTextMetrics = ctx.measureText(text);
  const scaledTextWidth = scaledTextMetrics.width;
  const scaledTextHeight = scaledFontSize;

  switch (position) {
    case 'top-left':
      x = scaledMargin;
      y = scaledMargin + scaledTextHeight / 2;
      break;
    case 'top-right':
      x = canvas.width - scaledTextWidth - scaledPadding * 2 - scaledMargin;
      y = scaledMargin + scaledTextHeight / 2;
      break;
    case 'bottom-left':
      x = scaledMargin;
      y = canvas.height - scaledMargin - scaledTextHeight / 2;
      break;
    case 'bottom-right':
    default:
      x = canvas.width - scaledTextWidth - scaledPadding * 2 - scaledMargin;
      y = canvas.height - scaledMargin - scaledTextHeight / 2;
      break;
  }

  // Don't add watermark if image is too small
  if (canvas.width < 100 || canvas.height < 50) return;

  // Draw background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(
    x - scaledPadding,
    y - scaledTextHeight / 2 - scaledPadding,
    scaledTextWidth + scaledPadding * 2,
    scaledTextHeight + scaledPadding * 2
  );

  // Draw text
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
};

/**
 * Advanced crop image with precise control
 */
export const cropImage = async (file, cropArea, addWatermarkFlag = true, outputFormat = 'png', quality = 0.9) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Ensure crop area is within image bounds
        const validCropArea = {
          x: Math.max(0, Math.min(cropArea.x, img.width - 1)),
          y: Math.max(0, Math.min(cropArea.y, img.height - 1)),
          width: Math.max(1, Math.min(cropArea.width, img.width - cropArea.x)),
          height: Math.max(1, Math.min(cropArea.height, img.height - cropArea.y))
        };

        canvas.width = validCropArea.width;
        canvas.height = validCropArea.height;

        // Draw cropped portion
        ctx.drawImage(
          img,
          validCropArea.x, validCropArea.y, validCropArea.width, validCropArea.height,
          0, 0, validCropArea.width, validCropArea.height
        );

        // Add watermark if requested
        if (addWatermarkFlag) {
          addWatermark(canvas);
        }

        // Convert to desired format
        const mimeType = outputFormat === 'jpg' ? 'image/jpeg' : `image/${outputFormat}`;
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to crop image'));
          }
        }, mimeType, quality);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Crop image from base64 or data URL
 */
export const cropImageFromDataURL = async (dataURL, cropArea, addWatermarkFlag = true, outputFormat = 'png', quality = 0.9) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Validate and constrain crop area
        const validCropArea = {
          x: Math.max(0, Math.min(cropArea.x, img.width - 1)),
          y: Math.max(0, Math.min(cropArea.y, img.height - 1)),
          width: Math.max(1, Math.min(cropArea.width, img.width - cropArea.x)),
          height: Math.max(1, Math.min(cropArea.height, img.height - cropArea.y))
        };

        canvas.width = validCropArea.width;
        canvas.height = validCropArea.height;

        // Draw cropped image
        ctx.drawImage(
          img,
          validCropArea.x, validCropArea.y, validCropArea.width, validCropArea.height,
          0, 0, validCropArea.width, validCropArea.height
        );

        // Add watermark if requested
        if (addWatermarkFlag) {
          addWatermark(canvas);
        }

        // Return as blob
        const mimeType = outputFormat === 'jpg' ? 'image/jpeg' : `image/${outputFormat}`;
        canvas.toBlob((blob) => {
          if (blob) {
            resolve({
              blob,
              dataURL: canvas.toDataURL(mimeType, quality),
              width: validCropArea.width,
              height: validCropArea.height
            });
          } else {
            reject(new Error('Failed to crop image'));
          }
        }, mimeType, quality);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataURL;
  });
};

/**
 * Crop to specific aspect ratio while maintaining maximum area
 */
export const cropToAspectRatio = async (file, aspectRatio, addWatermarkFlag = true) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        let cropWidth, cropHeight, cropX, cropY;

        const imageAspectRatio = img.width / img.height;

        if (imageAspectRatio > aspectRatio) {
          // Image is wider than desired aspect ratio
          cropHeight = img.height;
          cropWidth = cropHeight * aspectRatio;
          cropX = (img.width - cropWidth) / 2;
          cropY = 0;
        } else {
          // Image is taller than desired aspect ratio
          cropWidth = img.width;
          cropHeight = cropWidth / aspectRatio;
          cropX = 0;
          cropY = (img.height - cropHeight) / 2;
        }

        canvas.width = cropWidth;
        canvas.height = cropHeight;

        // Draw cropped image
        ctx.drawImage(
          img,
          cropX, cropY, cropWidth, cropHeight,
          0, 0, cropWidth, cropHeight
        );

        // Add watermark if requested
        if (addWatermarkFlag) {
          addWatermark(canvas);
        }

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to crop image to aspect ratio'));
          }
        }, file.type, 0.9);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Smart crop - automatically detect and crop to content
 */
export const smartCrop = async (file, addWatermarkFlag = true) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw full image first
        ctx.drawImage(img, 0, 0);

        // Get image data for edge detection
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Simple edge detection to find content bounds
        let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
        const threshold = 10; // Sensitivity threshold

        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const i = (y * canvas.width + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            // Check if pixel has significant content (not background)
            const brightness = (r + g + b) / 3;
            const hasContent = a > 128 && (brightness < 240 || brightness > 15);

            if (hasContent) {
              minX = Math.min(minX, x);
              maxX = Math.max(maxX, x);
              minY = Math.min(minY, y);
              maxY = Math.max(maxY, y);
            }
          }
        }

        // Add some padding to the detected bounds
        const padding = Math.min(canvas.width, canvas.height) * 0.05;
        minX = Math.max(0, minX - padding);
        maxX = Math.min(canvas.width, maxX + padding);
        minY = Math.max(0, minY - padding);
        maxY = Math.min(canvas.height, maxY + padding);

        // If no content detected, use center crop
        if (minX >= maxX || minY >= maxY) {
          const size = Math.min(canvas.width, canvas.height) * 0.8;
          minX = (canvas.width - size) / 2;
          maxX = minX + size;
          minY = (canvas.height - size) / 2;
          maxY = minY + size;
        }

        const cropWidth = maxX - minX;
        const cropHeight = maxY - minY;

        // Create new canvas for cropped result
        const croppedCanvas = document.createElement('canvas');
        const croppedCtx = croppedCanvas.getContext('2d');

        croppedCanvas.width = cropWidth;
        croppedCanvas.height = cropHeight;

        // Draw cropped portion
        croppedCtx.drawImage(
          img,
          minX, minY, cropWidth, cropHeight,
          0, 0, cropWidth, cropHeight
        );

        // Add watermark if requested
        if (addWatermarkFlag) {
          addWatermark(croppedCanvas);
        }

        croppedCanvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to perform smart crop'));
          }
        }, file.type, 0.9);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Circular crop - crop image to circle
 */
export const circularCrop = async (file, addWatermarkFlag = true) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;

        // Create circular clipping path
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
        ctx.clip();

        // Draw image centered
        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;

        ctx.drawImage(
          img,
          offsetX, offsetY, size, size,
          0, 0, size, size
        );

        // Add watermark if requested (after clipping)
        if (addWatermarkFlag) {
          // Reset clipping for watermark
          ctx.save();
          ctx.globalCompositeOperation = 'source-over';
          addWatermark(canvas);
          ctx.restore();
        }

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create circular crop'));
          }
        }, 'image/png', 0.9); // Use PNG to preserve transparency
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Calculate optimal crop area for given aspect ratio
 */
export const calculateOptimalCrop = (imageWidth, imageHeight, aspectRatio) => {
  let cropWidth, cropHeight, cropX, cropY;

  const imageAspectRatio = imageWidth / imageHeight;

  if (imageAspectRatio > aspectRatio) {
    // Image is wider than desired aspect ratio
    cropHeight = imageHeight;
    cropWidth = cropHeight * aspectRatio;
    cropX = (imageWidth - cropWidth) / 2;
    cropY = 0;
  } else {
    // Image is taller than desired aspect ratio  
    cropWidth = imageWidth;
    cropHeight = cropWidth / aspectRatio;
    cropX = 0;
    cropY = (imageHeight - cropHeight) / 2;
  }

  return {
    x: Math.round(cropX),
    y: Math.round(cropY),
    width: Math.round(cropWidth),
    height: Math.round(cropHeight)
  };
};

/**
 * Validate crop area against image dimensions
 */
export const validateCropArea = (cropArea, imageWidth, imageHeight) => {
  return {
    x: Math.max(0, Math.min(cropArea.x, imageWidth - 1)),
    y: Math.max(0, Math.min(cropArea.y, imageHeight - 1)),
    width: Math.max(1, Math.min(cropArea.width, imageWidth - cropArea.x)),
    height: Math.max(1, Math.min(cropArea.height, imageHeight - cropArea.y))
  };
};

/**
 * Professional image compression with multiple optimization techniques
 */
export const compressImage = async (file, quality = 0.8, maxWidth = null, maxHeight = null, addWatermarkFlag = true) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        let { width, height } = img;
        const originalWidth = width;
        const originalHeight = height;

        // Calculate optimal dimensions if limits are set
        if (maxWidth && width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (maxHeight && height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Enable high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Apply white background for JPEG conversion (removes transparency issues)
        if (file.type !== 'image/png') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        // Draw resized image with high quality
        ctx.drawImage(img, 0, 0, width, height);

        // Add watermark if requested
        if (addWatermarkFlag) {
          addWatermark(canvas);
        }

        // Determine optimal output format for compression
        let outputFormat = file.type;
        let compressionQuality = quality;

        // Auto-optimize format for better compression
        if (file.type === 'image/png' && quality < 0.9) {
          // Convert PNG to JPEG for better compression when quality is reduced
          outputFormat = 'image/jpeg';
        }

        // Convert to blob with compression
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        }, outputFormat, compressionQuality);

      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Advanced image compression with format optimization
 */
export const advancedCompressImage = async (file, options = {}) => {
  const {
    quality = 0.8,
    maxWidth = null,
    maxHeight = null,
    format = 'auto', // 'auto', 'jpeg', 'webp', 'png'
    addWatermark = true,
    removeMetadata = true
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        let { width, height } = img;
        const originalWidth = width;
        const originalHeight = height;

        // Smart resizing with aspect ratio preservation
        if (maxWidth && width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (maxHeight && height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        // High-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Smart background handling
        const hasTransparency = file.type === 'image/png' || file.type === 'image/gif';
        if (!hasTransparency || format === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        if (addWatermark) {
          addWatermark(canvas);
        }

        // Smart format selection
        let outputFormat = file.type;
        let outputQuality = quality;

        switch (format) {
          case 'jpeg':
            outputFormat = 'image/jpeg';
            break;
          case 'webp':
            outputFormat = 'image/webp';
            break;
          case 'png':
            outputFormat = 'image/png';
            outputQuality = undefined; // PNG doesn't use quality
            break;
          case 'auto':
          default:
            // Auto-select best format for compression
            if (hasTransparency && quality > 0.8) {
              outputFormat = 'image/png';
              outputQuality = undefined;
            } else if (file.size > 500000) { // Large files > 500KB
              outputFormat = 'image/webp';
            } else {
              outputFormat = 'image/jpeg';
            }
            break;
        }

        canvas.toBlob((blob) => {
          if (blob) {
            const compressionRatio = file.size > 0 ? ((file.size - blob.size) / file.size * 100) : 0;
            resolve({
              blob,
              originalSize: file.size,
              compressedSize: blob.size,
              compressionRatio: Math.max(0, compressionRatio.toFixed(1)),
              originalDimensions: `${originalWidth}×${originalHeight}`,
              newDimensions: `${width}×${height}`,
              format: outputFormat,
              sizeSaved: file.size - blob.size
            });
          } else {
            reject(new Error('Failed to compress image'));
          }
        }, outputFormat, outputQuality);

      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};
