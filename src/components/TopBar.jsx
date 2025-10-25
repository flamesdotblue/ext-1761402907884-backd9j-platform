import React, { useState } from 'react';
import { Save, Upload, Download, Undo2, Redo2, HelpCircle, Share2, Cloud, FolderOpen, PlusCircle, Settings } from 'lucide-react';

export default function TopBar({ onNew, onOpen, onSave, onExport, onCancelExport, exporting, onUndo, onRedo, canUndo, canRedo, onHelp }) {
  const [exportSettings, setExportSettings] = useState({ format: 'glb', polygonCount: 'auto', textureResolution: 2 });

  return (
    <div className="w-full border-b border-white/10 bg-[#141414]">
      <div className="max-w-[1800px] mx-auto px-4 py-2 flex items-center gap-2">
        <div className="flex items-center gap-2 pr-4">
          <div className="w-2.5 h-2.5 rounded-full bg-[#26A69A]" />
          <span className="font-semibold tracking-wide">Aquila 3D Studio</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onNew} className="px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-sm flex items-center gap-1"><PlusCircle size={16}/>New</button>
          <button onClick={onOpen} className="px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-sm flex items-center gap-1"><FolderOpen size={16}/>Open</button>
          <button onClick={onSave} className="px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-sm flex items-center gap-1"><Save size={16}/>Save</button>
        </div>
        <div className="flex items-center gap-1 pl-2">
          <button disabled={!canUndo} onClick={onUndo} className={`px-2.5 py-1.5 rounded text-sm flex items-center gap-1 ${canUndo ? 'bg-white/5 hover:bg-white/10' : 'bg-white/5 opacity-50 cursor-not-allowed'}`}><Undo2 size={16}/>Undo</button>
          <button disabled={!canRedo} onClick={onRedo} className={`px-2.5 py-1.5 rounded text-sm flex items-center gap-1 ${canRedo ? 'bg-white/5 hover:bg-white/10' : 'bg-white/5 opacity-50 cursor-not-allowed'}`}><Redo2 size={16}/>Redo</button>
        </div>
        <div className="flex items-center gap-2 pl-2">
          <div className="flex items-center gap-2 bg-white/5 rounded px-2 py-1.5">
            <select value={exportSettings.format} onChange={e => setExportSettings(s => ({ ...s, format: e.target.value }))} className="bg-transparent text-sm outline-none">
              <option value="obj">OBJ</option>
              <option value="fbx">FBX</option>
              <option value="stl">STL</option>
              <option value="gltf">glTF</option>
              <option value="glb">GLB</option>
            </select>
            <input type="text" value={exportSettings.polygonCount} onChange={e => setExportSettings(s => ({ ...s, polygonCount: e.target.value }))} className="bg-transparent text-sm outline-none w-20" placeholder="poly"/>
            <input type="number" min={1} max={8} value={exportSettings.textureResolution} onChange={e => setExportSettings(s => ({ ...s, textureResolution: parseInt(e.target.value || 1) }))} className="bg-transparent text-sm outline-none w-12"/>
            {!exporting ? (
              <button onClick={() => onExport(exportSettings.format, exportSettings)} className="px-2 py-1 rounded bg-[#26A69A] text-black text-sm flex items-center gap-1"><Download size={16}/>Export</button>
            ) : (
              <button onClick={onCancelExport} className="px-2 py-1 rounded bg-red-500/80 hover:bg-red-500 text-sm">Cancel</button>
            )}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-sm flex items-center gap-1"><Cloud size={16}/>Drive</button>
          <button className="px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-sm flex items-center gap-1"><Share2 size={16}/>Collaborate</button>
          <button className="px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-sm flex items-center gap-1"><Settings size={16}/>Settings</button>
          <button onClick={onHelp} className="px-2.5 py-1.5 rounded bg-[#26A69A] text-black text-sm flex items-center gap-1"><HelpCircle size={16}/>Help</button>
        </div>
      </div>
    </div>
  );
}
