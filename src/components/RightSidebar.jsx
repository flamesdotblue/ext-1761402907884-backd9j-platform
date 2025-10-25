import React, { useState } from 'react';
import { Palette, Droplets, Gauge, FolderPlus } from 'lucide-react';

export default function RightSidebar({ selectedMesh, onUpdateMaterial, onUpdateMesh, aiParams, setAiParams, onExport, exporting, onCancelExport }) {
  const [activeTab, setActiveTab] = useState('properties');

  return (
    <div className="w-[340px] shrink-0 border-l border-white/10 bg-[#141414] flex flex-col min-h-0">
      <div className="p-3 border-b border-white/10 grid grid-cols-3 gap-1">
        <TabButton active={activeTab==='properties'} onClick={() => setActiveTab('properties')}>Properties</TabButton>
        <TabButton active={activeTab==='materials'} onClick={() => setActiveTab('materials')}>Materials</TabButton>
        <TabButton active={activeTab==='export'} onClick={() => setActiveTab('export')}>Export</TabButton>
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-4">
        {activeTab === 'properties' && (
          <div className="space-y-4">
            <Section title="Mesh">
              <Range label="Resolution" min={1} max={8} step={1} value={selectedMesh.resolution} onChange={(v)=> onUpdateMesh({ resolution: v })} />
              <Range label="LOD" min={1} max={5} step={1} value={selectedMesh.lod || 1} onChange={(v)=> onUpdateMesh({ lod: v })} />
              <div className="flex items-center gap-2">
                <button onClick={() => onUpdateMesh({ name: selectedMesh.name + ' *' })} className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded">Rename</button>
                <button onClick={() => alert('Boolean operations modify geometry non-destructively (mock)')} className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded">Non-Destructive On</button>
              </div>
            </Section>

            <Section title="AI Parameters">
              <Select label="Style" value={aiParams.style} onChange={v => setAiParams(p => ({ ...p, style: v }))} options={[
                { label: 'Photorealistic', value: 'photorealistic' },
                { label: 'Stylized', value: 'stylized' },
                { label: 'Abstract', value: 'abstract' },
                { label: 'Low Poly', value: 'lowpoly' },
              ]} />
              <Range label="Complexity" value={aiParams.complexity} onChange={v => setAiParams(p => ({ ...p, complexity: v }))} />
              <Range label="Detail" value={aiParams.detail} onChange={v => setAiParams(p => ({ ...p, detail: v }))} />
            </Section>

            <Section title="Animation Keyframes">
              <Select label="Interpolation" value={'linear'} onChange={()=>{}} options={[
                { label: 'Linear', value: 'linear' },
                { label: 'Ease In', value: 'easeIn' },
                { label: 'Ease Out', value: 'easeOut' },
                { label: 'Ease In-Out', value: 'easeInOut' },
              ]}/>
            </Section>

            <Section title="Boolean Ops">
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => onUpdateMesh({ resolution: Math.min(8, selectedMesh.resolution + 1) })} className="bg-white/5 hover:bg-white/10 rounded p-2">Union</button>
                <button onClick={() => onUpdateMesh({ resolution: Math.max(1, selectedMesh.resolution - 1) })} className="bg-white/5 hover:bg-white/10 rounded p-2">Subtract</button>
                <button onClick={() => onUpdateMesh({ resolution: selectedMesh.resolution })} className="bg-white/5 hover:bg-white/10 rounded p-2">Intersect</button>
              </div>
            </Section>
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="space-y-4">
            <Section title="Material Properties">
              <Color label="Base Color" value={selectedMesh.material.color} onChange={(v) => onUpdateMaterial({ color: v })} />
              <Range label="Metalness" value={selectedMesh.material.metalness} onChange={(v) => onUpdateMaterial({ metalness: v })} />
              <Range label="Roughness" value={selectedMesh.material.roughness} onChange={(v) => onUpdateMaterial({ roughness: v })} />
            </Section>
            <Section title="Texture Maps (PBR)">
              <TextureInput label="Diffuse" />
              <TextureInput label="Specular" />
              <TextureInput label="Normal" />
              <TextureInput label="Roughness" />
            </Section>
            <Section title="Material Library">
              <div className="grid grid-cols-3 gap-2">
                {['Matte', 'Glossy', 'Metal', 'Wood', 'Fabric', 'Skin'].map((m) => (
                  <button key={m} onClick={() => onUpdateMaterial({ roughness: m==='Glossy'?0.1:m==='Metal'?0.3:0.6, metalness: m==='Metal'?0.9:0.2 })} className="bg-white/5 hover:bg-white/10 rounded p-2 text-xs">{m}</button>
                ))}
                <button className="bg-[#26A69A] text-black rounded p-2 text-xs flex items-center justify-center gap-1"><FolderPlus size={14}/>Save</button>
              </div>
            </Section>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-3">
            <p className="text-sm text-white/70">Export your model to common 3D formats with customizable settings.</p>
            <div className="grid grid-cols-2 gap-2">
              <button disabled={exporting} onClick={() => onExport('obj', { polygonCount: 'auto', textureResolution: 2 })} className="bg-white/5 hover:bg-white/10 rounded p-2">OBJ</button>
              <button disabled={exporting} onClick={() => onExport('fbx', { polygonCount: 'auto', textureResolution: 2 })} className="bg-white/5 hover:bg-white/10 rounded p-2">FBX</button>
              <button disabled={exporting} onClick={() => onExport('stl', { polygonCount: 'auto' })} className="bg-white/5 hover:bg-white/10 rounded p-2">STL</button>
              <button disabled={exporting} onClick={() => onExport('gltf', { polygonCount: 'auto', textureResolution: 2 })} className="bg-white/5 hover:bg-white/10 rounded p-2">glTF</button>
            </div>
            {exporting ? (
              <button onClick={onCancelExport} className="w-full bg-red-500/80 hover:bg-red-500 py-2 rounded">Cancel Export</button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return <button onClick={onClick} className={`px-2 py-1.5 rounded text-sm ${active ? 'bg-[#26A69A] text-black' : 'bg-white/5 hover:bg-white/10'}`}>{children}</button>;
}

function Section({ title, children }) {
  return (
    <div className="bg-white/5 rounded p-3">
      <div className="text-xs uppercase tracking-wider text-white/60 mb-2">{title}</div>
      {children}
    </div>
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

function Color({ label, value, onChange }) {
  return (
    <label className="block text-sm">
      <div className="text-xs text-white/60 mb-1 flex items-center gap-2"><Palette size={14}/>{label}</div>
      <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-full h-8 bg-transparent"/>
    </label>
  );
}

function TextureInput({ label }) {
  return (
    <label className="block text-sm">
      <div className="text-xs text-white/60 mb-1 flex items-center gap-2"><Droplets size={14}/>{label}</div>
      <input type="file" accept="image/*" className="w-full text-xs"/>
    </label>
  );
}
