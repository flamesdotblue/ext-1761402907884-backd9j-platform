import React, { useCallback, useMemo, useRef, useState } from 'react';
import TopBar from './components/TopBar';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import Viewport3D from './components/Viewport3D';
import TutorialModal from './components/TutorialModal';

const defaultMaterial = {
  color: '#ffffff',
  metalness: 0.2,
  roughness: 0.6,
  maps: {
    diffuse: null,
    specular: null,
    normal: null,
    roughness: null,
  },
};

const defaultAIParams = {
  mode: 'text', // 'text' | 'image'
  prompt: '',
  style: 'photorealistic',
  complexity: 0.5,
  detail: 0.5,
  image: null,
  reconstruction: {
    depthEstimation: 0.6,
    meshDensity: 0.5,
    textureDetail: 0.7,
  },
};

const defaultMesh = {
  id: 'mesh-1',
  name: 'Generated Mesh',
  resolution: 1,
  lod: 1,
  material: defaultMaterial,
};

export default function App() {
  const [scene, setScene] = useState({
    meshes: [defaultMesh],
    selectedMeshId: 'mesh-1',
    animation: { playing: false, timeline: [], currentTime: 0 },
    rig: { bones: [], ikEnabled: true },
    retopo: { enabled: false },
  });

  const [aiParams, setAiParams] = useState(defaultAIParams);
  const [isGenerating, setIsGenerating] = useState(false);
  const generationAbortRef = useRef({ aborted: false });
  const [exporting, setExporting] = useState(false);
  const exportAbortRef = useRef({ aborted: false });
  const [showTutorial, setShowTutorial] = useState(true);

  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const pushHistory = useCallback((nextScene) => {
    setHistory((h) => [...h, scene]);
    setFuture([]);
    setScene(nextScene);
  }, [scene]);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setFuture((f) => [scene, ...f]);
      setScene(prev);
      return h.slice(0, -1);
    });
  }, [scene]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      setHistory((h) => [...h, scene]);
      setScene(next);
      return f.slice(1);
    });
  }, [scene]);

  const selectedMesh = useMemo(() => scene.meshes.find(m => m.id === scene.selectedMeshId) || scene.meshes[0], [scene]);

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    generationAbortRef.current.aborted = false;
    const start = Date.now();
    const tick = () => {
      if (generationAbortRef.current.aborted) {
        setIsGenerating(false);
        return;
      }
      const elapsed = Date.now() - start;
      if (elapsed > 2500) {
        const newMesh = {
          ...defaultMesh,
          id: `mesh-${Date.now()}`,
          name: aiParams.mode === 'text' ? `AI: ${aiParams.prompt || 'Untitled'}` : 'AI: Image Recon',
          resolution: Math.max(1, Math.round(aiParams.reconstruction.meshDensity * 4)),
          material: { ...defaultMaterial },
        };
        pushHistory({
          ...scene,
          meshes: [...scene.meshes, newMesh],
          selectedMeshId: newMesh.id,
        });
        setIsGenerating(false);
      } else {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }, [aiParams, pushHistory, scene]);

  const cancelGenerate = useCallback(() => {
    generationAbortRef.current.aborted = true;
  }, []);

  const handleExport = useCallback((format, settings) => {
    setExporting(true);
    exportAbortRef.current.aborted = false;
    const start = Date.now();
    const duration = 1800 + Math.round((settings?.textureResolution || 1) * 600);
    const tick = () => {
      if (exportAbortRef.current.aborted) {
        setExporting(false);
        return;
      }
      if (Date.now() - start > duration) {
        setExporting(false);
        // In real app, trigger file download here
        alert(`Exported ${format.toUpperCase()} with poly=${settings?.polygonCount || 'auto'}, texRes=${settings?.textureResolution || 'auto'}`);
      } else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  const cancelExport = useCallback(() => {
    exportAbortRef.current.aborted = true;
  }, []);

  const updateMaterial = useCallback((patch) => {
    const next = {
      ...scene,
      meshes: scene.meshes.map(m => m.id === selectedMesh.id ? { ...m, material: { ...m.material, ...patch } } : m),
    };
    pushHistory(next);
  }, [scene, selectedMesh, pushHistory]);

  const updateMesh = useCallback((patch) => {
    const next = {
      ...scene,
      meshes: scene.meshes.map(m => m.id === selectedMesh.id ? { ...m, ...patch } : m),
    };
    pushHistory(next);
  }, [scene, selectedMesh, pushHistory]);

  const applyBooleanOp = useCallback((type) => {
    // Simulated boolean operation: adjust resolution
    const factor = type === 'union' ? 1 : type === 'subtract' ? -1 : 0;
    updateMesh({ resolution: Math.max(1, selectedMesh.resolution + factor) });
  }, [selectedMesh, updateMesh]);

  const simplifyMesh = useCallback(() => {
    updateMesh({ resolution: Math.max(1, selectedMesh.resolution - 1) });
  }, [selectedMesh, updateMesh]);

  const retopologize = useCallback(() => {
    const next = { ...scene, retopo: { enabled: true } };
    pushHistory(next);
    setTimeout(() => pushHistory({ ...next, retopo: { enabled: false } }), 800);
  }, [scene, pushHistory]);

  const onPaintTexture = useCallback((layerName) => {
    // Simulate texture layer application by toggling roughness
    const newRough = Math.min(1, (selectedMesh.material.roughness || 0.6) + 0.05);
    updateMaterial({ roughness: newRough });
  }, [selectedMesh, updateMaterial]);

  const onSculpt = useCallback((strength) => {
    updateMesh({ resolution: Math.max(1, Math.round(selectedMesh.resolution + strength)) });
  }, [selectedMesh, updateMesh]);

  const onTimelineChange = useCallback((time) => {
    const next = { ...scene, animation: { ...scene.animation, currentTime: time } };
    pushHistory(next);
  }, [scene, pushHistory]);

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      <TopBar
        onNew={() => {
          pushHistory({ meshes: [defaultMesh], selectedMeshId: 'mesh-1', animation: { playing: false, timeline: [], currentTime: 0 }, rig: { bones: [], ikEnabled: true }, retopo: { enabled: false } });
        }}
        onOpen={() => alert('Open project (mock)')}
        onSave={() => alert('Saved to cloud (mock)')}
        onExport={(fmt, settings) => handleExport(fmt, settings)}
        onCancelExport={cancelExport}
        exporting={exporting}
        onUndo={undo}
        onRedo={redo}
        canUndo={history.length > 0}
        canRedo={future.length > 0}
        onHelp={() => setShowTutorial(true)}
      />
      <div className="flex flex-1 min-h-0">
        <LeftSidebar
          aiParams={aiParams}
          setAiParams={setAiParams}
          onGenerate={handleGenerate}
          onCancelGenerate={cancelGenerate}
          isGenerating={isGenerating}
          onSculpt={onSculpt}
          onPaintTexture={onPaintTexture}
          onBoolean={applyBooleanOp}
          onSimplify={simplifyMesh}
          onRetopo={retopologize}
          animation={scene.animation}
          onTimelineChange={onTimelineChange}
        />
        <div className="flex-1 min-w-0 relative">
          <Viewport3D
            accent="#26A69A"
            material={selectedMesh.material}
            lod={selectedMesh.lod}
            resolution={selectedMesh.resolution}
          />
        </div>
        <RightSidebar
          selectedMesh={selectedMesh}
          onUpdateMaterial={updateMaterial}
          onUpdateMesh={updateMesh}
          aiParams={aiParams}
          setAiParams={setAiParams}
          onExport={handleExport}
          exporting={exporting}
          onCancelExport={cancelExport}
        />
      </div>
      <TutorialModal open={showTutorial} onClose={() => setShowTutorial(false)} />
    </div>
  );
}
