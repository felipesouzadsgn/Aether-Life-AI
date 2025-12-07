
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Note, Task, Transaction } from '../types';

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'note' | 'task' | 'finance';
  label: string;
  group: string;
  radius: number;
}

interface Link {
  source: string;
  target: string;
  strength: number;
}

interface NeuralGraphProps {
  notes: Note[];
  tasks: Task[];
  transactions: Transaction[];
  onNodeClick?: (node: GraphNode) => void;
}

const NeuralGraph: React.FC<NeuralGraphProps> = ({ notes, tasks, transactions, onNodeClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isLinking, setIsLinking] = useState(false);

  // Mutable refs for physics loop to avoid re-renders causing jitter
  const nodesRef = useRef<GraphNode[]>([]);
  const linksRef = useRef<Link[]>([]);
  const userLinksRef = useRef<Link[]>([]); // Store manually created links
  
  // Interaction Refs
  const draggedNodeRef = useRef<GraphNode | null>(null);
  const clickStartPosRef = useRef<{x: number, y: number} | null>(null);
  const panStartRef = useRef<{x: number, y: number} | null>(null);
  
  // Linking Refs
  const linkSourceNodeRef = useRef<GraphNode | null>(null);
  const tempLinkEndRef = useRef<{x: number, y: number} | null>(null);
  
  // View Transform (Camera)
  const transformRef = useRef({ x: 0, y: 0, k: 1 }); // k = scale

  // Initialization Logic
  useEffect(() => {
    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;
    
    // Center logic needs to account for initial transform
    const cx = width / 2;
    const cy = height / 2;

    const n: GraphNode[] = [];
    const l: Link[] = [];

    const addNode = (id: string, label: string, type: GraphNode['type'], group: string) => {
      // Check if node already exists to preserve position if data updates
      const existing = nodesRef.current.find(node => node.id === id);
      
      n.push({
        id,
        // Preserve pos if exists, else Big Bang
        x: existing ? existing.x : cx + (Math.random() - 0.5) * 50,
        y: existing ? existing.y : cy + (Math.random() - 0.5) * 50,
        vx: existing ? existing.vx : (Math.random() - 0.5) * 2,
        vy: existing ? existing.vy : (Math.random() - 0.5) * 2,
        type,
        label,
        group: group.toLowerCase(),
        radius: type === 'note' ? 8 : type === 'task' ? 6 : 5
      });
    };

    notes.forEach(note => addNode(`n-${note.id}`, note.content, 'note', note.category));
    tasks.forEach(task => addNode(`t-${task.id}`, task.title, 'task', task.category));
    transactions.forEach(tx => addNode(`f-${tx.id}`, tx.title, 'finance', tx.category));

    // Create automatic connections
    for (let i = 0; i < n.length; i++) {
      for (let j = i + 1; j < n.length; j++) {
        const a = n[i];
        const b = n[j];
        if (a.group === b.group || a.group.includes(b.group) || b.group.includes(a.group)) {
          l.push({ source: a.id, target: b.id, strength: 0.05 });
        }
        if (a.type === 'note' && b.type === 'task' && a.label.includes(b.label.split(' ')[0])) {
             l.push({ source: a.id, target: b.id, strength: 0.1 });
        }
      }
    }

    // Append user manually created links
    l.push(...userLinksRef.current);

    nodesRef.current = n;
    linksRef.current = l;
  }, [notes, tasks, transactions]);

  // Helper: Convert Screen Coordinates to World Coordinates
  const toWorldPos = (screenX: number, screenY: number) => {
    const { x, y, k } = transformRef.current;
    return {
        x: (screenX - x) / k,
        y: (screenY - y) / k
    };
  };

  // Physics & Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let globalAlpha = 0; // Fade in effect

    const resize = () => {
        if(containerRef.current) {
            canvas.width = containerRef.current.clientWidth;
            canvas.height = containerRef.current.clientHeight;
        }
    }
    window.addEventListener('resize', resize);
    resize();

    // Physics constants
    const repulsion = 150;
    const damping = 0.92;
    const centerForce = 0.008;

    const animate = () => {
        // Fade in
        if (globalAlpha < 1) globalAlpha += 0.02;

        // Clear entire canvas (Screen Space)
        ctx.resetTransform();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const { x, y, k } = transformRef.current;

        // Apply Camera Transform
        ctx.setTransform(k, 0, 0, k, x, y);
        ctx.globalAlpha = globalAlpha;

        const nodes = nodesRef.current;
        const links = linksRef.current;

        // 1. Calculate Forces (Physics runs in World Space)
        // Repulsion
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const a = nodes[i];
                const b = nodes[j];
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const distSq = dx * dx + dy * dy || 1;
                const dist = Math.sqrt(distSq);
                
                const f = repulsion / distSq;
                const fx = (dx / dist) * f;
                const fy = (dy / dist) * f;

                if (a !== draggedNodeRef.current) { a.vx -= fx; a.vy -= fy; }
                if (b !== draggedNodeRef.current) { b.vx += fx; b.vy += fy; }
            }
        }

        // Springs
        links.forEach(link => {
            const s = nodes.find(n => n.id === link.source);
            const t = nodes.find(n => n.id === link.target);
            if (!s || !t) return;

            const dx = t.x - s.x;
            const dy = t.y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            const force = (dist - 120) * 0.04; // k spring constant
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (s !== draggedNodeRef.current) { s.vx += fx; s.vy += fy; }
            if (t !== draggedNodeRef.current) { t.vx -= fx; t.vy -= fy; }
        });

        // Center Gravity & Update
        const cx = canvas.width / 2; // World Center (roughly)
        const cy = canvas.height / 2;

        nodes.forEach(node => {
            if (node === draggedNodeRef.current) return; // Don't move dragged node via physics

            node.vx += (cx - node.x) * centerForce;
            node.vy += (cy - node.y) * centerForce;

            node.x += node.vx;
            node.y += node.vy;

            node.vx *= damping;
            node.vy *= damping;
        });

        // 2. Render Links
        ctx.lineWidth = 1 / k; // Keep lines consistent width visually
        links.forEach(link => {
            const s = nodes.find(n => n.id === link.source);
            const t = nodes.find(n => n.id === link.target);
            if (!s || !t) return;
            
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(t.x, t.y);
            const gradient = ctx.createLinearGradient(s.x, s.y, t.x, t.y);
            gradient.addColorStop(0, 'rgba(255,255,255,0.05)');
            gradient.addColorStop(0.5, 'rgba(255,255,255,0.1)');
            gradient.addColorStop(1, 'rgba(255,255,255,0.05)');
            ctx.strokeStyle = gradient;
            ctx.stroke();
        });

        // 3. Render Temporary Link (Dragging to Link)
        if (linkSourceNodeRef.current && tempLinkEndRef.current) {
            ctx.beginPath();
            ctx.moveTo(linkSourceNodeRef.current.x, linkSourceNodeRef.current.y);
            ctx.lineTo(tempLinkEndRef.current.x, tempLinkEndRef.current.y);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1.5 / k;
            ctx.setLineDash([5 / k, 5 / k]); // Scalable dash
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Draw little circle at mouse end
            ctx.beginPath();
            ctx.arc(tempLinkEndRef.current.x, tempLinkEndRef.current.y, 3 / k, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.fill();
        }

        // 4. Render Nodes
        nodes.forEach(node => {
            const isDragged = node === draggedNodeRef.current;
            const isLinkSource = node === linkSourceNodeRef.current;
            
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            
            if (node.type === 'note') {
                ctx.fillStyle = '#a855f7';
                ctx.shadowColor = '#a855f7';
            } else if (node.type === 'task') {
                ctx.fillStyle = '#3b82f6';
                ctx.shadowColor = '#3b82f6';
            } else {
                ctx.fillStyle = '#10b981';
                ctx.shadowColor = '#10b981';
            }
            
            // Enhanced drag/link visuals
            ctx.shadowBlur = (isDragged || isLinkSource) ? 40 : 10;
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Highlight ring
            if (isDragged || isLinkSource) {
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2 / k;
                ctx.stroke();
                
                // Outer ripple ring
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius * 2, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                ctx.lineWidth = 1 / k;
                ctx.stroke();
            }
        });

        animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Event Handlers for Drag & Click & Zoom
  const getMousePos = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const { x: screenX, y: screenY } = getMousePos(e);
    const { x: worldX, y: worldY } = toWorldPos(screenX, screenY);
    
    clickStartPosRef.current = { x: screenX, y: screenY };

    // Find clicked node (Hit test in World Coordinates)
    const clickedNode = nodesRef.current.find(n => {
        const dist = Math.sqrt((n.x - worldX) ** 2 + (n.y - worldY) ** 2);
        // Adjust hit radius based on visual scale slightly to make it easier to click
        return dist < (Math.max(20, 20 / transformRef.current.k)); 
    });

    if (clickedNode) {
        if (e.shiftKey) {
            // Start Linking
            linkSourceNodeRef.current = clickedNode;
            tempLinkEndRef.current = { x: worldX, y: worldY };
            setIsLinking(true);
        } else {
            // Start Dragging
            draggedNodeRef.current = clickedNode;
            setIsDraggingNode(true);
        }
    } else {
        // Start Panning
        setIsPanning(true);
        panStartRef.current = { x: screenX, y: screenY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { x: screenX, y: screenY } = getMousePos(e);
    const { x: worldX, y: worldY } = toWorldPos(screenX, screenY);

    if (linkSourceNodeRef.current) {
        // Update temp link line
        tempLinkEndRef.current = { x: worldX, y: worldY };
    } else if (draggedNodeRef.current) {
        // Drag Node (in World Coords)
        draggedNodeRef.current.x = worldX;
        draggedNodeRef.current.y = worldY;
        draggedNodeRef.current.vx = 0;
        draggedNodeRef.current.vy = 0;
    } else if (isPanning && panStartRef.current) {
        // Pan Camera (in Screen Coords)
        const dx = screenX - panStartRef.current.x;
        const dy = screenY - panStartRef.current.y;
        
        transformRef.current.x += dx;
        transformRef.current.y += dy;
        
        panStartRef.current = { x: screenX, y: screenY };
    } else {
        // Hover Check (in World Coords)
        const found = nodesRef.current.find(n => {
            const dist = Math.sqrt((n.x - worldX) ** 2 + (n.y - worldY) ** 2);
            return dist < (Math.max(20, 20 / transformRef.current.k));
        });
        setHoveredNode(found ? found.id : null);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const { x, y } = getMousePos(e);
    const { x: worldX, y: worldY } = toWorldPos(x, y);
    const startPos = clickStartPosRef.current;

    // Handle Link Completion
    if (linkSourceNodeRef.current) {
        // Find target node (Hit test in World Coordinates)
        const targetNode = nodesRef.current.find(n => {
            const dist = Math.sqrt((n.x - worldX) ** 2 + (n.y - worldY) ** 2);
            return dist < (Math.max(20, 20 / transformRef.current.k)); 
        });

        if (targetNode && targetNode.id !== linkSourceNodeRef.current.id) {
            const newLink = { source: linkSourceNodeRef.current.id, target: targetNode.id, strength: 0.1 };
            // Add to current visual state
            linksRef.current.push(newLink);
            // Add to persistent user links
            userLinksRef.current.push(newLink);
        }

        linkSourceNodeRef.current = null;
        tempLinkEndRef.current = null;
        setIsLinking(false);
    }
    
    // Check if it was a click (not a drag)
    else if (startPos && draggedNodeRef.current) {
        const distMoved = Math.sqrt((x - startPos.x) ** 2 + (y - startPos.y) ** 2);
        
        // If moved less than 5px, consider it a click
        if (distMoved < 5 && onNodeClick) {
            onNodeClick(draggedNodeRef.current);
        }
    }

    draggedNodeRef.current = null;
    clickStartPosRef.current = null;
    panStartRef.current = null;
    setIsDraggingNode(false);
    setIsPanning(false);
  };

  const handleMouseLeave = () => {
    draggedNodeRef.current = null;
    linkSourceNodeRef.current = null;
    tempLinkEndRef.current = null;
    setIsDraggingNode(false);
    setIsPanning(false);
    setIsLinking(false);
    setHoveredNode(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomIntensity = 0.1;
    const direction = e.deltaY > 0 ? -1 : 1; // Down = Zoom Out, Up = Zoom In
    const factor = 1 + (direction * zoomIntensity);

    const { x, y } = getMousePos(e); // Screen Coords of mouse
    const { x: tx, y: ty, k } = transformRef.current;

    // Calculate new scale with limits
    let newK = k * factor;
    newK = Math.max(0.1, Math.min(newK, 5)); // Limit zoom between 0.1x and 5x

    // Adjust Pan (tx, ty) so we zoom towards the mouse pointer
    const newTx = x - (x - tx) * (newK / k);
    const newTy = y - (y - ty) * (newK / k);

    transformRef.current = { x: newTx, y: newTy, k: newK };
  };

  return (
    <div 
        ref={containerRef} 
        className={`
            w-full h-full relative overflow-hidden bg-black/20 rounded-[32px] border border-white/5 
            ${isDraggingNode ? 'cursor-grabbing' : isPanning ? 'cursor-move' : isLinking ? 'cursor-crosshair' : 'cursor-default'}
        `}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
    >
        <canvas ref={canvasRef} className="block w-full h-full" />
        
        {/* Hover Tooltip (Only show if not dragging) */}
        {hoveredNode && !isDraggingNode && !isPanning && !isLinking && (() => {
            const node = nodesRef.current.find(n => n.id === hoveredNode);
            if (!node) return null;
            
            // Calculate screen position for tooltip
            const { x, y, k } = transformRef.current;
            const screenX = node.x * k + x;
            const screenY = node.y * k + y;

            return (
                <div 
                    style={{ left: screenX, top: screenY }} 
                    className="absolute z-10 pointer-events-none transform -translate-x-1/2 -translate-y-[150%]"
                >
                    <div className="bg-zinc-900/90 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl shadow-xl">
                        <p className="text-[10px] uppercase text-zinc-500 tracking-wider mb-1">{node.type}</p>
                        <p className="text-xs text-white whitespace-nowrap max-w-[200px] truncate">{node.label}</p>
                    </div>
                </div>
            );
        })()}

        {/* Zoom Controls Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-1 pointer-events-none opacity-50">
             <div className="bg-black/50 p-2 rounded text-xs text-zinc-500">
                Scroll to Zoom • Drag to Pan • Shift+Drag to Link
             </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 pointer-events-none">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                <span className="text-[10px] text-zinc-500 uppercase">Thought</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                <span className="text-[10px] text-zinc-500 uppercase">Task</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                <span className="text-[10px] text-zinc-500 uppercase">Asset</span>
            </div>
        </div>
    </div>
  );
};

export default NeuralGraph;
