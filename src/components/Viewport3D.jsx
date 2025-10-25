import React, { useEffect, useRef, useState } from 'react';

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vsSource, fsSource) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

export default function Viewport3D({ accent = '#26A69A', material, lod = 1, resolution = 1 }) {
  const canvasRef = useRef(null);
  const [camera, setCamera] = useState({ rx: 0.6, ry: 0.6, distance: 3 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vs = `
    attribute vec3 aPos; attribute vec3 aColor; varying vec3 vColor; uniform mat4 uProj; uniform mat4 uView; uniform mat4 uModel; void main(){ vColor=aColor; gl_Position = uProj*uView*uModel*vec4(aPos,1.0); }
    `;
    const fs = `
    precision mediump float; varying vec3 vColor; uniform vec3 uTint; uniform float uRough; void main(){ vec3 c = mix(vColor, uTint, 0.5); float f = 0.8 - uRough*0.5; gl_FragColor = vec4(c*f, 1.0); }
    `;

    const program = createProgram(gl, vs, fs);
    const aPos = gl.getAttribLocation(program, 'aPos');
    const aColor = gl.getAttribLocation(program, 'aColor');
    const uProj = gl.getUniformLocation(program, 'uProj');
    const uView = gl.getUniformLocation(program, 'uView');
    const uModel = gl.getUniformLocation(program, 'uModel');
    const uTint = gl.getUniformLocation(program, 'uTint');
    const uRough = gl.getUniformLocation(program, 'uRough');

    const cube = makeCube(Math.max(1, Math.min(8, resolution)));

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.verts), gl.STATIC_DRAW);

    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cube.indices), gl.STATIC_DRAW);

    gl.enable(gl.DEPTH_TEST);

    function render(time) {
      resize(gl, canvas);
      gl.viewport(0,0,canvas.width, canvas.height);
      gl.clearColor(0.07,0.07,0.07,1);
      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 24, 0);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 24, 12);
      gl.enableVertexAttribArray(aColor);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

      const proj = mat4Perspective(45*Math.PI/180, canvas.width/canvas.height, 0.1, 100);
      const view = mat4LookAt([Math.sin(camera.ry)*camera.distance, camera.rx*camera.distance, Math.cos(camera.ry)*camera.distance], [0,0,0], [0,1,0]);
      const model = mat4RotateY(time*0.0005 * (2/lod));

      gl.uniformMatrix4fv(uProj, false, proj);
      gl.uniformMatrix4fv(uView, false, view);
      gl.uniformMatrix4fv(uModel, false, model);

      const tint = hexToRgb(material?.color || '#ffffff');
      gl.uniform3f(uTint, tint[0]/255, tint[1]/255, tint[2]/255);
      gl.uniform1f(uRough, material?.roughness ?? 0.6);

      gl.drawElements(gl.TRIANGLES, cube.indices.length, gl.UNSIGNED_SHORT, 0);
      requestAnimationFrame(render);
    }
    const raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [camera.distance, camera.rx, camera.ry, material, lod, resolution]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const onDown = (e) => { dragging.current = true; last.current = { x: e.clientX, y: e.clientY }; };
    const onUp = () => { dragging.current = false; };
    const onMove = (e) => {
      if (!dragging.current) return;
      const dx = (e.clientX - last.current.x) * 0.01;
      const dy = (e.clientY - last.current.y) * 0.01;
      last.current = { x: e.clientX, y: e.clientY };
      setCamera(c => ({ ...c, ry: c.ry + dx, rx: Math.max(-1.2, Math.min(1.2, c.rx + dy)) }));
    };
    const onWheel = (e) => setCamera(c => ({ ...c, distance: Math.max(1.5, Math.min(10, c.distance + (e.deltaY>0?0.3:-0.3))) }));
    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);
    canvas.addEventListener('wheel', onWheel);
    return () => {
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      <canvas ref={canvasRef} className="w-full h-full block"/>
      <div className="absolute left-3 top-3 bg-black/40 backdrop-blur rounded px-2 py-1 text-xs">
        <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: accent }} />Viewport • Real-time
      </div>
    </div>
  );
}

function resize(gl, canvas){
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (canvas.width !== Math.floor(w*dpr) || canvas.height !== Math.floor(h*dpr)){
    canvas.width = Math.floor(w*dpr);
    canvas.height = Math.floor(h*dpr);
  }
}

function makeCube(subdiv=1){
  const s = 1;
  const positions = [];
  const colors = [];
  const indices = [];
  const faces = [
    { n:[1,0,0], u:[0,1,0], v:[0,0,1], c:[1,0.7,0.2] },
    { n:[-1,0,0], u:[0,1,0], v:[0,0,-1], c:[0.2,0.7,1] },
    { n:[0,1,0], u:[1,0,0], v:[0,0,-1], c:[0.7,1,0.2] },
    { n:[0,-1,0], u:[1,0,0], v:[0,0,1], c:[1,0.2,0.7] },
    { n:[0,0,1], u:[1,0,0], v:[0,1,0], c:[0.7,0.2,1] },
    { n:[0,0,-1], u:[-1,0,0], v:[0,1,0], c:[0.2,1,0.7] },
  ];
  let vertCount = 0;
  faces.forEach(face => {
    for (let y=0; y<=subdiv; y++){
      for (let x=0; x<=subdiv; x++){
        const u = (x/subdiv - 0.5) * 2 * s;
        const v = (y/subdiv - 0.5) * 2 * s;
        const px = face.n[0]*s + face.u[0]*u + face.v[0]*v;
        const py = face.n[1]*s + face.u[1]*u + face.v[1]*v;
        const pz = face.n[2]*s + face.u[2]*u + face.v[2]*v;
        positions.push(px, py, pz);
        colors.push(face.c[0], face.c[1], face.c[2]);
      }
    }
    for (let y=0; y<subdiv; y++){
      for (let x=0; x<subdiv; x++){
        const i = vertCount + y*(subdiv+1) + x;
        indices.push(i, i+1, i+subdiv+1);
        indices.push(i+1, i+subdiv+2, i+subdiv+1);
      }
    }
    vertCount += (subdiv+1)*(subdiv+1);
  });
  const verts = [];
  for (let i=0;i<positions.length/3;i++){
    verts.push(positions[i*3+0], positions[i*3+1], positions[i*3+2], colors[i*3+0], colors[i*3+1], colors[i*3+2]);
  }
  return { verts, indices };
}

function mat4Perspective(fovy, aspect, near, far){
  const f=1/Math.tan(fovy/2), nf=1/(near-far); return new Float32Array([
    f/aspect,0,0,0,
    0,f,0,0,
    0,0,(far+near)*nf,-1,
    0,0,(2*far*near)*nf,0
  ]);
}

function mat4LookAt(eye, target, up){
  const [ex,ey,ez]=eye,[tx,ty,tz]=target,[ux,uy,uz]=up; let zx=ex-tx,zy=ey-ty,zz=ez-tz; const zl=1/Math.hypot(zx,zy,zz); zx*=zl; zy*=zl; zz*=zl; let xx=uy*zz-uz*zy, xy=uz*zx-ux*zz, xz=ux*zy-uy*zx; const xl=1/Math.hypot(xx,xy,xz); xx*=xl; xy*=xl; xz*=xl; const yx=zy*xz-zz*xy, yy=zz*xx-zx*xz, yz=zx*xy-zy*xx; return new Float32Array([
    xx, yx, zx, 0,
    xy, yy, zy, 0,
    xz, yz, zz, 0,
    -(xx*ex+xy*ey+xz*ez), -(yx*ex+yy*ey+yz*ez), -(zx*ex+zy*ey+zz*ez), 1
  ]);
}

function mat4RotateY(a){
  const c=Math.cos(a), s=Math.sin(a); return new Float32Array([
    c,0,-s,0,
    0,1,0,0,
    s,0,c,0,
    0,0,0,1
  ]);
}

function hexToRgb(hex){
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); if (!m) return [255,255,255]; return [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)];
}
