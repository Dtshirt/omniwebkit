'use client';
import { useState, useCallback } from 'react';
import { Copy, Plus, Trash2, Check, RefreshCw, Monitor, Tablet, Smartphone, Edit3, Code, Download, Minimize2, Maximize2, LayoutGrid, Columns } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Constants ─────────────────────────────────────────────────────────── */
const BP = ['desktop','tablet','mobile'];
const ITEM_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f97316','#22c55e','#14b8a6','#3b82f6','#f59e0b','#ef4444','#10b981'];

const DEFAULT_GRID = {
  desktop:{ columns:'repeat(3, 1fr)', rows:'auto', gap:'20px', rowGap:'', colGap:'', autoRows:'minmax(150px, auto)', autoColumns:'1fr', alignContent:'start', justifyContent:'start', placeItems:'stretch' },
  tablet: { columns:'repeat(2, 1fr)', rows:'auto', gap:'16px', rowGap:'', colGap:'', autoRows:'minmax(120px, auto)', autoColumns:'1fr', alignContent:'start', justifyContent:'start', placeItems:'stretch' },
  mobile: { columns:'1fr',            rows:'auto', gap:'12px', rowGap:'', colGap:'', autoRows:'minmax(100px, auto)', autoColumns:'1fr', alignContent:'start', justifyContent:'start', placeItems:'stretch' },
};
const DEFAULT_FLEX = {
  desktop:{ direction:'row',    wrap:'wrap',   justify:'flex-start', align:'stretch', alignContent:'normal', gap:'20px', itemBasis:'300px', itemGrow:'1', itemShrink:'1' },
  tablet: { direction:'row',    wrap:'wrap',   justify:'flex-start', align:'stretch', alignContent:'normal', gap:'16px', itemBasis:'250px', itemGrow:'1', itemShrink:'1' },
  mobile: { direction:'column', wrap:'nowrap', justify:'flex-start', align:'stretch', alignContent:'normal', gap:'12px', itemBasis:'auto',  itemGrow:'0', itemShrink:'1' },
};
const DEFAULT_ITEMS = [1,2,3,4,5,6].map(i=>({ id:i, content:`Item ${i}`, color:ITEM_COLORS[(i-1)%ITEM_COLORS.length], gridArea:{ desktop:{}, tablet:{}, mobile:{} }, alignSelf:'auto', justifySelf:'auto' }));

const GRID_PRESETS = {
  'Standard 3-col':  { desktop:{columns:'repeat(3, 1fr)',rows:'auto',gap:'20px',rowGap:'',colGap:'',autoRows:'minmax(150px, auto)',autoColumns:'1fr',alignContent:'start',justifyContent:'start',placeItems:'stretch'}, tablet:{columns:'repeat(2, 1fr)',rows:'auto',gap:'16px',rowGap:'',colGap:'',autoRows:'minmax(120px, auto)',autoColumns:'1fr',alignContent:'start',justifyContent:'start',placeItems:'stretch'}, mobile:{columns:'1fr',rows:'auto',gap:'12px',rowGap:'',colGap:'',autoRows:'minmax(100px, auto)',autoColumns:'1fr',alignContent:'start',justifyContent:'start',placeItems:'stretch'} },
  'Holy Grail':      { desktop:{columns:'200px 1fr 200px',rows:'auto 1fr auto',gap:'16px',rowGap:'',colGap:'',autoRows:'minmax(120px, auto)',autoColumns:'1fr',alignContent:'start',justifyContent:'start',placeItems:'stretch'}, tablet:{columns:'160px 1fr',rows:'auto 1fr auto',gap:'12px',rowGap:'',colGap:'',autoRows:'minmax(100px, auto)',autoColumns:'1fr',alignContent:'start',justifyContent:'start',placeItems:'stretch'}, mobile:{columns:'1fr',rows:'auto',gap:'12px',rowGap:'',colGap:'',autoRows:'minmax(80px, auto)',autoColumns:'1fr',alignContent:'start',justifyContent:'start',placeItems:'stretch'} },
  'Dashboard':       { desktop:{columns:'240px 1fr 1fr',rows:'auto 1fr',gap:'20px',rowGap:'',colGap:'',autoRows:'minmax(150px, auto)',autoColumns:'1fr',alignContent:'start',justifyContent:'start',placeItems:'stretch'}, tablet:{columns:'180px 1fr',rows:'auto 1fr',gap:'16px',rowGap:'',colGap:'',autoRows:'minmax(120px, auto)',autoColumns:'1fr',alignContent:'start',justifyContent:'start',placeItems:'stretch'}, mobile:{columns:'1fr',rows:'auto',gap:'12px',rowGap:'',colGap:'',autoRows:'minmax(100px, auto)',autoColumns:'1fr',alignContent:'start',justifyContent:'start',placeItems:'stretch'} },
  'Bento Grid':      { desktop:{columns:'repeat(4, 1fr)',rows:'auto',gap:'12px',rowGap:'',colGap:'',autoRows:'minmax(140px, auto)',autoColumns:'1fr',alignContent:'start',justifyContent:'start',placeItems:'stretch'}, tablet:{columns:'repeat(2, 1fr)',rows:'auto',gap:'10px',rowGap:'',colGap:'',autoRows:'minmax(120px, auto)',autoColumns:'1fr',alignContent:'start',justifyContent:'start',placeItems:'stretch'}, mobile:{columns:'1fr',rows:'auto',gap:'8px',rowGap:'',colGap:'',autoRows:'minmax(100px, auto)',autoColumns:'1fr',alignContent:'start',justifyContent:'start',placeItems:'stretch'} },
  'Magazine':        { desktop:{columns:'repeat(4, 1fr)',rows:'auto',gap:'16px',rowGap:'',colGap:'',autoRows:'minmax(120px, auto)',autoColumns:'1fr',alignContent:'start',justifyContent:'start',placeItems:'stretch'}, tablet:{columns:'repeat(2, 1fr)',rows:'auto',gap:'12px',rowGap:'',colGap:'',autoRows:'minmax(100px, auto)',autoColumns:'1fr',alignContent:'start',justifyContent:'start',placeItems:'stretch'}, mobile:{columns:'1fr',rows:'auto',gap:'8px',rowGap:'',colGap:'',autoRows:'minmax(80px, auto)',autoColumns:'1fr',alignContent:'start',justifyContent:'start',placeItems:'stretch'} },
  'Auto-fit Gallery':{ desktop:{columns:'repeat(auto-fit, minmax(250px, 1fr))',rows:'auto',gap:'16px',rowGap:'',colGap:'',autoRows:'minmax(250px, auto)',autoColumns:'1fr',alignContent:'start',justifyContent:'start',placeItems:'stretch'}, tablet:{columns:'repeat(auto-fit, minmax(200px, 1fr))',rows:'auto',gap:'12px',rowGap:'',colGap:'',autoRows:'minmax(200px, auto)',autoColumns:'1fr',alignContent:'start',justifyContent:'start',placeItems:'stretch'}, mobile:{columns:'repeat(auto-fit, minmax(140px, 1fr))',rows:'auto',gap:'8px',rowGap:'',colGap:'',autoRows:'minmax(140px, auto)',autoColumns:'1fr',alignContent:'start',justifyContent:'start',placeItems:'stretch'} },
  '12-Column System':{ desktop:{columns:'repeat(12, 1fr)',rows:'auto',gap:'24px',rowGap:'',colGap:'',autoRows:'minmax(80px, auto)',autoColumns:'1fr',alignContent:'start',justifyContent:'start',placeItems:'stretch'}, tablet:{columns:'repeat(6, 1fr)',rows:'auto',gap:'16px',rowGap:'',colGap:'',autoRows:'minmax(60px, auto)',autoColumns:'1fr',alignContent:'start',justifyContent:'start',placeItems:'stretch'}, mobile:{columns:'repeat(4, 1fr)',rows:'auto',gap:'8px',rowGap:'',colGap:'',autoRows:'minmax(50px, auto)',autoColumns:'1fr',alignContent:'start',justifyContent:'start',placeItems:'stretch'} },
  'Sidebar Layout':  { desktop:{columns:'280px 1fr',rows:'auto',gap:'24px',rowGap:'',colGap:'',autoRows:'minmax(200px, auto)',autoColumns:'1fr',alignContent:'start',justifyContent:'start',placeItems:'stretch'}, tablet:{columns:'200px 1fr',rows:'auto',gap:'16px',rowGap:'',colGap:'',autoRows:'minmax(150px, auto)',autoColumns:'1fr',alignContent:'start',justifyContent:'start',placeItems:'stretch'}, mobile:{columns:'1fr',rows:'auto',gap:'12px',rowGap:'',colGap:'',autoRows:'minmax(100px, auto)',autoColumns:'1fr',alignContent:'start',justifyContent:'start',placeItems:'stretch'} },
};
const FLEX_PRESETS = {
  'Card Layout':  { desktop:{direction:'row',wrap:'wrap',justify:'flex-start',align:'stretch',alignContent:'normal',gap:'20px',itemBasis:'300px',itemGrow:'1',itemShrink:'1'}, tablet:{direction:'row',wrap:'wrap',justify:'flex-start',align:'stretch',alignContent:'normal',gap:'16px',itemBasis:'250px',itemGrow:'1',itemShrink:'1'}, mobile:{direction:'column',wrap:'nowrap',justify:'flex-start',align:'stretch',alignContent:'normal',gap:'12px',itemBasis:'auto',itemGrow:'0',itemShrink:'1'} },
  'Navigation':   { desktop:{direction:'row',wrap:'nowrap',justify:'space-between',align:'center',alignContent:'normal',gap:'24px',itemBasis:'auto',itemGrow:'0',itemShrink:'0'}, tablet:{direction:'row',wrap:'wrap',justify:'space-between',align:'center',alignContent:'normal',gap:'16px',itemBasis:'auto',itemGrow:'0',itemShrink:'1'}, mobile:{direction:'column',wrap:'nowrap',justify:'flex-start',align:'stretch',alignContent:'normal',gap:'12px',itemBasis:'auto',itemGrow:'0',itemShrink:'1'} },
  'Feature Grid': { desktop:{direction:'row',wrap:'wrap',justify:'center',align:'stretch',alignContent:'normal',gap:'32px',itemBasis:'350px',itemGrow:'0',itemShrink:'1'}, tablet:{direction:'row',wrap:'wrap',justify:'center',align:'stretch',alignContent:'normal',gap:'24px',itemBasis:'300px',itemGrow:'0',itemShrink:'1'}, mobile:{direction:'column',wrap:'nowrap',justify:'flex-start',align:'stretch',alignContent:'normal',gap:'16px',itemBasis:'auto',itemGrow:'0',itemShrink:'1'} },
  'Centered Hero':{ desktop:{direction:'column',wrap:'nowrap',justify:'center',align:'center',alignContent:'normal',gap:'24px',itemBasis:'auto',itemGrow:'0',itemShrink:'0'}, tablet:{direction:'column',wrap:'nowrap',justify:'center',align:'center',alignContent:'normal',gap:'16px',itemBasis:'auto',itemGrow:'0',itemShrink:'0'}, mobile:{direction:'column',wrap:'nowrap',justify:'flex-start',align:'stretch',alignContent:'normal',gap:'12px',itemBasis:'auto',itemGrow:'0',itemShrink:'1'} },
};

/* ─── CSS generators ─────────────────────────────────────────────────────── */
function buildGridProps(c) {
  const lines = [`  display: grid;`,`  grid-template-columns: ${c.columns};`];
  if (c.rows && c.rows !== 'auto') lines.push(`  grid-template-rows: ${c.rows};`);
  if (c.rowGap) { lines.push(`  row-gap: ${c.rowGap};`); } else if (c.gap) lines.push(`  gap: ${c.gap};`);
  if (c.colGap) lines.push(`  column-gap: ${c.colGap};`);
  if (c.autoRows) lines.push(`  grid-auto-rows: ${c.autoRows};`);
  if (c.alignContent && c.alignContent !== 'start') lines.push(`  align-content: ${c.alignContent};`);
  if (c.justifyContent && c.justifyContent !== 'start') lines.push(`  justify-content: ${c.justifyContent};`);
  if (c.placeItems && c.placeItems !== 'stretch') lines.push(`  place-items: ${c.placeItems};`);
  return lines.join('\n');
}

function buildFlexProps(c) {
  const lines = [`  display: flex;`,`  flex-direction: ${c.direction};`,`  flex-wrap: ${c.wrap};`,`  justify-content: ${c.justify};`,`  align-items: ${c.align};`];
  if (c.alignContent && c.alignContent !== 'normal') lines.push(`  align-content: ${c.alignContent};`);
  if (c.gap) lines.push(`  gap: ${c.gap};`);
  return lines.join('\n');
}

function generateCSS(layoutType, gridConfig, flexConfig, items, minify) {
  const s = minify ? '' : '\n', i = minify ? '' : '  ', nl = minify ? ' ' : '\n';
  if (layoutType === 'grid') {
    let css = `/* Desktop (Default) */${s}.grid-container {${s}${buildGridProps(gridConfig.desktop)}${s}}`;
    items.forEach(item => {
      const a = item.gridArea.desktop;
      if (Object.values(a).some(Boolean)) {
        css += `${s}${s}.grid-item-${item.id} {`;
        if (a.columnStart) css += `${s}${i}grid-column-start: ${a.columnStart};`;
        if (a.columnEnd)   css += `${s}${i}grid-column-end: ${a.columnEnd};`;
        if (a.rowStart)    css += `${s}${i}grid-row-start: ${a.rowStart};`;
        if (a.rowEnd)      css += `${s}${i}grid-row-end: ${a.rowEnd};`;
        if (item.alignSelf && item.alignSelf !== 'auto') css += `${s}${i}align-self: ${item.alignSelf};`;
        if (item.justifySelf && item.justifySelf !== 'auto') css += `${s}${i}justify-self: ${item.justifySelf};`;
        css += `${s}}`;
      }
    });
    css += `${s}${s}/* Tablet */${s}@media (max-width: 1024px) {${s}${i}.grid-container {${s}${buildGridProps(gridConfig.tablet).split('\n').map(l=>`  ${l}`).join('\n')}${s}${i}}`;
    items.forEach(item => {
      const a = item.gridArea.tablet;
      if (Object.values(a).some(Boolean)) {
        css += `${s}${s}${i}.grid-item-${item.id} {`;
        if (a.columnStart) css += `${s}${i}${i}grid-column-start: ${a.columnStart};`;
        if (a.columnEnd)   css += `${s}${i}${i}grid-column-end: ${a.columnEnd};`;
        if (a.rowStart)    css += `${s}${i}${i}grid-row-start: ${a.rowStart};`;
        if (a.rowEnd)      css += `${s}${i}${i}grid-row-end: ${a.rowEnd};`;
        css += `${s}${i}}`;
      }
    });
    css += `${s}}`;
    css += `${s}${s}/* Mobile */${s}@media (max-width: 768px) {${s}${i}.grid-container {${s}${buildGridProps(gridConfig.mobile).split('\n').map(l=>`  ${l}`).join('\n')}${s}${i}}`;
    items.forEach(item => {
      const a = item.gridArea.mobile;
      if (Object.values(a).some(Boolean)) {
        css += `${s}${s}${i}.grid-item-${item.id} {`;
        if (a.columnStart) css += `${s}${i}${i}grid-column-start: ${a.columnStart};`;
        if (a.columnEnd)   css += `${s}${i}${i}grid-column-end: ${a.columnEnd};`;
        if (a.rowStart)    css += `${s}${i}${i}grid-row-start: ${a.rowStart};`;
        if (a.rowEnd)      css += `${s}${i}${i}grid-row-end: ${a.rowEnd};`;
        css += `${s}${i}}`;
      }
    });
    css += `${s}}`;
    return css;
  } else {
    return `/* Desktop */\n.flex-container {\n${buildFlexProps(flexConfig.desktop)}\n}\n.flex-item {\n  flex: ${flexConfig.desktop.itemGrow} ${flexConfig.desktop.itemShrink} ${flexConfig.desktop.itemBasis};\n  min-width: 0;\n}\n\n/* Tablet */\n@media (max-width: 1024px) {\n  .flex-container {\n${buildFlexProps(flexConfig.tablet).split('\n').map(l=>`  ${l}`).join('\n')}\n  }\n  .flex-item { flex: ${flexConfig.tablet.itemGrow} ${flexConfig.tablet.itemShrink} ${flexConfig.tablet.itemBasis}; }\n}\n\n/* Mobile */\n@media (max-width: 768px) {\n  .flex-container {\n${buildFlexProps(flexConfig.mobile).split('\n').map(l=>`  ${l}`).join('\n')}\n  }\n  .flex-item { flex: ${flexConfig.mobile.itemGrow} ${flexConfig.mobile.itemShrink} ${flexConfig.mobile.itemBasis}; }\n}`;
  }
}

function generateSCSS(layoutType, gridConfig, flexConfig, items) {
  if (layoutType === 'grid') {
    const d = gridConfig.desktop;
    let scss = `// CSS Variables\n:root {\n  --grid-cols-desktop: ${d.columns};\n  --grid-cols-tablet: ${gridConfig.tablet.columns};\n  --grid-cols-mobile: ${gridConfig.mobile.columns};\n  --grid-gap-desktop: ${d.gap || '20px'};\n  --grid-gap-tablet: ${gridConfig.tablet.gap || '16px'};\n  --grid-gap-mobile: ${gridConfig.mobile.gap || '12px'};\n}\n\n.grid-container {\n  display: grid;\n  grid-template-columns: var(--grid-cols-desktop);\n  gap: var(--grid-gap-desktop);\n  grid-auto-rows: ${d.autoRows};\n\n  @media (max-width: 1024px) {\n    grid-template-columns: var(--grid-cols-tablet);\n    gap: var(--grid-gap-tablet);\n    grid-auto-rows: ${gridConfig.tablet.autoRows};\n  }\n\n  @media (max-width: 768px) {\n    grid-template-columns: var(--grid-cols-mobile);\n    gap: var(--grid-gap-mobile);\n    grid-auto-rows: ${gridConfig.mobile.autoRows};\n  }\n}`;
    items.forEach(item => {
      const hasAny = BP.some(bp => Object.values(item.gridArea[bp]).some(Boolean));
      if (hasAny) {
        scss += `\n\n.grid-item-${item.id} {`;
        const da = item.gridArea.desktop;
        if (da.columnStart) scss += `\n  grid-column: ${da.columnStart}${da.columnEnd?` / ${da.columnEnd}`:''}; `;
        if (da.rowStart)    scss += `\n  grid-row: ${da.rowStart}${da.rowEnd?` / ${da.rowEnd}`:''}; `;
        const ta = item.gridArea.tablet;
        if (Object.values(ta).some(Boolean)) {
          scss += `\n  @media (max-width: 1024px) {`;
          if (ta.columnStart) scss += `\n    grid-column: ${ta.columnStart}${ta.columnEnd?` / ${ta.columnEnd}`:''}; `;
          if (ta.rowStart)    scss += `\n    grid-row: ${ta.rowStart}${ta.rowEnd?` / ${ta.rowEnd}`:''}; `;
          scss += `\n  }`;
        }
        const ma = item.gridArea.mobile;
        if (Object.values(ma).some(Boolean)) {
          scss += `\n  @media (max-width: 768px) {`;
          if (ma.columnStart) scss += `\n    grid-column: ${ma.columnStart}${ma.columnEnd?` / ${ma.columnEnd}`:''}; `;
          if (ma.rowStart)    scss += `\n    grid-row: ${ma.rowStart}${ma.rowEnd?` / ${ma.rowEnd}`:''}; `;
          scss += `\n  }`;
        }
        scss += `\n}`;
      }
    });
    return scss;
  }
  return `// Flexbox SCSS with CSS Variables\n:root {\n  --flex-gap: ${flexConfig.desktop.gap};\n}\n\n.flex-container {\n  display: flex;\n  flex-direction: ${flexConfig.desktop.direction};\n  flex-wrap: ${flexConfig.desktop.wrap};\n  justify-content: ${flexConfig.desktop.justify};\n  align-items: ${flexConfig.desktop.align};\n  gap: var(--flex-gap);\n\n  @media (max-width: 1024px) {\n    flex-direction: ${flexConfig.tablet.direction};\n    flex-wrap: ${flexConfig.tablet.wrap};\n    gap: ${flexConfig.tablet.gap};\n  }\n\n  @media (max-width: 768px) {\n    flex-direction: ${flexConfig.mobile.direction};\n    gap: ${flexConfig.mobile.gap};\n  }\n}\n\n.flex-item {\n  flex: ${flexConfig.desktop.itemGrow} ${flexConfig.desktop.itemShrink} ${flexConfig.desktop.itemBasis};\n  min-width: 0;\n}`;
}

function generateTailwind(layoutType, gridConfig) {
  if (layoutType === 'grid') {
    const d = gridConfig.desktop;
    const colMap = { 'repeat(1, 1fr)':'grid-cols-1','repeat(2, 1fr)':'grid-cols-2','repeat(3, 1fr)':'grid-cols-3','repeat(4, 1fr)':'grid-cols-4','repeat(6, 1fr)':'grid-cols-6','repeat(12, 1fr)':'grid-cols-12' };
    const gapMap = { '8px':'gap-2','12px':'gap-3','16px':'gap-4','20px':'gap-5','24px':'gap-6','32px':'gap-8' };
    const dCols = colMap[d.columns] || 'grid-cols-3';
    const tCols = colMap[gridConfig.tablet.columns] || 'md:grid-cols-2';
    const mCols = colMap[gridConfig.mobile.columns] || 'sm:grid-cols-1';
    const gap   = gapMap[d.gap] || 'gap-5';
    return `<!-- Tailwind CSS Classes -->\n<div class="grid ${mCols} ${tCols.replace(/^/,'md:')} ${dCols.replace(/^/,'lg:')} ${gap}">\n  <!-- grid items -->\n</div>\n\n<!-- Note: Some advanced grid-template-columns values have no direct Tailwind equivalent.\n     For custom values, use arbitrary values: grid-cols-[250px_1fr_1fr] -->\n\n<!-- Responsive breakdown:\n  Mobile  (default): ${gridConfig.mobile.columns}\n  Tablet  (md:)    : ${gridConfig.tablet.columns}\n  Desktop (lg:)    : ${gridConfig.desktop.columns}\n-->`;
  }
  const d = flexConfig => flexConfig.desktop;
  const justMap = {'flex-start':'justify-start','flex-end':'justify-end','center':'justify-center','space-between':'justify-between','space-around':'justify-around','space-evenly':'justify-evenly'};
  const alignMap = {'flex-start':'items-start','flex-end':'items-end','center':'items-center','stretch':'items-stretch','baseline':'items-baseline'};
  return `<!-- Tailwind Flexbox Classes -->\n<div class="flex flex-wrap gap-5">\n  <!-- Use justify-* and items-* for alignment -->\n</div>`;
}

function downloadFile(content, filename, type='text/css') {
  const a = Object.assign(document.createElement('a'),{ href: URL.createObjectURL(new Blob([content],{type})), download: filename });
  a.click(); URL.revokeObjectURL(a.href);
}

const inputCls = 'w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500';
const selectCls = inputCls;
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl';

export default function CSSGridGenerator() {
  const [layoutType, setLayoutType] = useState('grid');
  const [breakpoint, setBreakpoint] = useState('desktop');
  const [gridConfig, setGridConfig] = useState(DEFAULT_GRID);
  const [flexConfig, setFlexConfig] = useState(DEFAULT_FLEX);
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(true);
  const [outputFormat, setOutputFormat] = useState('css'); // css | scss | tailwind
  const [minify, setMinify] = useState(false);
  const [showAreas, setShowAreas] = useState(false);
  const [areaMap, setAreaMap] = useState(''); // grid-template-areas string

  const updateGridConfig = (bp, prop, val) => setGridConfig(p=>({...p,[bp]:{...p[bp],[prop]:val}}));
  const updateFlexConfig = (bp, prop, val) => setFlexConfig(p=>({...p,[bp]:{...p[bp],[prop]:val}}));

  const addItem = () => {
    const newId = Math.max(...items.map(i=>i.id))+1;
    setItems(p=>[...p,{ id:newId, content:`Item ${newId}`, color:ITEM_COLORS[(newId-1)%ITEM_COLORS.length], gridArea:{desktop:{},tablet:{},mobile:{}}, alignSelf:'auto', justifySelf:'auto' }]);
  };
  const removeItem = (id) => { if(items.length>1){ setItems(p=>p.filter(i=>i.id!==id)); if(selectedItemId===id) setSelectedItemId(null); }};
  const updateItemGridArea = (id,bp,prop,val) => setItems(p=>p.map(i=>i.id===id?{...i,gridArea:{...i.gridArea,[bp]:{...i.gridArea[bp],[prop]:val}}}:i));
  const updateItem = (id,prop,val) => setItems(p=>p.map(i=>i.id===id?{...i,[prop]:val}:i));

  const applyPreset = (name) => {
    if (layoutType==='grid') setGridConfig(GRID_PRESETS[name]);
    else setFlexConfig(FLEX_PRESETS[name]);
    setSelectedItemId(null);
  };

  const resetLayout = () => { setGridConfig(DEFAULT_GRID); setFlexConfig(DEFAULT_FLEX); setItems(DEFAULT_ITEMS); setSelectedItemId(null); setAreaMap(''); };

  const generatedCSS   = generateCSS(layoutType,gridConfig,flexConfig,items,minify);
  const generatedSCSS  = generateSCSS(layoutType,gridConfig,flexConfig,items);
  const generatedTW    = generateTailwind(layoutType,gridConfig);
  const activeOutput   = outputFormat==='scss' ? generatedSCSS : outputFormat==='tailwind' ? generatedTW : generatedCSS;
  const outputExt      = outputFormat==='scss' ? 'scss' : outputFormat==='tailwind' ? 'html' : 'css';

  const copyOutput = () => { navigator.clipboard.writeText(activeOutput).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); }); };
  const downloadOutput = () => downloadFile(activeOutput, `layout.${outputExt}`);

  const getContainerStyle = () => {
    const c = layoutType==='grid' ? gridConfig[breakpoint] : flexConfig[breakpoint];
    if (layoutType==='grid') return { display:'grid', gridTemplateColumns:c.columns, gridTemplateRows:c.rows, gap:c.gap||undefined, rowGap:c.rowGap||undefined, columnGap:c.colGap||undefined, gridAutoRows:c.autoRows, alignContent:c.alignContent, justifyContent:c.justifyContent, placeItems:c.placeItems };
    return { display:'flex', flexDirection:c.direction, flexWrap:c.wrap, justifyContent:c.justify, alignItems:c.align, gap:c.gap };
  };
  const getItemStyle = (item) => {
    if (layoutType==='grid') {
      const a = item.gridArea[breakpoint];
      return { ...(a.columnStart?{gridColumnStart:a.columnStart}:{}), ...(a.columnEnd?{gridColumnEnd:a.columnEnd}:{}), ...(a.rowStart?{gridRowStart:a.rowStart}:{}), ...(a.rowEnd?{gridRowEnd:a.rowEnd}:{}), alignSelf:item.alignSelf||'auto', justifySelf:item.justifySelf||'auto' };
    }
    const c = flexConfig[breakpoint];
    return { flex:`${c.itemGrow} ${c.itemShrink} ${c.itemBasis}`, minWidth:0 };
  };

  const selectedItem = items.find(i=>i.id===selectedItemId);
  const currentPresets = layoutType==='grid' ? GRID_PRESETS : FLEX_PRESETS;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-[1800px] mx-auto">
        <Breadcrumbs items={[{ name: 'CSS Grid Generator', href: '/tools/css-grid-generator' }]} />
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Advanced CSS Layout Generator</h1>
          <p className="text-slate-600 dark:text-slate-400">Visual CSS Grid &amp; Flexbox builder — responsive code, SCSS, Tailwind, and more</p>
        </div>

        {/* Top toolbar */}
        <div className={`${cardCls} p-4 mb-4 flex flex-wrap items-center justify-between gap-3`}>
          <div className="flex gap-2 flex-wrap">
            {['grid','flex'].map(t=>(
              <button key={t} onClick={()=>{setLayoutType(t);setSelectedItemId(null);}}
                className={`px-5 py-2 rounded-lg font-semibold transition-all text-sm ${layoutType===t?'bg-indigo-600 text-white shadow-md':'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                {t==='grid'?'CSS Grid':'Flexbox'}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div onClick={()=>setMinify(v=>!v)} className={`relative w-8 h-4 rounded-full transition ${minify?'bg-indigo-600':'bg-slate-300 dark:bg-slate-600'}`}>
                <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${minify?'translate-x-4':''}`}/>
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Minify</span>
            </label>
            {layoutType==='grid' && (
              <button onClick={()=>setShowAreas(v=>!v)} className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${showAreas?'bg-violet-600 text-white':'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                <LayoutGrid className="w-3.5 h-3.5"/> Areas
              </button>
            )}
            <button onClick={()=>setShowCode(v=>!v)} className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5"/>{showCode?'Hide':'Show'} Code
            </button>
            <button onClick={resetLayout} className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5"/> Reset
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-4">
          {/* ── Sidebar ── */}
          <div className="lg:col-span-3 space-y-4">
            {/* Breakpoint */}
            <div className={`${cardCls} p-4`}>
              <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-sm">Breakpoint</h3>
              <div className="space-y-1.5">
                {[{key:'desktop',icon:Monitor,label:'Desktop',w:'> 1024px'},{key:'tablet',icon:Tablet,label:'Tablet',w:'≤ 1024px'},{key:'mobile',icon:Smartphone,label:'Mobile',w:'≤ 768px'}].map(({key,icon:Icon,label,w})=>(
                  <button key={key} onClick={()=>setBreakpoint(key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${breakpoint===key?'bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-500 text-indigo-700 dark:text-indigo-300':'bg-slate-50 dark:bg-slate-700 border-2 border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'}`}>
                    <Icon className="w-4 h-4 flex-shrink-0"/>
                    <div className="text-left"><div className="font-semibold text-slate-800 dark:text-slate-100 text-xs">{label}</div><div className="text-xs text-slate-500 dark:text-slate-400">{w}</div></div>
                  </button>
                ))}
              </div>
            </div>

            {/* Presets */}
            <div className={`${cardCls} p-4`}>
              <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-sm">Presets</h3>
              <div className="space-y-1">
                {Object.keys(currentPresets).map(name=>(
                  <button key={name} onClick={()=>applyPreset(name)}
                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 transition">
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Settings */}
            <div className={`${cardCls} p-4`}>
              <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-sm">{layoutType==='grid'?'Grid':'Flexbox'} Settings — {breakpoint}</h3>
              {layoutType==='grid' ? (
                <div className="space-y-3">
                  {[['columns','grid-template-columns','repeat(3, 1fr)'],['rows','grid-template-rows','auto'],['gap','gap','20px'],['rowGap','row-gap',''],['colGap','column-gap',''],['autoRows','grid-auto-rows','minmax(150px, auto)']].map(([prop,label,ph])=>(
                    <div key={prop}><label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{label}</label>
                      <input type="text" value={gridConfig[breakpoint][prop]} onChange={e=>updateGridConfig(breakpoint,prop,e.target.value)} className={inputCls} placeholder={ph}/>
                    </div>
                  ))}
                  {[['alignContent','align-content',['normal','start','end','center','stretch','space-between','space-around','space-evenly']],['justifyContent','justify-content',['start','end','center','stretch','space-between','space-around','space-evenly']],['placeItems','place-items',['auto','start','end','center','stretch','baseline']]].map(([prop,label,opts])=>(
                    <div key={prop}><label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{label}</label>
                      <select value={gridConfig[breakpoint][prop]} onChange={e=>updateGridConfig(breakpoint,prop,e.target.value)} className={selectCls}>
                        {opts.map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {[['direction','flex-direction',['row','row-reverse','column','column-reverse']],['wrap','flex-wrap',['nowrap','wrap','wrap-reverse']],['justify','justify-content',['flex-start','flex-end','center','space-between','space-around','space-evenly']],['align','align-items',['stretch','flex-start','flex-end','center','baseline']],['alignContent','align-content',['normal','flex-start','flex-end','center','space-between','space-around','stretch']]].map(([prop,label,opts])=>(
                    <div key={prop}><label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{label}</label>
                      <select value={flexConfig[breakpoint][prop]} onChange={e=>updateFlexConfig(breakpoint,prop,e.target.value)} className={selectCls}>
                        {opts.map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                  {[['gap','gap','20px'],['itemBasis','flex-basis','300px'],['itemGrow','flex-grow','1'],['itemShrink','flex-shrink','1']].map(([prop,label,ph])=>(
                    <div key={prop}><label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{label}</label>
                      <input type="text" value={flexConfig[breakpoint][prop]} onChange={e=>updateFlexConfig(breakpoint,prop,e.target.value)} className={inputCls} placeholder={ph}/>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Items */}
            <div className={`${cardCls} p-4`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Items ({items.length})</h3>
                <button onClick={addItem} className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg transition"><Plus className="w-4 h-4"/></button>
              </div>
              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {items.map(item=>(
                  <div key={item.id} onClick={()=>layoutType==='grid'&&setSelectedItemId(item.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all text-xs ${selectedItemId===item.id?'bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-500 text-indigo-700 dark:text-indigo-300':'bg-slate-50 dark:bg-slate-700 border-2 border-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600'}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{backgroundColor:item.color}}/>
                      <span className="font-semibold">{item.content}</span>
                    </div>
                    <button onClick={e=>{e.stopPropagation();removeItem(item.id);}} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition"><Trash2 className="w-3 h-3 text-red-500"/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Main panel ── */}
          <div className="lg:col-span-9 space-y-4">
            {/* grid-template-areas editor */}
            {layoutType==='grid' && showAreas && (
              <div className={`${cardCls} p-5`}>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2"><LayoutGrid className="w-4 h-4 text-violet-500"/> grid-template-areas Editor</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Define named grid areas. Each row is a quoted string. Names matching item content (case-insensitive) will be highlighted.</p>
                <textarea value={areaMap} onChange={e=>setAreaMap(e.target.value)} rows={4}
                  placeholder={`"header header header"\n"sidebar main aside"\n"footer footer footer"`}
                  className="w-full font-mono text-xs p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 resize-none"/>
                {areaMap && (
                  <div className="mt-3 p-3 bg-slate-900 rounded-xl">
                    <pre className="text-xs font-mono text-emerald-400">{`grid-template-areas:\n${areaMap.trim().split('\n').map(l=>`  ${l.trim()}`).join('\n')};`}</pre>
                  </div>
                )}
              </div>
            )}

            {/* Item controls (grid only) */}
            {layoutType==='grid' && selectedItem && (
              <div className={`${cardCls} p-5`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{backgroundColor:selectedItem.color}}/>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Item: {selectedItem.content}</h3>
                  <div className="ml-auto flex items-center gap-2">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Colour:</label>
                    <input type="color" value={selectedItem.color} onChange={e=>updateItem(selectedItem.id,'color',e.target.value)} className="w-8 h-7 rounded cursor-pointer border border-slate-300 dark:border-slate-600"/>
                  </div>
                </div>
                <div className="mb-3 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                  Configuring: <strong>{breakpoint}</strong> breakpoint
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {[['columnStart','column-start'],['columnEnd','column-end'],['rowStart','row-start'],['rowEnd','row-end']].map(([prop,label])=>(
                    <div key={prop}><label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{label}</label>
                      <input type="text" value={selectedItem.gridArea[breakpoint][prop]||''} onChange={e=>updateItemGridArea(selectedItem.id,breakpoint,prop,e.target.value)} className={inputCls} placeholder="auto or span 2"/>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {[['alignSelf','align-self',['auto','start','end','center','stretch','baseline']],['justifySelf','justify-self',['auto','start','end','center','stretch']]].map(([prop,label,opts])=>(
                    <div key={prop}><label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{label}</label>
                      <select value={selectedItem[prop]||'auto'} onChange={e=>updateItem(selectedItem.id,prop,e.target.value)} className={selectCls}>
                        {opts.map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-3 text-xs text-slate-500 dark:text-slate-400 mb-3 space-y-0.5">
                  <div><strong className="text-slate-700 dark:text-slate-300">Numbers:</strong> <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">1</code>, <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">2</code> — grid line numbers</div>
                  <div><strong className="text-slate-700 dark:text-slate-300">Span:</strong> <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">span 2</code> — span N tracks</div>
                  <div><strong className="text-slate-700 dark:text-slate-300">Range:</strong> <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">1 / -1</code> — full width</div>
                </div>
                <button onClick={()=>{['columnStart','columnEnd','rowStart','rowEnd'].forEach(p=>updateItemGridArea(selectedItem.id,breakpoint,p,''));}} className="w-full px-3 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-xs font-semibold transition">Clear {breakpoint} position</button>
              </div>
            )}

            {/* Preview */}
            <div className={`${cardCls} p-5`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Live Preview — {breakpoint}</h2>
                <div className="flex items-center gap-2">
                  {[{k:'desktop',I:Monitor},{k:'tablet',I:Tablet},{k:'mobile',I:Smartphone}].map(({k,I})=>(
                    <button key={k} onClick={()=>setBreakpoint(k)} className={`p-1.5 rounded-lg transition ${breakpoint===k?'bg-indigo-600 text-white':'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}><I className="w-4 h-4"/></button>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 min-h-[420px]" style={areaMap&&layoutType==='grid'?{...getContainerStyle(),gridTemplateAreas:areaMap.trim().split('\n').map(l=>l.trim()).join(' ')}:undefined}>
                <div style={areaMap&&layoutType==='grid'?{}:getContainerStyle()} className={areaMap&&layoutType==='grid'?'w-full':undefined}>
                  {(areaMap&&layoutType==='grid'?[]:items).map(item=>(
                    <div key={item.id} onClick={()=>layoutType==='grid'&&setSelectedItemId(item.id)} style={{...getItemStyle(item),backgroundColor:item.color}}
                      className={`rounded-xl p-4 flex items-center justify-center text-white font-bold text-sm shadow-lg transition-all cursor-pointer hover:shadow-xl hover:brightness-110 ${selectedItemId===item.id?'ring-4 ring-yellow-400 ring-offset-2':''}`}>
                      <div className="text-center">
                        <div>{item.content}</div>
                        {layoutType==='grid'&&Object.values(item.gridArea[breakpoint]).some(Boolean)&&(
                          <div className="text-xs mt-1 opacity-75 font-normal">
                            {item.gridArea[breakpoint].columnStart&&`col:${item.gridArea[breakpoint].columnStart}`}
                            {item.gridArea[breakpoint].columnEnd&&`→${item.gridArea[breakpoint].columnEnd}`}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {!!(areaMap&&layoutType==='grid')&&<div className="flex items-center justify-center h-40 text-slate-400 dark:text-slate-600 text-sm">Preview disabled while template-areas is active</div>}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-medium">💡 Click items to select &amp; configure position</span>
                {layoutType==='grid'&&<span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-medium">🎯 Each breakpoint can have unique positioning</span>}
              </div>
            </div>

            {/* Code output */}
            {showCode && (
              <div className={`${cardCls} p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Generated Code</h2>
                  <div className="flex gap-2">
                    <button onClick={copyOutput} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${copied?'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300':'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
                      {copied?<><Check className="w-3.5 h-3.5"/>Copied!</>:<><Copy className="w-3.5 h-3.5"/>Copy</>}
                    </button>
                    <button onClick={downloadOutput} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition">
                      <Download className="w-3.5 h-3.5"/>Download .{outputExt}
                    </button>
                  </div>
                </div>

                {/* Format tabs */}
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl mb-4">
                  {[['css','CSS'],['scss','SCSS + Vars'],['tailwind','Tailwind']].map(([k,label])=>(
                    <button key={k} onClick={()=>setOutputFormat(k)}
                      className={`flex-1 text-xs py-1.5 rounded-lg font-semibold transition ${outputFormat===k?'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm':'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                      {label}
                    </button>
                  ))}
                </div>

                <div className="bg-slate-900 rounded-xl p-5 overflow-auto max-h-[500px]">
                  <pre className={`text-xs font-mono leading-relaxed ${outputFormat==='tailwind'?'text-amber-400':'text-emerald-400'}`}>{activeOutput}</pre>
                </div>

                <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl">
                  <h3 className="font-semibold text-indigo-900 dark:text-indigo-200 text-xs mb-2">Implementation Guide</h3>
                  <ul className="text-xs text-indigo-800 dark:text-indigo-300 space-y-1">
                    <li>• Copy the code above and paste into your stylesheet{outputFormat==='scss'?' (.scss)':''}</li>
                    <li>• Add class <code className="bg-white dark:bg-slate-800 px-1 rounded font-mono">{layoutType==='grid'?'grid-container':'flex-container'}</code> to your container element</li>
                    {layoutType==='flex'&&<li>• Add class <code className="bg-white dark:bg-slate-800 px-1 rounded font-mono">flex-item</code> to each child</li>}
                    {layoutType==='grid'&&items.some(i=>BP.some(bp=>Object.values(i.gridArea[bp]).some(Boolean)))&&<li>• Add <code className="bg-white dark:bg-slate-800 px-1 rounded font-mono">grid-item-N</code> classes to positioned elements</li>}
                    <li>• The layout responds automatically to screen size changes</li>
                  </ul>
                </div>
              </div>
            )}

            {/* HTML Example */}
            {showCode && (
              <div className={`${cardCls} p-5`}>
                <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">HTML Example</h2>
                <div className="bg-slate-900 rounded-xl p-5 overflow-auto">
                  <pre className="text-xs text-amber-400 font-mono leading-relaxed">
{`<div class="${layoutType==='grid'?'grid-container':'flex-container'}">
${items.map(item=>{
  const hasGrid = layoutType==='grid'&&BP.some(bp=>Object.values(item.gridArea[bp]).some(Boolean));
  const cls = layoutType==='grid'?(hasGrid?`grid-item-${item.id}`:''):'flex-item';
  return `  <div${cls?` class="${cls}"`:''}>${item.content}</div>`;
}).join('\n')}
</div>`}
                  </pre>
                </div>
              </div>
            )}

            {/* Pro Tips */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-5">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-sm flex items-center gap-2"><Edit3 className="w-4 h-4 text-indigo-600"/>Pro Tips</h3>
              <div className="grid md:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300">
                {[
                  ['fr units','<code>1fr</code> = one fraction of free space. <code>repeat(3,1fr)</code> = 3 equal columns.'],
                  ['auto-fit magic','<code>repeat(auto-fit,minmax(250px,1fr))</code> creates a fully responsive grid — no media queries needed.'],
                  ['Spanning items','Use <code>grid-column: span 2</code> or <code>column-start: 1; column-end: 3</code> to make cells span multiple tracks.'],
                  ['SCSS nesting','The SCSS output uses nested <code>@media</code> for cleaner, more maintainable code with CSS custom properties.'],
                  ['align vs justify','In grid: <code>align</code> = block axis (vertical), <code>justify</code> = inline axis (horizontal).'],
                  ['minmax()','<code>minmax(min,max)</code> = column is at least min, at most max. Combine with auto-fit for zero-query responsive layouts.'],
                ].map(([t,d])=>(
                  <div key={t} className="flex gap-2">
                    <span className="text-indigo-500 font-bold flex-shrink-0">•</span>
                    <span><strong className="text-slate-800 dark:text-slate-200">{t}:</strong> <span dangerouslySetInnerHTML={{__html:d}}/></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}