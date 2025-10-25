import React from 'react';

export default function TutorialModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[#121212] border border-white/10 rounded-lg max-w-xl w-full p-5 shadow-xl">
        <h2 className="text-lg font-semibold mb-2">Welcome to Aquila 3D Studio</h2>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-white/80">
          <li>Use the left sidebar to generate models from text or images, or to sculpt, paint, rig, and animate.</li>
          <li>Interact with the 3D viewport: drag to orbit, scroll to zoom. Real-time rendering adapts to model resolution and LOD.</li>
          <li>Fine-tune materials, mesh settings, and AI parameters in the right sidebar.</li>
          <li>All edits are non-destructive. Use Undo/Redo in the top bar to iterate safely.</li>
          <li>Export to OBJ, FBX, STL, or glTF with custom polygon counts and texture resolutions.</li>
          <li>Long operations show progress and can be canceled. Collaboration and cloud save are available from the top bar.</li>
        </ol>
        <div className="flex items-center justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10">Close</button>
          <button onClick={onClose} className="px-3 py-1.5 rounded bg-[#26A69A] text-black">Start Creating</button>
        </div>
      </div>
    </div>
  );
}
