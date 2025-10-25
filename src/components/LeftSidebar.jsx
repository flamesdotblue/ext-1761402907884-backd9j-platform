import React, { useRef, useState } from 'react';
import { Wand2, Image as ImageIcon, Brush, Eraser, Layers, Bone, Play, Pause, Scissors, SlidersHorizontal, Activity } from 'lucide-react';

export default function LeftSidebar({ aiParams, setAiParams, onGenerate, onCancelGenerate, isGenerating, onSculpt, onPaintTexture, onBoolean, onSimplify, onRetopo, animation, onTimelineChange }) {
  const [activeTool, setActiveTool] = useState('ai');
  const imgInput = useRef(null);

  return (
    <div className="w-[320px] shrink-0 border-r border-white/10 bg-[#141414] flex flex-col min-h-0">
      <div className="p-3 border-b border-white/10">
        <div className="grid grid-cols-6 gap-1">
          <ToolButton active={activeTool==='ai'} onClick={() => setActiveTool('ai')} icon={<Wand2 size={16}/>} label="Text 3D"/>
          <ToolButton active={activeTool==='img'} onClick={() => setActiveTool('img')} icon={<ImageIcon size={16}/>} label="Img 3D"/>
          <ToolButton active={activeTool==='sculpt'} onClick={() => setActiveTool('sculpt')} icon={<Brush size={16}/>} label="Sculpt"/>
          <ToolButton active={activeTool==='paint'} onClick={() => setActiveTool('paint')} icon={<Layers size={16}/>} label="Paint"/>
          <ToolButton active={activeTool==='rig'} onClick={() => setActiveTool('rig')} icon={<Bone size={16}/>} label="Rig"/>
          <ToolButton active={activeTool==='anim'} onClick={() => setActiveTool('anim')} icon={<Play size={16}/>} label="Animate"/>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        {activeTool === 'ai' && (
          <div className="space-y-3">
            <h3 className="text-sm uppercase tracking-wider text-white/60">Text to 3D</h3>
            <textarea value={aiParams.prompt} onChange={e => setAiParams(p => ({ ...p, prompt: e.target.value }))} rows={3} placeholder="Describe your 3D model..." className="w-full bg-white/5 rounded p-2 outline-none"/>
            <div className="grid grid-cols-2 gap-2">
              <Select label="Style" value={aiParams.style} onChange={v => setAiParams(p => ({ ...p, style: v }))} options={[
                { label: 'Photorealistic', value: 'photorealistic' },
                { label: 'Stylized', value: 'stylized' },
                { label: 'Abstract', value: 'abstract' },
                { label: 'Low Poly', value: 'lowpoly' },
              ]}/>
              <Range label="Complexity" value={aiParams.complexity} onChange={v => setAiParams(p => ({ ...p, complexity: v }))}/>
              <Range label="Detail" value={aiParams.detail} onChange={v => setAiParams(p => ({ ...p, detail: v }))}/>
            </div>
            {!isGenerating ? (
              <button onClick={() => { setAiParams(p => ({ ...p, mode: 'text' })); onGenerate(); }} className="w-full bg-[#26A69A] hover:brightness-110 text-black py-2 rounded">Generate</button>
            ) : (
              <button onClick={onCancelGenerate} className="w-full bg-red-500/80 hover:bg-red-500 py-2 rounded">Cancel</button>
            )}
          </div>
        )}

        {activeTool === 'img' && (
          <div className="space-y-3">
            <h3 className="text-sm uppercase tracking-wider text-white/60">Image to 3D</h3>
            <input ref={imgInput} onChange={(e) => setAiParams(p => ({ ...p, image: e.target.files?.[0] || null }))} type="file" accept="image/png,image/jpeg,image/tiff" className="block w-full text-sm"/>
            <div className="grid grid-cols-2 gap-2">
              <Range label="Depth" value={aiParams.reconstruction.depthEstimation} onChange={v => setAiParams(p => ({ ...p, reconstruction: { ...p.reconstruction, depthEstimation: v } }))}/>
              <Range label="Mesh Density" value={aiParams.reconstruction.meshDensity} onChange={v => setAiParams(p => ({ ...p, reconstruction: { ...p.reconstruction, meshDensity: v } }))}/>
              <Range label="Texture Detail" value={aiParams.reconstruction.textureDetail} onChange={v => setAiParams(p => ({ ...p, reconstruction: { ...p.reconstruction, textureDetail: v } }))}/>
            </div>
            {!isGenerating ? (
              <button onClick={() => { setAiParams(p => ({ ...p, mode: 'image' })); onGenerate(); }} className="w-full bg-[#26A69A] hover:brightness-110 text-black py-2 rounded">Reconstruct</button>
            ) : (
              <button onClick={onCancelGenerate} className="w-full bg-red-500/80 hover:bg-red-500 py-2 rounded">Cancel</button>
            )}
          </div>
        )}

        {activeTool === 'sculpt' && (
          <div className="space-y-3">
            <h3 className="text-sm uppercase tracking-wider text-white/60">Sculpt</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => onSculpt(1)} className="bg-white/5 hover:bg-white/10 rounded p-2 flex items-center gap-2"><Brush size={16}/>Inflate</button>
              <button onClick={() => onSculpt(-1)} className="bg-white/5 hover:bg-white/10 rounded p-2 flex items-center gap-2"><Eraser size={16}/>Smooth</button>
              <button onClick={onSimplify} className="bg-white/5 hover:bg-white/10 rounded p-2 flex items-center gap-2"><Scissors size={16}/>Simplify</button>
              <button onClick={onRetopo} className="bg-white/5 hover:bg-white/10 rounded p-2 flex items-center gap-2"><SlidersHorizontal size={16}/>Retopo</button>
            </div>
          </div>
        )}

        {activeTool === 'paint' && (
          <div className="space-y-3">
            <h3 className="text-sm uppercase tracking-wider text-white/60">Texture Paint</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => onPaintTexture('Base Color')} className="bg-white/5 hover:bg-white/10 rounded p-2">Base</button>
              <button onClick={() => onPaintTexture('Details')} className="bg-white/5 hover:bg-white/10 rounded p-2">Details</button>
              <button onClick={() => onPaintTexture('AO')} className="bg-white/5 hover:bg-white/10 rounded p-2">AO</button>
              <button onClick={() => onPaintTexture('Roughness')} className="bg-white/5 hover:bg-white/10 rounded p-2">Rough</button>
            </div>
            <div className="text-xs text-white/60">Supports layering, masking, and PBR maps.</div>
          </div>
        )}

        {activeTool === 'rig' && (
          <div className="space-y-3">
            <h3 className="text-sm uppercase tracking-wider text-white/60">Rigging</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="bg-white/5 hover:bg-white/10 rounded p-2">Add Bone</button>
              <button className="bg-white/5 hover:bg-white/10 rounded p-2">Auto Skin</button>
              <button className="bg-white/5 hover:bg-white/10 rounded p-2">IK Toggle</button>
              <button className="bg-white/5 hover:bg-white/10 rounded p-2">Import BVH</button>
            </div>
            <div className="text-xs text-white/60">Supports IK and motion capture (BVH, FBX).</div>
          </div>
        )}

        {activeTool === 'anim' && (
          <div className="space-y-3">
            <h3 className="text-sm uppercase tracking-wider text-white/60">Animation</h3>
            <div className="flex items-center gap-2">
              <button className="bg-white/5 hover:bg-white/10 rounded p-2"><Play size={16}/></button>
              <button className="bg-white/5 hover:bg-white/10 rounded p-2"><Pause size={16}/></button>
              <button className="bg-white/5 hover:bg-white/10 rounded p-2"><Activity size={16}/></button>
            </div>
            <Range label={`Time: ${animation.currentTime.toFixed(2)}s`} min={0} max={10} step={0.01} value={animation.currentTime} onChange={v => onTimelineChange(v)} />
            <div className="text-xs text-white/60">Keyframe editor with interpolation and easing presets.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function ToolButton({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`h-9 rounded text-xs flex items-center justify-center gap-1 ${active ? 'bg-[#26A69A] text-black' : 'bg-white/5 hover:bg-white/10'}`} title={label}>
      {icon}<span className="hidden lg:inline">{label}</span>
    </button>
  );
}

function Range({ label, value, onChange, min=0, max=1, step=0.01 }) {
  return (
    <label className="block text-sm">
      <div className="flex items-center justify-between text-xs text-white/60 mb-1">{label}<span className="text-white/50">{typeof value === 'number' ? value.toFixed(2) : ''}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} className="w-full accent-[#26A69A]"/>
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block text-sm">
      <div className="text-xs text-white/60 mb-1">{label}</div>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-white/5 rounded p-2 outline-none">
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </label>
  );
}
