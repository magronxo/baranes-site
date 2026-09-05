(() => {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const STORAGE_KEY = "baranes:atlas:routing-orchestration:v1";
  const svg = document.getElementById("routing-atlas");
  const planeLayer = document.getElementById("planes");
  const edgeLayer = document.getElementById("edges");
  const edgeLabelLayer = document.getElementById("edge-labels");
  const nodeLayer = document.getElementById("nodes");
  const handleLayer = document.getElementById("edge-handles");
  const card = document.getElementById("routing-card");
  const statusEl = document.getElementById("routing-status");
  const saveButton = document.getElementById("save-layout");
  const viewButton = document.getElementById("mode-view");
  const designButton = document.getElementById("mode-design");

  if (!svg || !planeLayer || !edgeLayer || !nodeLayer) return;

  const planes = [
    { id:"authority", label:"AUTHORITY", subtitle:"product ownership and technical path", x:55, y:55, w:510, h:205 },
    { id:"routing", label:"ROUTING", subtitle:"ingress, interpretation and binding", x:610, y:55, w:955, h:205 },
    { id:"orchestration", label:"ORCHESTRATION", subtitle:"current actors plus explicitly non-canonical candidates", x:55, y:305, w:1510, h:310 },
    { id:"execution", label:"EXECUTION / EVIDENCE", subtitle:"bounded effects, evidence and domain-owned truth", x:55, y:655, w:1510, h:220 }
  ];

  const nodeSeed = [
    { id:"oriol", name:"Oriol", role:"PRODUCT OWNER", plane:"authority", className:"authority", x:115, y:120, w:185, h:82, status:"CANONICAL", boundary:"Owns product intent, material scope and genuine product trade-offs." },
    { id:"general-master", name:"General Master", role:"MASTER", plane:"authority", className:"authority", x:350, y:120, w:185, h:82, status:"CANONICAL", boundary:"Owns architecture, technical path, sequencing and the next clear technical action." },

    { id:"ingress", name:"Ingress", role:"ENTRY / HANDOFF", plane:"routing", className:"routing", x:675, y:120, w:185, h:82, status:"MODEL", boundary:"Receives work without silently granting authority to the delivery channel." },
    { id:"routing-binding", name:"Routing / Binding", role:"ROUTING", plane:"routing", className:"routing", x:955, y:120, w:205, h:82, status:"MODEL", boundary:"Binds work to the smallest competent actor or capability while preserving authority boundaries." },

    { id:"architect", name:"Architect", role:"TECHNICAL ACTOR", plane:"orchestration", className:"orchestration", x:105, y:390, w:185, h:82, status:"CURRENT", boundary:"Handles bounded architecture and implementation work where an engineering actor is required." },
    { id:"repoops-master", name:"RepoOps Master", role:"DOMAIN MASTER", plane:"orchestration", className:"orchestration", x:325, y:390, w:195, h:82, status:"CURRENT", boundary:"Owns repository-domain orchestration and bounded repository work." },
    { id:"atlas", name:"Atlas", role:"INSPECTION SURFACE", plane:"orchestration", className:"orchestration", x:555, y:390, w:185, h:82, status:"CURRENT", boundary:"Makes architecture and boundaries inspectable; it is not an execution authority." },
    { id:"radar", name:"Radar", role:"RESEARCH / SIGNAL", plane:"orchestration", className:"orchestration", x:775, y:390, w:185, h:82, status:"CURRENT", boundary:"Surfaces relevant signals and research without owning product or effect authority." },

    { id:"operational-master", name:"Operational Master", role:"POSSIBLE MASTER", plane:"orchestration", className:"candidate", x:1015, y:365, w:200, h:88, status:"CANDIDATE", boundary:"Candidate operational orchestration role. Drawing it here does not admit it into canonical architecture." },
    { id:"satan", name:"Satan", role:"POSSIBLE ACTOR", plane:"orchestration", className:"candidate", x:1260, y:365, w:185, h:88, status:"CANDIDATE", boundary:"Candidate operational actor. Its exact product role remains unadmitted." },
    { id:"workers", name:"Workers", role:"REPLACEABLE EXECUTORS", plane:"orchestration", className:"candidate", x:1260, y:495, w:185, h:88, status:"CANDIDATE", boundary:"Candidate replaceable workers for bounded mechanical tasks; never authority owners." },

    { id:"execution-surface", name:"Execution Surface", role:"BOUNDED EXECUTION", plane:"execution", className:"execution", x:145, y:725, w:205, h:82, status:"BOUNDARY", boundary:"Performs allowed effects inside explicit scope. Successful execution does not itself establish domain truth." },
    { id:"evidence", name:"Evidence", role:"PROVENANCE / VERIFICATION", plane:"execution", className:"evidence", x:500, y:725, w:190, h:82, status:"BOUNDARY", boundary:"Carries execution results, verification and provenance. Evidence supports truth determination but does not own it." },
    { id:"domain-truth", name:"Domain Effect Truth", role:"DOMAIN AUTHORITY", plane:"execution", className:"truth", x:850, y:725, w:215, h:82, status:"AUTHORITY BOUNDARY", boundary:"The affected semantic domain determines whether the intended effect is true." },
    { id:"checkpoint", name:"Material Checkpoint", role:"RESULT / ESCALATION", plane:"execution", className:"checkpoint", x:1225, y:725, w:205, h:82, status:"BOUNDARY", boundary:"Surfaces material outcomes, blockers or product choices without turning routine technical progress into owner micromanagement." }
  ];

  const edgeSeed = [
    { id:"e-owner-master", from:"oriol", to:"general-master", label:"product intent / decisions", kind:"authority", bend:0 },
    { id:"e-ingress-routing", from:"ingress", to:"routing-binding", label:"incoming work", kind:"routing", bend:0 },
    { id:"e-master-routing", from:"general-master", to:"routing-binding", label:"technical direction", kind:"routing", bend:-34 },

    { id:"e-routing-architect", from:"routing-binding", to:"architect", label:"technical work", kind:"orchestration", bend:30 },
    { id:"e-routing-repoops", from:"routing-binding", to:"repoops-master", label:"repository work", kind:"orchestration", bend:20 },
    { id:"e-routing-atlas", from:"routing-binding", to:"atlas", label:"inspection / model", kind:"orchestration", bend:8 },
    { id:"e-routing-radar", from:"routing-binding", to:"radar", label:"research / signal", kind:"orchestration", bend:-5 },
    { id:"e-routing-operational", from:"routing-binding", to:"operational-master", label:"possible operational binding", kind:"candidate", bend:-18 },

    { id:"e-operational-satan", from:"operational-master", to:"satan", label:"candidate delegation", kind:"candidate", bend:0 },
    { id:"e-satan-workers", from:"satan", to:"workers", label:"candidate worker use", kind:"candidate", bend:18 },

    { id:"e-architect-execution", from:"architect", to:"execution-surface", label:"bounded execution", kind:"execution", bend:10 },
    { id:"e-repoops-execution", from:"repoops-master", to:"execution-surface", label:"bounded repo effect", kind:"execution", bend:28 },
    { id:"e-workers-execution", from:"workers", to:"execution-surface", label:"candidate execution", kind:"candidate", bend:-75 },

    { id:"e-execution-evidence", from:"execution-surface", to:"evidence", label:"reports what happened", kind:"evidence", bend:0 },
    { id:"e-evidence-truth", from:"evidence", to:"domain-truth", label:"supports determination", kind:"evidence", bend:0 },
    { id:"e-truth-checkpoint", from:"domain-truth", to:"checkpoint", label:"effect status", kind:"evidence", bend:0 },
    { id:"e-checkpoint-master", from:"checkpoint", to:"general-master", label:"material result", kind:"authority", bend:-170 },
    { id:"e-radar-master", from:"radar", to:"general-master", label:"signal / research", kind:"orchestration", bend:80 }
  ];

  const nodes = Object.fromEntries(nodeSeed.map(n => [n.id, {...n}]));
  const edges = edgeSeed.map(e => ({...e}));
  const initialNodes = Object.fromEntries(nodeSeed.map(n => [n.id, {x:n.x, y:n.y}]));

  let mode = "view";
  let activePlane = "all";
  let selectedId = null;
  let dirty = false;
  let drag = null;
  let pan = null;
  let handleDrag = null;
  let view = {x:0, y:0, w:1620, h:930};
  let edgeControls = {};

  function el(tag, attrs = {}) {
    const node = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
    return node;
  }

  function setText(node, text) {
    node.textContent = text;
    return node;
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function nodeVisible(n) {
    return activePlane === "all" || n.plane === activePlane;
  }

  function edgeVisible(edge) {
    return nodeVisible(nodes[edge.from]) && nodeVisible(nodes[edge.to]);
  }

  function connectedIds(id) {
    const out = new Set([id]);
    for (const edge of edges) {
      if (!edgeVisible(edge)) continue;
      if (edge.from === id) out.add(edge.to);
      if (edge.to === id) out.add(edge.from);
    }
    return out;
  }

  function pointerToSvg(clientX, clientY) {
    const r = svg.getBoundingClientRect();
    return {
      x: view.x + ((clientX - r.left) / Math.max(1, r.width)) * view.w,
      y: view.y + ((clientY - r.top) / Math.max(1, r.height)) * view.h
    };
  }

  function applyView() {
    svg.setAttribute("viewBox", `${view.x} ${view.y} ${view.w} ${view.h}`);
  }

  function rectBoundary(n, towardX, towardY) {
    const cx = n.x + n.w / 2;
    const cy = n.y + n.h / 2;
    const dx = towardX - cx;
    const dy = towardY - cy;
    const halfW = n.w / 2;
    const halfH = n.h / 2;
    const scale = 1 / Math.max(Math.abs(dx) / Math.max(halfW, 1), Math.abs(dy) / Math.max(halfH, 1), 0.0001);
    return {x:cx + dx * scale, y:cy + dy * scale};
  }

  function edgeGeometry(edge) {
    const a = nodes[edge.from];
    const b = nodes[edge.to];
    const ac = {x:a.x + a.w/2, y:a.y + a.h/2};
    const bc = {x:b.x + b.w/2, y:b.y + b.h/2};
    const s = rectBoundary(a, bc.x, bc.y);
    const t = rectBoundary(b, ac.x, ac.y);
    const dx = t.x - s.x;
    const dy = t.y - s.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const bend = edge.bend || 0;
    const base1 = {x:s.x + dx/3 + nx*bend, y:s.y + dy/3 + ny*bend};
    const base2 = {x:s.x + dx*2/3 + nx*bend, y:s.y + dy*2/3 + ny*bend};
    const ctl = edgeControls[edge.id] || {};
    const c1 = {x:base1.x + (ctl.c1dx || 0), y:base1.y + (ctl.c1dy || 0)};
    const c2 = {x:base2.x + (ctl.c2dx || 0), y:base2.y + (ctl.c2dy || 0)};
    return {s,t,c1,c2,base1,base2};
  }

  function cubicPoint(g, t = 0.5) {
    const u = 1 - t;
    return {
      x:u*u*u*g.s.x + 3*u*u*t*g.c1.x + 3*u*t*t*g.c2.x + t*t*t*g.t.x,
      y:u*u*u*g.s.y + 3*u*u*t*g.c1.y + 3*u*t*t*g.c2.y + t*t*t*g.t.y
    };
  }

  function renderPlanes() {
    planeLayer.innerHTML = "";
    for (const p of planes) {
      if (activePlane !== "all" && activePlane !== p.id) continue;
      const g = el("g", {"data-plane":p.id});
      g.appendChild(el("rect", {class:`plane plane-${p.id}`, x:p.x, y:p.y, width:p.w, height:p.h, rx:18}));
      g.appendChild(setText(el("text", {class:`plane-title ${p.id}`, x:p.x+18, y:p.y+24}), p.label));
      g.appendChild(setText(el("text", {class:"plane-subtitle", x:p.x+18, y:p.y+42}), p.subtitle));
      planeLayer.appendChild(g);
    }
  }

  function renderEdges() {
    edgeLayer.innerHTML = "";
    edgeLabelLayer.innerHTML = "";
    handleLayer.innerHTML = "";

    for (const edge of edges) {
      if (!edgeVisible(edge)) continue;
      const g = edgeGeometry(edge);
      const isFocused = selectedId && (edge.from === selectedId || edge.to === selectedId);
      const isDimmed = selectedId && !isFocused;

      const path = el("path", {
        class:`edge ${edge.kind}${isFocused ? " focused" : ""}${isDimmed ? " dimmed" : ""}`,
        d:`M${g.s.x} ${g.s.y} C${g.c1.x} ${g.c1.y} ${g.c2.x} ${g.c2.y} ${g.t.x} ${g.t.y}`,
        "data-edge-id":edge.id
      });
      edgeLayer.appendChild(path);

      if (edge.label) {
        const m = cubicPoint(g, 0.5);
        const width = Math.max(78, edge.label.length * 5.8 + 18);
        const lg = el("g", {class:`edge-label-group${isFocused ? " focused" : ""}${isDimmed ? " dimmed" : ""}`});
        lg.appendChild(el("rect", {class:"edge-label-bg", x:m.x-width/2, y:m.y-10, width, height:20, rx:10}));
        lg.appendChild(setText(el("text", {class:"edge-label", x:m.x, y:m.y+3.5}), edge.label));
        edgeLabelLayer.appendChild(lg);
      }

      if (mode === "design") {
        handleLayer.appendChild(el("path", {class:"handle-guide", d:`M${g.s.x} ${g.s.y} L${g.c1.x} ${g.c1.y} M${g.t.x} ${g.t.y} L${g.c2.x} ${g.c2.y}`}));
        for (const [which, pt] of [["c1", g.c1], ["c2", g.c2]]) {
          handleLayer.appendChild(el("circle", {class:"edge-handle", cx:pt.x, cy:pt.y, r:5.8, "data-edge-id":edge.id, "data-which":which}));
        }
      }
    }
  }

  function nodeSubtitle(n) {
    if (n.status === "CANDIDATE") return "not canonical";
    if (n.id === "domain-truth") return "affected domain owns truth";
    if (n.id === "evidence") return "supports, does not own truth";
    if (n.id === "execution-surface") return "effect ≠ truth";
    return n.status.toLowerCase();
  }

  function renderNodes() {
    nodeLayer.innerHTML = "";
    const connected = selectedId ? connectedIds(selectedId) : null;

    for (const n of Object.values(nodes)) {
      if (!nodeVisible(n)) continue;
      const selected = selectedId === n.id;
      const focused = connected?.has(n.id);
      const dimmed = selectedId && !focused;
      const g = el("g", {
        class:`node ${n.className}${selected ? " selected" : ""}${focused ? " focused" : ""}${dimmed ? " dimmed" : ""}`,
        transform:`translate(${n.x} ${n.y})`,
        "data-node-id":n.id,
        tabindex:"0",
        role:"button",
        "aria-label":n.name
      });
      g.appendChild(el("rect", {class:"box", width:n.w, height:n.h, rx:14}));
      g.appendChild(setText(el("text", {class:"node-kicker", x:n.w/2, y:23}), n.role));
      g.appendChild(setText(el("text", {class:"node-title", x:n.w/2, y:48}), n.name));
      g.appendChild(setText(el("text", {class:"node-note", x:n.w/2, y:67}), nodeSubtitle(n)));

      if (n.status === "CANDIDATE") {
        const badgeW = 70;
        g.appendChild(el("rect", {class:"candidate-badge", x:n.w-badgeW-8, y:7, width:badgeW, height:16, rx:8}));
        g.appendChild(setText(el("text", {class:"candidate-text", x:n.w-badgeW/2-8, y:18}), "CANDIDATE"));
      }
      nodeLayer.appendChild(g);
    }
  }

  function render() {
    if (selectedId && !nodeVisible(nodes[selectedId])) selectedId = null;
    renderPlanes();
    renderEdges();
    renderNodes();
    renderCard();
  }

  function renderCard() {
    if (!selectedId || !nodes[selectedId] || !nodeVisible(nodes[selectedId])) {
      card.classList.remove("open");
      card.innerHTML = "";
      return;
    }
    const n = nodes[selectedId];
    const plane = planes.find(p => p.id === n.plane);
    const candidateClass = n.status === "CANDIDATE" ? " candidate" : "";
    card.innerHTML = `
      <div class="routing-card-head">
        <div><div class="routing-card-kind">${escapeHtml(n.role)}</div><h2>${escapeHtml(n.name)}</h2></div>
        <button class="routing-card-close" type="button" aria-label="Close">×</button>
      </div>
      <div class="routing-card-status${candidateClass}">${escapeHtml(n.status === "CANDIDATE" ? "CANDIDATE — NOT CANONICAL" : n.status)}</div>
      <p class="routing-card-summary">${escapeHtml(n.boundary)}</p>
      <div class="routing-card-grid">
        <div class="routing-card-cap"><b>PLANE</b><span>${escapeHtml(plane?.label || n.plane)}</span></div>
        <div class="routing-card-cap"><b>ROLE</b><span>${escapeHtml(n.role)}</span></div>
      </div>`;
    card.querySelector(".routing-card-close")?.addEventListener("click", () => clearSelection());
    card.classList.add("open");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"}[c]));
  }

  function selectNode(id) {
    selectedId = selectedId === id ? null : id;
    render();
    setStatus(selectedId ? `${nodes[selectedId].name} selected · connected relationships emphasized · Esc clears` : baseStatus());
  }

  function clearSelection() {
    selectedId = null;
    render();
    setStatus(baseStatus());
  }

  function baseStatus() {
    if (mode === "design") return dirty ? "Design · layout or edge curves modified · Save layout to persist" : "Design · drag nodes or edge control points · Save layout to persist";
    return "View · select a node · drag background to pan · wheel or +/− to zoom";
  }

  function setMode(next) {
    mode = next;
    document.body.dataset.routingMode = next;
    viewButton.classList.toggle("active", next === "view");
    designButton.classList.toggle("active", next === "design");
    drag = null;
    handleDrag = null;
    renderEdges();
    renderNodes();
    setStatus(baseStatus());
  }

  function markDirty() {
    dirty = true;
    saveButton.classList.remove("saved");
    saveButton.textContent = "Save layout";
    setStatus(baseStatus());
  }

  function snapshot() {
    return {version:1,nodes:Object.fromEntries(Object.values(nodes).map(n => [n.id, {x:n.x, y:n.y}])),edgeControls,view:{...view}};
  }

  function saveLayout() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot()));
      dirty = false;
      saveButton.classList.add("saved");
      saveButton.textContent = "Saved";
      setStatus("Layout saved locally");
    } catch (_) { setStatus("Could not save layout locally"); }
  }

  function restoreLayout() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const state = JSON.parse(raw);
      if (!state || state.version !== 1) return false;
      for (const [id, pos] of Object.entries(state.nodes || {})) {
        if (nodes[id] && Number.isFinite(pos.x) && Number.isFinite(pos.y)) { nodes[id].x = pos.x; nodes[id].y = pos.y; }
      }
      edgeControls = state.edgeControls || {};
      if (state.view && ["x","y","w","h"].every(k => Number.isFinite(state.view[k]))) view = {...state.view};
      dirty = false;
      saveButton.classList.add("saved");
      saveButton.textContent = "Saved";
      return true;
    } catch (_) { return false; }
  }

  function resetLayout() {
    for (const [id, pos] of Object.entries(initialNodes)) { nodes[id].x = pos.x; nodes[id].y = pos.y; }
    edgeControls = {};
    selectedId = null;
    activePlane = "all";
    document.querySelectorAll(".routing-filters button").forEach(b => b.classList.toggle("active", b.dataset.plane === "all"));
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    dirty = false;
    saveButton.classList.remove("saved");
    saveButton.textContent = "Save layout";
    render();
    fitVisible();
    setStatus("Default layout restored");
  }

  function fitVisible() {
    const visible = Object.values(nodes).filter(nodeVisible);
    if (!visible.length) return;
    const minX = Math.min(...visible.map(n => n.x));
    const minY = Math.min(...visible.map(n => n.y));
    const maxX = Math.max(...visible.map(n => n.x + n.w));
    const maxY = Math.max(...visible.map(n => n.y + n.h));
    const margin = 95;
    let x = minX - margin, y = minY - margin, w = maxX - minX + margin*2, h = maxY - minY + margin*2;
    const r = svg.getBoundingClientRect();
    const aspect = Math.max(0.2, r.width / Math.max(1, r.height));
    const boxAspect = w / h;
    if (boxAspect > aspect) { const nh = w/aspect; y -= (nh-h)/2; h = nh; }
    else { const nw = h*aspect; x -= (nw-w)/2; w = nw; }
    view = {x,y,w,h};
    applyView();
  }

  function zoomAt(factor, clientX = null, clientY = null) {
    const r = svg.getBoundingClientRect();
    const px = clientX ?? (r.left + r.width/2);
    const py = clientY ?? (r.top + r.height/2);
    const p = pointerToSvg(px, py);
    const newW = Math.max(420, Math.min(4200, view.w*factor));
    const newH = Math.max(260, Math.min(2600, view.h*factor));
    const rx = (p.x-view.x)/view.w;
    const ry = (p.y-view.y)/view.h;
    view = {x:p.x-newW*rx,y:p.y-newH*ry,w:newW,h:newH};
    applyView();
  }

  function edgeById(id) { return edges.find(e => e.id === id); }

  svg.addEventListener("pointerdown", event => {
    const handle = event.target.closest?.(".edge-handle");
    if (handle && mode === "design") {
      event.preventDefault(); event.stopPropagation();
      const edge = edgeById(handle.dataset.edgeId); if (!edge) return;
      const geom = edgeGeometry(edge);
      handleDrag = {edgeId:edge.id,which:handle.dataset.which,pointerId:event.pointerId,base:handle.dataset.which === "c1" ? geom.base1 : geom.base2};
      svg.setPointerCapture(event.pointerId); return;
    }
    const group = event.target.closest?.(".node");
    if (group) {
      const id = group.dataset.nodeId;
      if (mode === "design") {
        const p = pointerToSvg(event.clientX,event.clientY);
        drag = {id,pointerId:event.pointerId,dx:p.x-nodes[id].x,dy:p.y-nodes[id].y,startX:event.clientX,startY:event.clientY,moved:false};
        svg.setPointerCapture(event.pointerId);
      }
      return;
    }
    if (event.target === svg || event.target.closest?.("#planes") || event.target.closest?.("#edges") || event.target.closest?.("#edge-labels")) {
      const p = pointerToSvg(event.clientX,event.clientY);
      pan = {pointerId:event.pointerId,x:p.x,y:p.y,vx:view.x,vy:view.y};
      svg.setPointerCapture(event.pointerId);
    }
  });

  svg.addEventListener("pointermove", event => {
    if (handleDrag && event.pointerId === handleDrag.pointerId) {
      const p = pointerToSvg(event.clientX,event.clientY);
      const ctl = edgeControls[handleDrag.edgeId] || (edgeControls[handleDrag.edgeId] = {});
      if (handleDrag.which === "c1") { ctl.c1dx = p.x-handleDrag.base.x; ctl.c1dy = p.y-handleDrag.base.y; }
      else { ctl.c2dx = p.x-handleDrag.base.x; ctl.c2dy = p.y-handleDrag.base.y; }
      markDirty(); renderEdges(); return;
    }
    if (drag && event.pointerId === drag.pointerId) {
      const p = pointerToSvg(event.clientX,event.clientY); const n = nodes[drag.id];
      n.x = p.x-drag.dx; n.y = p.y-drag.dy;
      if (Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY) > 3) drag.moved = true;
      markDirty(); renderEdges(); renderNodes(); return;
    }
    if (pan && event.pointerId === pan.pointerId) {
      const p = pointerToSvg(event.clientX,event.clientY);
      view.x = pan.vx-(p.x-pan.x); view.y = pan.vy-(p.y-pan.y); applyView();
    }
  });

  svg.addEventListener("pointerup", event => {
    if (handleDrag && event.pointerId === handleDrag.pointerId) { handleDrag = null; try { svg.releasePointerCapture(event.pointerId); } catch (_) {} renderEdges(); return; }
    if (drag && event.pointerId === drag.pointerId) { const finished = drag; drag = null; try { svg.releasePointerCapture(event.pointerId); } catch (_) {} if (!finished.moved) selectNode(finished.id); return; }
    if (pan && event.pointerId === pan.pointerId) { pan = null; try { svg.releasePointerCapture(event.pointerId); } catch (_) {} }
  });

  svg.addEventListener("pointercancel", () => { drag = null; pan = null; handleDrag = null; });

  svg.addEventListener("click", event => {
    const group = event.target.closest?.(".node");
    if (group && mode === "view") { event.stopPropagation(); selectNode(group.dataset.nodeId); return; }
    if (!group && !event.target.closest?.(".edge-handle")) { if (selectedId) clearSelection(); }
  });

  svg.addEventListener("keydown", event => {
    if ((event.key === "Enter" || event.key === " ") && event.target.closest?.(".node")) { event.preventDefault(); selectNode(event.target.closest(".node").dataset.nodeId); }
  });

  svg.addEventListener("wheel", event => { event.preventDefault(); zoomAt(event.deltaY > 0 ? 1.1 : 0.9,event.clientX,event.clientY); }, {passive:false});

  document.getElementById("zoom-in")?.addEventListener("click", () => zoomAt(0.88));
  document.getElementById("zoom-out")?.addEventListener("click", () => zoomAt(1.14));
  document.getElementById("fit")?.addEventListener("click", fitVisible);
  saveButton?.addEventListener("click", saveLayout);
  document.getElementById("reset-layout")?.addEventListener("click", resetLayout);
  viewButton?.addEventListener("click", () => setMode("view"));
  designButton?.addEventListener("click", () => setMode("design"));

  document.querySelectorAll(".routing-filters button").forEach(button => {
    button.addEventListener("click", () => {
      activePlane = button.dataset.plane || "all";
      document.querySelectorAll(".routing-filters button").forEach(b => b.classList.toggle("active", b === button));
      selectedId = null; render(); fitVisible(); setStatus(`${button.textContent.trim()} layer · ${mode === "design" ? "Design" : "View"} mode`);
    });
  });

  document.addEventListener("keydown", event => { if (event.key === "Escape" && selectedId) clearSelection(); });

  const restored = restoreLayout();
  applyView();
  render();
  setMode("view");
  if (!restored) requestAnimationFrame(fitVisible);
})();
