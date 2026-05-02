'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Award,
  Upload,
  Download,
  Save,
  Eye,
  Settings,
  Palette,
  Type,
  Image as ImageIcon,
  RotateCw,
  RefreshCw,
  Move,
  Trash2,
  Copy,
  Layers,
  FileText,
  Star,
  Shield,
  Users,
  Calendar,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const CertificateGenerator = () => {
  const canvasRef = useRef(null);
  const [certificateData, setCertificateData] = useState({
    recipientName: 'John Doe',
    courseName: 'Advanced Web Development',
    instituteName: 'Tech Institute',
    completionDate: new Date().toISOString().split('T')[0],
    instructorName: 'Dr. Jane Smith',
    grade: 'A+',
    duration: '6 months',
    certificateId: 'CERT-2024-001'
  });

  const [design, setDesign] = useState({
    template: 'classic',
    backgroundType: 'color',
    backgroundColor: '#ffffff',
    backgroundImage: null,
    borderStyle: 'none',
    borderColor: '#1f2937',
    borderWidth: 8,
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
    accentColor: '#f59e0b'
  });

  const [typography, setTypography] = useState({
    titleFont: 'Playfair Display',
    titleSize: 48,
    titleColor: '#1f2937',
    titleStyle: 'normal',
    nameFont: 'Georgia',
    nameSize: 36,
    nameColor: '#3b82f6',
    nameStyle: 'italic',
    bodyFont: 'Inter',
    bodySize: 16,
    bodyColor: '#4b5563',
    bodyStyle: 'normal'
  });

  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showPreview, setShowPreview] = useState(true);
  const [savedTemplates, setSavedTemplates] = useState([]);

  // Certificate templates
  const templates = [
    { id: 'classic', name: 'Classic', description: 'Traditional formal certificate', preview: '/templates/classic.png' },
    { id: 'modern', name: 'Modern', description: 'Clean contemporary design', preview: '/templates/modern.png' },
    { id: 'elegant', name: 'Elegant', description: 'Sophisticated with ornate details', preview: '/templates/elegant.png' },
    { id: 'corporate', name: 'Corporate', description: 'Professional business style', preview: '/templates/corporate.png' },
    { id: 'academic', name: 'Academic', description: 'University and school focused', preview: '/templates/academic.png' },
    { id: 'achievement', name: 'Achievement', description: 'Awards and recognition', preview: '/templates/achievement.png' }
  ];

  const borderStyles = [
    { id: 'none', name: 'None' },
    { id: 'simple', name: 'Simple' },
    { id: 'elegant', name: 'Elegant' },
    { id: 'decorative', name: 'Decorative' },
    { id: 'double', name: 'Double Line' },
    { id: 'ornate', name: 'Ornate' }
  ];

  const fonts = [
    'Inter', 'Georgia', 'Times New Roman', 'Arial', 'Helvetica',
    'Playfair Display', 'Merriweather', 'Open Sans', 'Lato',
    'Montserrat', 'Roboto', 'Poppins', 'Crimson Text'
  ];

  // Initialize canvas and draw certificate
  const drawCertificate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 850;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    if (design.backgroundType === 'color') {
      ctx.fillStyle = design.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (design.backgroundImage) {
      const img = new Image();
      img.src = design.backgroundImage;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawCertificateContent(ctx);
      };
      return;
    }

    drawCertificateContent(ctx);
  }, [design, certificateData, typography, elements]);

  const drawCertificateContent = (ctx) => {
    const canvas = canvasRef.current;

    // Draw border
    if (design.borderStyle !== 'none') {
      drawBorder(ctx, canvas.width, canvas.height);
    }

    // Draw template-specific elements
    drawTemplateElements(ctx);

    // Draw custom elements (stamps, logos, signatures, text)
    elements.forEach(element => {
      drawElement(ctx, element);
    });

    // Add watermark
    drawWatermark(ctx, canvas.width, canvas.height);
  };

  const drawBorder = (ctx, width, height) => {
    ctx.strokeStyle = design.borderColor;
    ctx.lineWidth = design.borderWidth;

    const margin = design.borderWidth / 2;
    const borderRadius = 20;

    switch (design.borderStyle) {
      case 'simple':
        ctx.strokeRect(margin, margin, width - design.borderWidth, height - design.borderWidth);
        break;
      case 'elegant':
        drawElegantBorder(ctx, width, height, margin);
        break;
      case 'decorative':
        drawDecorativeBorder(ctx, width, height, margin);
        break;
      case 'double':
        ctx.strokeRect(margin, margin, width - design.borderWidth, height - design.borderWidth);
        ctx.strokeRect(margin + 15, margin + 15, width - design.borderWidth - 30, height - design.borderWidth - 30);
        break;
      case 'ornate':
        drawOrnateBorder(ctx, width, height, margin);
        break;
    }
  };

  const drawElegantBorder = (ctx, width, height, margin) => {
    ctx.strokeRect(margin, margin, width - design.borderWidth, height - design.borderWidth);
    ctx.fillStyle = design.borderColor;
    const cornerSize = 40;
    ctx.beginPath();
    ctx.arc(margin + cornerSize, margin + cornerSize, 8, 0, Math.PI * 2);
    ctx.arc(width - margin - cornerSize, margin + cornerSize, 8, 0, Math.PI * 2);
    ctx.arc(margin + cornerSize, height - margin - cornerSize, 8, 0, Math.PI * 2);
    ctx.arc(width - margin - cornerSize, height - margin - cornerSize, 8, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawDecorativeBorder = (ctx, width, height, margin) => {
    ctx.strokeRect(margin, margin, width - design.borderWidth, height - design.borderWidth);
    ctx.fillStyle = design.primaryColor;
    const stepSize = 30;
    for (let x = margin + stepSize; x < width - margin; x += stepSize) {
      ctx.beginPath();
      ctx.rect(x - 2, margin - 5, 4, 10);
      ctx.rect(x - 2, height - margin - 5, 4, 10);
      ctx.fill();
    }
  };

  const drawOrnateBorder = (ctx, width, height, margin) => {
    const innerMargin = margin + 20;
    ctx.strokeStyle = design.borderColor;
    ctx.lineWidth = design.borderWidth;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
    ctx.strokeStyle = design.primaryColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(innerMargin, innerMargin, width - innerMargin * 2, height - innerMargin * 2);
    ctx.setLineDash([]);
    drawCornerOrnaments(ctx, width, height, margin);
  };

  const drawCornerOrnaments = (ctx, width, height, margin) => {
    const ornamentSize = 30;
    ctx.fillStyle = design.accentColor;
    ctx.beginPath();
    ctx.moveTo(margin + 10, margin + 10);
    ctx.lineTo(margin + ornamentSize, margin + 10);
    ctx.lineTo(margin + 10, margin + ornamentSize);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(width - margin - 10, margin + 10);
    ctx.lineTo(width - margin - ornamentSize, margin + 10);
    ctx.lineTo(width - margin - 10, margin + ornamentSize);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(margin + 10, height - margin - 10);
    ctx.lineTo(margin + ornamentSize, height - margin - 10);
    ctx.lineTo(margin + 10, height - margin - ornamentSize);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(width - margin - 10, height - margin - 10);
    ctx.lineTo(width - margin - ornamentSize, height - margin - 10);
    ctx.lineTo(width - margin - 10, height - margin - ornamentSize);
    ctx.closePath();
    ctx.fill();
  };

  const drawTemplateElements = (ctx) => {
    const canvas = canvasRef.current;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    switch (design.template) {
      case 'classic':
        drawClassicTemplate(ctx, centerX, centerY);
        break;
      case 'modern':
        drawModernTemplate(ctx, centerX, centerY);
        break;
      case 'elegant':
        drawElegantTemplate(ctx, centerX, centerY);
        break;
      case 'corporate':
        drawCorporateTemplate(ctx, centerX, centerY);
        break;
      case 'academic':
        drawAcademicTemplate(ctx, centerX, centerY);
        break;
      case 'achievement':
        drawAchievementTemplate(ctx, centerX, centerY);
        break;
    }
  };

  const drawClassicTemplate = (ctx, centerX, centerY) => {
    ctx.fillStyle = typography.titleColor;
    ctx.font = `${typography.titleStyle} ${typography.titleSize}px ${typography.titleFont}`;
    ctx.textAlign = 'center';
    ctx.fillText('Certificate of Completion', centerX, centerY - 200);
    ctx.strokeStyle = design.primaryColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - 200, centerY - 170);
    ctx.lineTo(centerX + 200, centerY - 170);
    ctx.stroke();
    ctx.fillStyle = typography.bodyColor;
    ctx.font = `${typography.bodyStyle} ${typography.bodySize}px ${typography.bodyFont}`;
    ctx.fillText('This is to certify that', centerX, centerY - 120);
    ctx.fillStyle = typography.nameColor;
    ctx.font = `${typography.nameStyle} ${typography.nameSize}px ${typography.nameFont}`;
    ctx.fillText(certificateData.recipientName, centerX, centerY - 70);
    ctx.fillStyle = typography.bodyColor;
    ctx.font = `${typography.bodyStyle} ${typography.bodySize}px ${typography.bodyFont}`;
    ctx.fillText('has successfully completed the course', centerX, centerY - 20);
    ctx.fillStyle = design.primaryColor;
    ctx.font = `bold ${typography.bodySize + 4}px ${typography.bodyFont}`;
    ctx.fillText(certificateData.courseName, centerX, centerY + 20);
    ctx.fillStyle = typography.bodyColor;
    ctx.font = `${typography.bodyStyle} ${typography.bodySize}px ${typography.bodyFont}`;
    ctx.fillText(`at ${certificateData.instituteName}`, centerX, centerY + 60);
    ctx.fillText(`on ${new Date(certificateData.completionDate).toLocaleDateString()}`, centerX, centerY + 100);
    drawSignatureArea(ctx, centerX - 200, centerY + 180, 'Instructor');
    drawSignatureArea(ctx, centerX + 200, centerY + 180, 'Director');
  };

  const drawModernTemplate = (ctx, centerX, centerY) => {
    const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    gradient.addColorStop(0, design.primaryColor);
    gradient.addColorStop(1, design.secondaryColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 50, ctx.canvas.width, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${typography.titleSize}px ${typography.titleFont}`;
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE', centerX, 110);
    ctx.fillStyle = typography.titleColor;
    ctx.font = `${typography.titleStyle} ${typography.titleSize - 10}px ${typography.titleFont}`;
    ctx.fillText('of Achievement', centerX, centerY - 150);
    ctx.fillStyle = typography.bodyColor;
    ctx.font = `${typography.bodyStyle} ${typography.bodySize}px ${typography.bodyFont}`;
    ctx.fillText('Awarded to', centerX, centerY - 100);
    ctx.fillStyle = typography.nameColor;
    ctx.font = `bold ${typography.nameSize}px ${typography.nameFont}`;
    ctx.fillText(certificateData.recipientName, centerX, centerY - 50);
    const detailsY = centerY + 20;
    ctx.fillStyle = typography.bodyColor;
    ctx.font = `${typography.bodyStyle} ${typography.bodySize}px ${typography.bodyFont}`;
    ctx.textAlign = 'left';
    ctx.fillText('Course:', centerX - 300, detailsY);
    ctx.fillText('Institution:', centerX - 300, detailsY + 30);
    ctx.fillText('Date:', centerX - 300, detailsY + 60);
    ctx.fillStyle = design.primaryColor;
    ctx.font = `bold ${typography.bodySize}px ${typography.bodyFont}`;
    ctx.fillText(certificateData.courseName, centerX - 200, detailsY);
    ctx.fillText(certificateData.instituteName, centerX - 200, detailsY + 30);
    ctx.fillText(new Date(certificateData.completionDate).toLocaleDateString(), centerX - 200, detailsY + 60);
    ctx.textAlign = 'center';
    drawModernSignatureArea(ctx, centerX, centerY + 160);
  };

  const drawElegantTemplate = (ctx, centerX, centerY) => {
    ctx.fillStyle = design.primaryColor;
    ctx.font = `italic ${typography.titleSize + 8}px 'Playfair Display'`;
    ctx.textAlign = 'center';
    ctx.fillText('Certificate', centerX, centerY - 220);
    drawFlourish(ctx, centerX, centerY - 190);
    ctx.fillStyle = typography.titleColor;
    ctx.font = `${typography.titleStyle} ${typography.titleSize - 8}px ${typography.titleFont}`;
    ctx.fillText('of Excellence', centerX, centerY - 160);
    ctx.fillStyle = typography.bodyColor;
    ctx.font = `italic ${typography.bodySize}px 'Georgia'`;
    ctx.fillText('This certifies that', centerX, centerY - 110);
    ctx.fillStyle = typography.nameColor;
    ctx.font = `italic bold ${typography.nameSize + 4}px 'Playfair Display'`;
    ctx.fillText(certificateData.recipientName, centerX, centerY - 60);
    ctx.fillStyle = typography.bodyColor;
    ctx.font = `italic ${typography.bodySize}px 'Georgia'`;
    ctx.fillText('has demonstrated exceptional achievement in', centerX, centerY - 10);
    ctx.fillStyle = design.secondaryColor;
    ctx.font = `italic bold ${typography.bodySize + 2}px 'Playfair Display'`;
    ctx.fillText(certificateData.courseName, centerX, centerY + 30);
    ctx.fillStyle = typography.bodyColor;
    ctx.font = `italic ${typography.bodySize - 2}px 'Georgia'`;
    ctx.fillText(`Completed with distinction at ${certificateData.instituteName}`, centerX, centerY + 70);
    ctx.fillText(`this ${new Date(certificateData.completionDate).getDate()}${getOrdinalSuffix(new Date(certificateData.completionDate).getDate())} day of ${new Date(certificateData.completionDate).toLocaleString('default', { month: 'long' })}, ${new Date(certificateData.completionDate).getFullYear()}`, centerX, centerY + 100);
    drawElegantSignatureArea(ctx, centerX - 200, centerY + 160, certificateData.instructorName, 'Course Instructor');
    drawElegantSignatureArea(ctx, centerX + 200, centerY + 160, 'Dr. Academic Director', 'Academic Director');
  };

  const drawCorporateTemplate = (ctx, centerX, centerY) => {
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, ctx.canvas.width, 120);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${typography.titleSize - 8}px 'Inter'`;
    ctx.textAlign = 'center';
    ctx.fillText('PROFESSIONAL CERTIFICATION', centerX, 70);
    ctx.fillStyle = typography.titleColor;
    ctx.font = `bold ${typography.titleSize - 12}px ${typography.titleFont}`;
    ctx.fillText('Certificate of Professional Development', centerX, centerY - 150);
    const sectionY = centerY - 80;
    ctx.fillStyle = typography.bodyColor;
    ctx.font = `${typography.bodyStyle} ${typography.bodySize}px ${typography.bodyFont}`;
    ctx.textAlign = 'left';
    const leftCol = centerX - 250;
    const rightCol = centerX + 50;
    ctx.fillText('Participant:', leftCol, sectionY);
    ctx.fillText('Program:', leftCol, sectionY + 40);
    ctx.fillText('Organization:', leftCol, sectionY + 80);
    ctx.fillText('Completion Date:', leftCol, sectionY + 120);
    ctx.fillText('Duration:', leftCol, sectionY + 160);
    ctx.fillText('Grade:', leftCol, sectionY + 200);
    ctx.fillText('Certificate ID:', leftCol, sectionY + 240);
    ctx.fillStyle = design.primaryColor;
    ctx.font = `bold ${typography.bodySize}px ${typography.bodyFont}`;
    ctx.fillText(certificateData.recipientName, rightCol, sectionY);
    ctx.fillText(certificateData.courseName, rightCol, sectionY + 40);
    ctx.fillText(certificateData.instituteName, rightCol, sectionY + 80);
    ctx.fillText(new Date(certificateData.completionDate).toLocaleDateString(), rightCol, sectionY + 120);
    ctx.fillText(certificateData.duration, rightCol, sectionY + 160);
    ctx.fillText(certificateData.grade, rightCol, sectionY + 200);
    ctx.fillText(certificateData.certificateId, rightCol, sectionY + 240);
    ctx.textAlign = 'center';
    drawCorporateSignatureArea(ctx, centerX, centerY + 220);
  };

  const drawAcademicTemplate = (ctx, centerX, centerY) => {
    drawAcademicCrest(ctx, centerX, centerY - 250);
    ctx.fillStyle = typography.titleColor;
    ctx.font = `bold ${typography.titleSize}px 'Times New Roman'`;
    ctx.textAlign = 'center';
    ctx.fillText(certificateData.instituteName, centerX, centerY - 180);
    ctx.font = `${typography.titleStyle} ${typography.titleSize - 8}px 'Times New Roman'`;
    ctx.fillText('Certificate of Academic Achievement', centerX, centerY - 140);
    ctx.fillStyle = typography.bodyColor;
    ctx.font = `${typography.bodyStyle} ${typography.bodySize}px 'Times New Roman'`;
    ctx.fillText('The Board of Directors and Faculty hereby certify that', centerX, centerY - 90);
    ctx.fillStyle = typography.nameColor;
    ctx.font = `bold ${typography.nameSize}px 'Times New Roman'`;
    ctx.fillText(certificateData.recipientName, centerX, centerY - 40);
    ctx.fillStyle = typography.bodyColor;
    ctx.font = `${typography.bodyStyle} ${typography.bodySize}px 'Times New Roman'`;
    ctx.fillText('has fulfilled all requirements and successfully completed', centerX, centerY + 10);
    ctx.fillStyle = design.primaryColor;
    ctx.font = `bold ${typography.bodySize + 2}px 'Times New Roman'`;
    ctx.fillText(certificateData.courseName, centerX, centerY + 50);
    ctx.fillStyle = typography.bodyColor;
    ctx.font = `${typography.bodyStyle} ${typography.bodySize}px 'Times New Roman'`;
    ctx.fillText(`with a grade of ${certificateData.grade}`, centerX, centerY + 90);
    ctx.fillText(`Conferred this ${new Date(certificateData.completionDate).toLocaleDateString()}`, centerX, centerY + 130);
    drawAcademicSeal(ctx, centerX - 300, centerY + 180);
    drawAcademicSignatureArea(ctx, centerX + 100, centerY + 180, certificateData.instructorName, 'Dean of Studies');
  };

  const drawAchievementTemplate = (ctx, centerX, centerY) => {
    drawAchievementBadge(ctx, centerX, centerY - 240);
    ctx.fillStyle = design.primaryColor;
    ctx.font = `bold ${typography.titleSize}px ${typography.titleFont}`;
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE OF ACHIEVEMENT', centerX, centerY - 120);
    drawRibbon(ctx, centerX, centerY - 90);
    ctx.fillStyle = typography.bodyColor;
    ctx.font = `${typography.bodyStyle} ${typography.bodySize + 2}px ${typography.bodyFont}`;
    ctx.fillText('In recognition of outstanding performance', centerX, centerY - 40);
    ctx.fillStyle = typography.nameColor;
    ctx.font = `bold ${typography.nameSize}px ${typography.nameFont}`;
    ctx.fillText(certificateData.recipientName, centerX, centerY + 10);
    ctx.fillStyle = typography.bodyColor;
    ctx.font = `${typography.bodyStyle} ${typography.bodySize}px ${typography.bodyFont}`;
    ctx.fillText('for exceptional achievement in', centerX, centerY + 50);
    ctx.fillStyle = design.accentColor;
    ctx.font = `bold ${typography.bodySize + 4}px ${typography.bodyFont}`;
    ctx.fillText(certificateData.courseName, centerX, centerY + 90);
    ctx.fillStyle = typography.bodyColor;
    ctx.font = `${typography.bodyStyle} ${typography.bodySize - 2}px ${typography.bodyFont}`;
    ctx.fillText(`Achieved: ${new Date(certificateData.completionDate).toLocaleDateString()}`, centerX, centerY + 140);
    ctx.fillText(`Performance Level: ${certificateData.grade}`, centerX, centerY + 170);
    drawAchievementSignature(ctx, centerX, centerY + 220);
  };

  const drawSignatureArea = (ctx, x, y, title) => {
    ctx.strokeStyle = typography.bodyColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 80, y);
    ctx.lineTo(x + 80, y);
    ctx.stroke();
    ctx.fillStyle = typography.bodyColor;
    ctx.font = `${typography.bodyStyle} ${typography.bodySize - 2}px ${typography.bodyFont}`;
    ctx.textAlign = 'center';
    ctx.fillText(title, x, y + 20);
  };

  const drawModernSignatureArea = (ctx, x, y) => {
    ctx.fillStyle = design.primaryColor;
    ctx.font = `${typography.bodyStyle} ${typography.bodySize - 2}px ${typography.bodyFont}`;
    ctx.textAlign = 'center';
    ctx.fillText('Authorized by', x, y);
    ctx.fillText(certificateData.instructorName, x, y + 25);
    ctx.strokeStyle = design.primaryColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 100, y + 35);
    ctx.lineTo(x + 100, y + 35);
    ctx.stroke();
  };

  const drawElegantSignatureArea = (ctx, x, y, name, title) => {
    ctx.strokeStyle = design.primaryColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 80, y);
    ctx.lineTo(x + 80, y);
    ctx.stroke();
    ctx.fillStyle = typography.bodyColor;
    ctx.font = `italic ${typography.bodySize - 2}px 'Georgia'`;
    ctx.textAlign = 'center';
    ctx.fillText(name, x, y + 20);
    ctx.fillText(title, x, y + 40);
  };

  const drawCorporateSignatureArea = (ctx, x, y) => {
    ctx.strokeStyle = design.primaryColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 150, y - 30, 300, 80);
    ctx.fillStyle = typography.bodyColor;
    ctx.font = `bold ${typography.bodySize - 2}px 'Inter'`;
    ctx.textAlign = 'center';
    ctx.fillText('Digitally Verified', x, y - 10);
    ctx.fillText(certificateData.instructorName, x, y + 10);
    ctx.fillText('Program Director', x, y + 30);
  };


  //  Below code can be used to draw a more detailed academic crest if needed   

  const drawAcademicCrest = (ctx, x, y) => {
    // ctx.strokeStyle = design.primaryColor;
    // ctx.lineWidth = 3;
    // ctx.beginPath();
    // ctx.arc(x, y, 40, 0, Math.PI * 2);
    // ctx.stroke();
    // ctx.fillStyle = design.primaryColor;
    // ctx.font = 'bold 24px serif';
    // ctx.textAlign = 'center';
    // ctx.fillText('CREST', x, y + 8);
  };

  const drawAcademicSeal = (ctx, x, y) => {
    // ctx.fillStyle = design.primaryColor;
    // ctx.beginPath();
    // ctx.arc(x, y, 50, 0, Math.PI * 2);
    // ctx.fill();
    // ctx.fillStyle = '#ffffff';
    // ctx.font = 'bold 12px serif';
    // ctx.textAlign = 'center';
    // ctx.fillText('OFFICIAL', x, y - 5);
    // ctx.fillText('SEAL', x, y + 10);
  };

  const drawAcademicSignatureArea = (ctx, x, y, name, title) => {
    ctx.strokeStyle = typography.bodyColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 80, y);
    ctx.lineTo(x + 80, y);
    ctx.stroke();
    ctx.fillStyle = typography.bodyColor;
    ctx.font = `${typography.bodyStyle} ${typography.bodySize - 2}px 'Times New Roman'`;
    ctx.textAlign = 'center';
    ctx.fillText(name, x, y + 20);
    ctx.fillText(title, x, y + 40);
  };

  const drawAchievementBadge = (ctx, x, y) => {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 60);
    gradient.addColorStop(0, design.accentColor);
    gradient.addColorStop(1, design.primaryColor);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 60, 0, Math.PI * 2);
    ctx.fill();
    drawStar(ctx, x, y, 30, 5);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.stroke();
  };

  const drawStar = (ctx, x, y, radius, points) => {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    const angle = (Math.PI * 2) / points;
    const halfAngle = angle / 2;
    ctx.moveTo(x + radius * Math.cos(-Math.PI / 2), y + radius * Math.sin(-Math.PI / 2));
    for (let i = 1; i < points * 2; i++) {
      const r = i % 2 === 0 ? radius : radius * 0.5;
      const a = -Math.PI / 2 + i * halfAngle;
      ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
    }
    ctx.closePath();
    ctx.fill();
  };

  const drawRibbon = (ctx, x, y) => {
    const gradient = ctx.createLinearGradient(x - 150, y, x + 150, y);
    gradient.addColorStop(0, design.primaryColor);
    gradient.addColorStop(0.5, design.accentColor);
    gradient.addColorStop(1, design.primaryColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(x - 150, y - 10, 300, 20);
    ctx.beginPath();
    ctx.moveTo(x - 150, y - 10);
    ctx.lineTo(x - 170, y);
    ctx.lineTo(x - 150, y + 10);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 150, y - 10);
    ctx.lineTo(x + 170, y);
    ctx.lineTo(x + 150, y + 10);
    ctx.closePath();
    ctx.fill();
  };

  const drawAchievementSignature = (ctx, x, y) => {
    ctx.fillStyle = design.primaryColor;
    ctx.font = `bold ${typography.bodySize}px ${typography.bodyFont}`;
    ctx.textAlign = 'center';
    ctx.fillText('Certified by:', x, y - 20);
    ctx.fillText(certificateData.instructorName, x, y);
    ctx.fillText(certificateData.instituteName, x, y + 20);
  };

  const drawFlourish = (ctx, x, y) => {
    ctx.strokeStyle = design.accentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 50, y);
    ctx.quadraticCurveTo(x - 25, y - 10, x, y);
    ctx.quadraticCurveTo(x + 25, y - 10, x + 50, y);
    ctx.stroke();
  };

  const drawElement = (ctx, element) => {
    ctx.save();
    ctx.translate(element.x, element.y);
    ctx.rotate((element.rotation * Math.PI) / 180);
    ctx.globalAlpha = element.opacity;

    switch (element.type) {
      case 'stamp':
      case 'logo':
        if (element.image) {
          const img = new Image();
          img.src = element.image;
          if (img.complete) {
            ctx.drawImage(
              img,
              -element.width / 2,
              -element.height / 2,
              element.width,
              element.height
            );
          } else {
            img.onload = () => {
              ctx.drawImage(
                img,
                -element.width / 2,
                -element.height / 2,
                element.width,
                element.height
              );
              drawCertificate(); // Redraw to ensure image is displayed
            };
          }
        }
        break;
      case 'text':
      case 'signature':
        ctx.fillStyle = element.color || '#000000';
        ctx.font = `${element.fontStyle} ${element.fontSize}px ${element.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.fillText(element.text, 0, 0);
        break;
    }

    ctx.restore();

    if (selectedElement?.id === element.id) {
      drawSelectionBorder(ctx, element);
    }
  };

  const drawSelectionBorder = (ctx, element) => {
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(
      element.x - element.width / 2 - 5,
      element.y - element.height / 2 - 5,
      element.width + 10,
      element.height + 10
    );
    ctx.setLineDash([]);
  };

  const drawWatermark = (ctx, width, height) => {
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#000000';
    ctx.font = '12px Inter';
    ctx.textAlign = 'right';
    ctx.fillText('Generated by OmniWebKit.com', width - 20, height - 10);
    ctx.restore();
  };

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const onStampDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newElement = {
          id: Date.now(),
          type: 'stamp',
          image: e.target.result,
          x: 600,
          y: 425,
          width: 100,
          height: 100,
          rotation: 0,
          opacity: 1
        };
        setElements(prev => [...prev, newElement]);
        setSelectedElement(newElement);
        toast.success('Stamp added successfully!');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const onLogoDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newElement = {
          id: Date.now(),
          type: 'logo',
          image: e.target.result,
          x: 600,
          y: 425,
          width: 120,
          height: 120,
          rotation: 0,
          opacity: 1
        };
        setElements(prev => [...prev, newElement]);
        setSelectedElement(newElement);
        toast.success('Logo added successfully!');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const onBackgroundDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDesign(prev => ({
          ...prev,
          backgroundType: 'image',
          backgroundImage: e.target.result
        }));
        toast.success('Background image set!');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const stampDropzone = useDropzone({
    onDrop: onStampDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] },
    multiple: false
  });

  const logoDropzone = useDropzone({
    onDrop: onLogoDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] },
    multiple: false
  });

  const backgroundDropzone = useDropzone({
    onDrop: onBackgroundDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] },
    multiple: false
  });

  const handleCanvasMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * canvasRef.current.width) / rect.width;
    const y = ((e.clientY - rect.top) * canvasRef.current.height) / rect.height;

    const clickedElement = elements.find(element => {
      const dx = x - element.x;
      const dy = y - element.y;
      return Math.abs(dx) < element.width / 2 && Math.abs(dy) < element.height / 2;
    });

    if (clickedElement) {
      setSelectedElement(clickedElement);
      setIsDragging(true);
      setDragOffset({
        x: x - clickedElement.x,
        y: y - clickedElement.y
      });
    } else {
      setSelectedElement(null);
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDragging || !selectedElement) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * canvasRef.current.width) / rect.width;
    const y = ((e.clientY - rect.top) * canvasRef.current.height) / rect.height;

    const newElements = elements.map(element => {
      if (element.id === selectedElement.id) {
        return {
          ...element,
          x: x - dragOffset.x,
          y: y - dragOffset.y
        };
      }
      return element;
    });

    setElements(newElements);
    setSelectedElement({ ...selectedElement, x: x - dragOffset.x, y: y - dragOffset.y });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  const updateSelectedElement = (updates) => {
    if (!selectedElement) return;

    const newElements = elements.map(element => {
      if (element.id === selectedElement.id) {
        const updatedElement = { ...element, ...updates };
        setSelectedElement(updatedElement);
        return updatedElement;
      }
      return element;
    });

    setElements(newElements);
  };

  const deleteSelectedElement = () => {
    if (!selectedElement) return;

    setElements(prev => prev.filter(element => element.id !== selectedElement.id));
    setSelectedElement(null);
    toast.success('Element deleted');
  };

  const duplicateSelectedElement = () => {
    if (!selectedElement) return;

    const newElement = {
      ...selectedElement,
      id: Date.now(),
      x: selectedElement.x + 20,
      y: selectedElement.y + 20
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement);
    toast.success('Element duplicated');
  };

  const saveTemplate = () => {
    const template = {
      id: Date.now(),
      name: `Custom Template ${savedTemplates.length + 1}`,
      design,
      typography,
      elements,
      thumbnail: canvasRef.current.toDataURL('image/png', 0.3)
    };

    setSavedTemplates(prev => [...prev, template]);
    localStorage.setItem('certificateTemplates', JSON.stringify([...savedTemplates, template]));
    toast.success('Template saved successfully!');
  };

  const loadTemplate = (template) => {
    setDesign(template.design);
    setTypography(template.typography);
    setElements(template.elements);
    toast.success('Template loaded!');
  };

  const downloadCertificate = (format = 'png') => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');

    switch (format) {
      case 'png':
        link.download = `certificate-${certificateData.recipientName.replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL('image/png');
        break;
      case 'jpg':
        link.download = `certificate-${certificateData.recipientName.replace(/\s+/g, '-')}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        break;
      case 'pdf':
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`certificate-${certificateData.recipientName.replace(/\s+/g, '-')}.pdf`);
        toast.success('Certificate PDF downloaded!');
        return;
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Certificate downloaded!');
  };

  useEffect(() => {
    drawCertificate();
  }, [drawCertificate]);

  useEffect(() => {
    const saved = localStorage.getItem('certificateTemplates');
    if (saved) {
      setSavedTemplates(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs items={[{ name: 'Certificate Generator', href: '/tools/certificate-generator' }]} />
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl mb-4 shadow-lg shadow-amber-500/30">
            <Award className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Professional Certificate Generator
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Create professional certificates for institutions, organizations, and businesses.
            Add custom stamps, logos, signatures, and personalise every detail.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3 relative">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sticky top-20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Certificate Preview</h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                  >
                    <Eye className="h-4 w-4" />
                    <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadCertificate('png')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-amber-500/20 transition"
                    >
                      <Download className="h-4 w-4" />
                      Download PNG
                    </button>
                    <button
                      onClick={() => downloadCertificate('jpg')}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition"
                    >
                      JPG
                    </button>
                    <button
                      onClick={() => downloadCertificate('pdf')}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition"
                    >
                      PDF
                    </button>
                  </div>
                </div>
              </div>

              {showPreview && (
                <div className="relative bg-slate-100 dark:bg-slate-900 p-4 rounded-xl overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-auto border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg cursor-pointer select-none"
                    style={{ maxHeight: '600px', touchAction: 'none' }}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                  />
                  <div className="absolute top-6 left-6 bg-black/70 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                      <Move className="h-4 w-4" />
                      <span>Click elements to select • Drag to move • Use controls to adjust</span>
                    </div>
                  </div>
                  {elements.length > 0 && (
                    <div className="absolute top-6 right-6 bg-amber-600 text-white px-3 py-2 rounded-lg text-sm font-medium">
                      {elements.length} element{elements.length !== 1 ? 's' : ''} on certificate
                    </div>
                  )}
                  {selectedElement && (
                    <div className="absolute bottom-6 left-6 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2">
                      <Layers className="h-4 w-4" />
                      <span>
                        Selected: {selectedElement.type} -
                        Position: ({Math.round(selectedElement.x)}, {Math.round(selectedElement.y)}) -
                        Size: {selectedElement.width}×{selectedElement.height}
                      </span>
                    </div>
                  )}
                  {/* <div className="absolute bottom-6 right-6 bg-gray-800 text-gray-900 dark:text-white px-2 py-1 rounded text-xs font-mono">
                    <div>Canvas: {canvasRef.current?.width}×{canvasRef.current?.height}</div>
                    <div>Elements: {elements.length}</div>
                    <div>Dragging: {isDragging ? 'Yes' : 'No'}</div>
                  </div> */}
                  {/* <div className="absolute top-20 left-6">
                    <button
                      onClick={() => {
                        const testElement = {
                          id: Date.now(),
                          type: 'text',
                          text: 'TEST ELEMENT',
                          x: 600,
                          y: 425,
                          fontSize: 24,
                          fontFamily: 'Inter',
                          fontStyle: 'bold',
                          color: '#000000',
                          width: 150,
                          height: 30,
                          rotation: 0,
                          opacity: 1
                        };
                        setElements(prev => [...prev, testElement]);
                        setSelectedElement(testElement);
                        toast.success('Test element added at (600, 425)');
                      }}
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Add Test Element
                    </button>
                  </div> */}
                </div>
              )}

              {selectedElement && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                      Selected: {selectedElement.type} Element
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={duplicateSelectedElement}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800 rounded"
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={deleteSelectedElement}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-800 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Width</label>
                      <input
                        type="number"
                        value={selectedElement.width}
                        onChange={(e) => updateSelectedElement({ width: parseInt(e.target.value) })}
                        className="input-field text-sm"
                        min="10"
                        max="500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Height</label>
                      <input
                        type="number"
                        value={selectedElement.height}
                        onChange={(e) => updateSelectedElement({ height: parseInt(e.target.value) })}
                        className="input-field text-sm"
                        min="10"
                        max="500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rotation</label>
                      <input
                        type="range"
                        value={selectedElement.rotation}
                        onChange={(e) => updateSelectedElement({ rotation: parseInt(e.target.value) })}
                        className="w-full"
                        min="-180"
                        max="180"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{selectedElement.rotation}°</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Opacity</label>
                      <input
                        type="range"
                        value={selectedElement.opacity}
                        onChange={(e) => updateSelectedElement({ opacity: parseFloat(e.target.value) })}
                        className="w-full"
                        min="0"
                        max="1"
                        step="0.1"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{Math.round(selectedElement.opacity * 100)}%</span>
                    </div>
                    {(selectedElement.type === 'text' || selectedElement.type === 'signature') && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Text Content</label>
                          <input
                            type="text"
                            value={selectedElement.text || ''}
                            onChange={(e) => updateSelectedElement({ text: e.target.value })}
                            className="input-field text-sm"
                            placeholder="Enter text"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Font Size</label>
                          <input
                            type="number"
                            value={selectedElement.fontSize || 18}
                            onChange={(e) => updateSelectedElement({ fontSize: parseInt(e.target.value) })}
                            className="input-field text-sm"
                            min="8"
                            max="72"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Font Family</label>
                          <select
                            value={selectedElement.fontFamily}
                            onChange={(e) => updateSelectedElement({ fontFamily: e.target.value })}
                            className="input-field text-sm"
                          >
                            {fonts.map((font) => (
                              <option key={font} value={font}>{font}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Text Color</label>
                          <input
                            type="color"
                            value={selectedElement.color || '#000000'}
                            onChange={(e) => updateSelectedElement({ color: e.target.value })}
                            className="w-full h-8 rounded border"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Font Style</label>
                          <select
                            value={selectedElement.fontStyle}
                            onChange={(e) => updateSelectedElement({ fontStyle: e.target.value })}
                            className="input-field text-sm"
                          >
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                            <option value="italic">Italic</option>
                            <option value="bold italic">Bold Italic</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-amber-500" />
                Certificate Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    value={certificateData.recipientName}
                    onChange={(e) => setCertificateData(prev => ({ ...prev, recipientName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Course/Program Name</label>
                  <input
                    type="text"
                    value={certificateData.courseName}
                    onChange={(e) => setCertificateData(prev => ({ ...prev, courseName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                    placeholder="Advanced Web Development"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Institution/Organization</label>
                  <input
                    type="text"
                    value={certificateData.instituteName}
                    onChange={(e) => setCertificateData(prev => ({ ...prev, instituteName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                    placeholder="Tech Institute"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Completion Date</label>
                    <input
                      type="date"
                      value={certificateData.completionDate}
                      onChange={(e) => setCertificateData(prev => ({ ...prev, completionDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Grade/Score</label>
                    <input
                      type="text"
                      value={certificateData.grade}
                      onChange={(e) => setCertificateData(prev => ({ ...prev, grade: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                      placeholder="A+"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Instructor/Authority</label>
                  <input
                    type="text"
                    value={certificateData.instructorName}
                    onChange={(e) => setCertificateData(prev => ({ ...prev, instructorName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                    placeholder="Dr. Jane Smith"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Duration</label>
                    <input
                      type="text"
                      value={certificateData.duration}
                      onChange={(e) => setCertificateData(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                      placeholder="6 months"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Certificate ID</label>
                    <input
                      type="text"
                      value={certificateData.certificateId}
                      onChange={(e) => setCertificateData(prev => ({ ...prev, certificateId: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                      placeholder="CERT-2024-001"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                <Layers className="h-5 w-5 mr-2 text-amber-500" />
                Templates
              </h3>
              <div className="grid grid-cols-1 gap-3 mb-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setDesign(prev => ({ ...prev, template: template.id }))}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${design.template === template.id
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-amber-300'
                      }`}
                  >
                    <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">{template.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{template.description}</div>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={saveTemplate}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold transition"
                >
                  <Save className="h-4 w-4" />
                  Save Template
                </button>
              </div>
              {savedTemplates.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">Saved Templates</h4>
                  <div className="space-y-2">
                    {savedTemplates.map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="text-sm">{template.name}</span>
                        <button
                          onClick={() => loadTemplate(template)}
                          className="text-primary-600 hover:text-primary-700 text-sm"
                        >
                          Load
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                <Palette className="h-5 w-5 mr-2 text-amber-500" />
                Design Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Background</label>
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => setDesign(prev => ({ ...prev, backgroundType: 'color' }))}
                      className={`px-3 py-1 rounded text-sm font-medium transition ${design.backgroundType === 'color' ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                    >
                      Color
                    </button>
                    <button
                      onClick={() => setDesign(prev => ({ ...prev, backgroundType: 'image' }))}
                      className={`px-3 py-1 rounded text-sm font-medium transition ${design.backgroundType === 'image' ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                    >
                      Image
                    </button>
                  </div>
                  {design.backgroundType === 'color' ? (
                    <input
                      type="color"
                      value={design.backgroundColor}
                      onChange={(e) => setDesign(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-full h-10 rounded border border-gray-300 dark:border-gray-600"
                    />
                  ) : (
                    <div
                      {...backgroundDropzone.getRootProps()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center ${backgroundDropzone.isDragActive ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-amber-400'}`}
                    >
                      <input {...backgroundDropzone.getInputProps()} />
                      <Upload className="h-6 w-6 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {backgroundDropzone.isDragActive ? 'Drop background image here' : 'Click or drag background image'}
                      </p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary</label>
                    <input
                      type="color"
                      value={design.primaryColor}
                      onChange={(e) => setDesign(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-full h-8 rounded border"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Secondary</label>
                    <input
                      type="color"
                      value={design.secondaryColor}
                      onChange={(e) => setDesign(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="w-full h-8 rounded border"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Accent</label>
                    <input
                      type="color"
                      value={design.accentColor}
                      onChange={(e) => setDesign(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="w-full h-8 rounded border"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Border Style</label>
                  <select
                    value={design.borderStyle}
                    onChange={(e) => setDesign(prev => ({ ...prev, borderStyle: e.target.value }))}
                    className="input-field mb-2"
                  >
                    {borderStyles.map((style) => (
                      <option key={style.id} value={style.id}>
                        {style.name}
                      </option>
                    ))}
                  </select>
                  {design.borderStyle !== 'none' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Color</label>
                        <input
                          type="color"
                          value={design.borderColor}
                          onChange={(e) => setDesign(prev => ({ ...prev, borderColor: e.target.value }))}
                          className="w-full h-8 rounded border"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Width: {design.borderWidth}px</label>
                        <input
                          type="range"
                          value={design.borderWidth}
                          onChange={(e) => setDesign(prev => ({ ...prev, borderWidth: parseInt(e.target.value) }))}
                          className="w-full"
                          min="1"
                          max="20"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                <Type className="h-5 w-5 mr-2 text-amber-500" />
                Typography
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">Title Text</h4>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <select
                      value={typography.titleFont}
                      onChange={(e) => setTypography(prev => ({ ...prev, titleFont: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                    >
                      {fonts.map((font) => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                    <input
                      type="color"
                      value={typography.titleColor}
                      onChange={(e) => setTypography(prev => ({ ...prev, titleColor: e.target.value }))}
                      className="w-full h-8 rounded border"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Size: {typography.titleSize}px</label>
                      <input
                        type="range"
                        value={typography.titleSize}
                        onChange={(e) => setTypography(prev => ({ ...prev, titleSize: parseInt(e.target.value) }))}
                        className="w-full"
                        min="24"
                        max="72"
                      />
                    </div>
                    <select
                      value={typography.titleStyle}
                      onChange={(e) => setTypography(prev => ({ ...prev, titleStyle: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                      <option value="italic">Italic</option>
                      <option value="bold italic">Bold Italic</option>
                    </select>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">Recipient Name</h4>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <select
                      value={typography.nameFont}
                      onChange={(e) => setTypography(prev => ({ ...prev, nameFont: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                    >
                      {fonts.map((font) => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                    <input
                      type="color"
                      value={typography.nameColor}
                      onChange={(e) => setTypography(prev => ({ ...prev, nameColor: e.target.value }))}
                      className="w-full h-8 rounded border"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Size: {typography.nameSize}px</label>
                      <input
                        type="range"
                        value={typography.nameSize}
                        onChange={(e) => setTypography(prev => ({ ...prev, nameSize: parseInt(e.target.value) }))}
                        className="w-full"
                        min="20"
                        max="60"
                      />
                    </div>
                    <select
                      value={typography.nameStyle}
                      onChange={(e) => setTypography(prev => ({ ...prev, nameStyle: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                      <option value="italic">Italic</option>
                      <option value="bold italic">Bold Italic</option>
                    </select>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">Body Text</h4>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <select
                      value={typography.bodyFont}
                      onChange={(e) => setTypography(prev => ({ ...prev, bodyFont: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                    >
                      {fonts.map((font) => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                    <input
                      type="color"
                      value={typography.bodyColor}
                      onChange={(e) => setTypography(prev => ({ ...prev, bodyColor: e.target.value }))}
                      className="w-full h-8 rounded border"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Size: {typography.bodySize}px</label>
                      <input
                        type="range"
                        value={typography.bodySize}
                        onChange={(e) => setTypography(prev => ({ ...prev, bodySize: parseInt(e.target.value) }))}
                        className="w-full"
                        min="12"
                        max="32"
                      />
                    </div>
                    <select
                      value={typography.bodyStyle}
                      onChange={(e) => setTypography(prev => ({ ...prev, bodyStyle: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                      <option value="italic">Italic</option>
                      <option value="bold italic">Bold Italic</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                <ImageIcon className="h-5 w-5 mr-2 text-amber-500" />
                Add Elements
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-1" />
                    Institution Logo
                  </h4>
                  <div
                    {...logoDropzone.getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center ${logoDropzone.isDragActive ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-amber-400'}`}
                  >
                    <input {...logoDropzone.getInputProps()} />
                    <Upload className="h-6 w-6 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {logoDropzone.isDragActive ? 'Drop logo here' : 'Click or drag logo'}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Official Stamp/Seal
                  </h4>
                  <div
                    {...stampDropzone.getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center ${stampDropzone.isDragActive ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-amber-400'}`}
                  >
                    <input {...stampDropzone.getInputProps()} />
                    <Upload className="h-6 w-6 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stampDropzone.isDragActive ? 'Drop stamp here' : 'Click or drag stamp'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => {
                      const newElement = {
                        id: Date.now(),
                        type: 'text',
                        text: 'Custom Text',
                        x: 600,
                        y: 425,
                        fontSize: 18,
                        fontFamily: 'Inter',
                        fontStyle: 'normal',
                        color: '#000000',
                        width: 120,
                        height: 25,
                        rotation: 0,
                        opacity: 1
                      };
                      setElements(prev => [...prev, newElement]);
                      setSelectedElement(newElement);
                      toast.success('Text element added');
                    }}
                    className="btn-secondary text-sm flex items-center gap-1"
                  >
                    <Type className="h-4 w-4 mr-1" />
                    Add Text
                  </button>
                  <button
                    onClick={() => {
                      const newElement = {
                        id: Date.now(),
                        type: 'signature',
                        text: 'Signature',
                        x: 600,
                        y: 650,
                        fontSize: 18,
                        fontFamily: 'Inter',
                        fontStyle: 'italic',
                        color: '#000000',
                        width: 150,
                        height: 25,
                        rotation: 0,
                        opacity: 1
                      };
                      setElements(prev => [...prev, newElement]);
                      setSelectedElement(newElement);
                      toast.success('Signature placeholder added');
                    }}
                    className="btn-secondary text-sm flex items-center gap-1"
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Add Signature
                  </button>
                </div>
                {elements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">Elements on Certificate</h4>
                    <div className="space-y-1">
                      {elements.map((element, index) => (
                        <div
                          key={element.id}
                          className={`flex items-center justify-between p-2 rounded text-sm ${selectedElement?.id === element.id
                            ? 'bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700'
                            : 'bg-gray-50 dark:bg-gray-800'
                            }`}
                        >
                          <span className="capitalize">{element.type} {index + 1}</span>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => setSelectedElement(element)}
                              className="p-1 text-blue-600 hover:bg-blue-200 dark:hover:bg-blue-800 rounded"
                              title="Select"
                            >
                              <Eye className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => {
                                setElements(prev => prev.filter(el => el.id !== element.id));
                                if (selectedElement?.id === element.id) {
                                  setSelectedElement(null);
                                }
                                toast.success('Element deleted');
                              }}
                              className="p-1 text-red-600 hover:bg-red-200 dark:hover:bg-red-800 rounded"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SEO Content */}
        <div className="mt-16 space-y-6">
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Professional Certificate Generator — Create & Download Certificates Online</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Whether you run an online course, lead a corporate training programme, manage a school, or run a professional certification body, producing certificates that look genuinely impressive is no small task. Design software like Photoshop has a steep learning curve. Word templates look unprofessional. Hiring a designer for each batch of certificates is expensive. The OmniWebKit Certificate Generator solves all of these problems in one free, browser-based tool.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              The tool gives you six professionally designed certificate templates — Classic, Modern, Elegant, Corporate, Academic, and Achievement — each rendered on a high-resolution 1200×850 canvas. Every element of the certificate is fully customisable: the recipient name, course name, institution, completion date, instructor, grade, duration, and certificate ID. Typography controls let you set the font, size, style, and colour for the title text, the recipient name, and the body text independently.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Beyond the template and data fields, you can add your institution logo, an official stamp or seal, custom text annotations, and signature placeholders — all as freely movable, resizable, rotatable elements on the canvas. You can also set a custom background colour or upload a background image. When finished, download your certificate as PNG, JPG, or a landscape PDF ready to share, print, or email.
            </p>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">How to Create a Certificate in 5 Steps</h2>
            <div className="space-y-4">
              {[
                { n: '1', t: 'Choose a template', d: 'Select from six templates using the Templates panel on the right. Classic and Academic are ideal for education. Corporate and Modern suit professional training. Elegant and Achievement work well for recognition and awards.' },
                { n: '2', t: 'Fill in the certificate details', d: 'Enter the recipient name, course or programme name, institution, completion date, grade, instructor name, duration, and a certificate ID in the Certificate Details panel. The canvas updates live as you type.' },
                { n: '3', t: 'Customise design and typography', d: 'Use the Design Settings panel to choose your background colour or image, set three brand colours (primary, secondary, accent), select a border style, and adjust border width and colour. Use the Typography panel to set font, size, style, and colour for each text tier.' },
                { n: '4', t: 'Add logos, stamps, and elements', d: 'Upload your institutional logo and official stamp or seal using the drag-and-drop zones in the Add Elements panel. Click Add Text or Add Signature to add custom text or signature lines. Click any element on the canvas to select it, then drag to reposition, or use the controls to resize, rotate, and set opacity.' },
                { n: '5', t: 'Download your certificate', d: 'Click Download PNG for the highest quality lossless image, JPG for a compressed version, or PDF for a print-ready landscape document. The certificate ID and recipient name are included in the filename automatically.' },
              ].map(({ n, t, d }) => (
                <div key={n} className="flex gap-4">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-bold flex items-center justify-center">{n}</div>
                  <div><p className="font-semibold text-slate-900 dark:text-white text-sm">{t}</p><p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{d}</p></div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Which Certificate Template Should You Choose?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'Classic', use: 'Best for academic completions, course certificates, and general purpose certificates that need a traditional, trusted look.' },
                { name: 'Modern', use: 'Clean gradient header with a structured details layout. Ideal for tech bootcamps, online courses, and contemporary training programmes.' },
                { name: 'Elegant', use: 'Features flourishes and calligraphic styling. Perfect for distinction awards, excellence certificates, and formal academic recognition.' },
                { name: 'Corporate', use: 'Dark header, structured two-column detail layout. Best for corporate training, professional development programmes, and HR certifications.' },
                { name: 'Academic', use: 'University-style layout with institutional name at the top. Ideal for schools, colleges, and formal educational programmes.' },
                { name: 'Achievement', use: 'Prominent badge and ribbon design. Best for performance awards, employee recognition, competition certificates, and milestone achievements.' },
              ].map(({ name, use }) => (
                <div key={name} className="p-4 border border-slate-100 dark:border-slate-700 rounded-xl">
                  <p className="font-bold text-slate-900 dark:text-white text-sm mb-1">{name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{use}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is this certificate generator free?', a: 'Yes, 100% free with no account required. All certificate generation happens in your browser using HTML5 Canvas. Your data never leaves your device.' },
                { q: 'Can I add my institution logo?', a: 'Yes. Use the Institution Logo dropzone in the Add Elements panel to upload your logo as a PNG, JPG, or GIF. Once added, it appears on the canvas and can be moved, resized, and rotated freely.' },
                { q: 'What formats can I download?', a: 'You can download as PNG (lossless, highest quality), JPG (compressed), or PDF (landscape, print-ready). The PDF is generated using jsPDF and sized to match the canvas dimensions.' },
                { q: 'Can I save my design for later?', a: 'Yes. Click Save Template to save your current design, colours, typography settings, and canvas elements to localStorage. Saved templates appear in the Saved Templates list and can be loaded at any time. Note: localStorage is cleared when browser data is cleared.' },
                { q: 'Can I create certificates for multiple people?', a: 'Yes. After downloading one certificate, simply update the Recipient Name field and any other details, and download again. The certificate re-renders instantly with the new information.' },
                { q: 'What is the certificate resolution?', a: 'The canvas renders at 1200×850 pixels in landscape orientation. This is sufficient for standard A4 print at 96 DPI. For higher print resolution, download the PNG and upscale using an image editor before printing.' },
                { q: 'Can I use a custom background image?', a: 'Yes. Toggle Background to Image in the Design Settings panel and drag a background image onto the dropzone. The image fills the full canvas and the certificate content is drawn over it.' },
                { q: 'Are the certificates legally valid?', a: 'The certificates are digital image documents and carry no inherent legal authority. Their validity depends on the credibility of the issuing institution and what they represent. For official accreditation or legal certification, consult the appropriate regulatory bodies.' },
              ].map(({ q, a }) => (
                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none">
                    <span>{q}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
                  </summary>
                  <div className="px-5 pb-5 pt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700">{a}</div>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CertificateGenerator;