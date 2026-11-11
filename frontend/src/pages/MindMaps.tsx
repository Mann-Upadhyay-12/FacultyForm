import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Plus, ZoomIn, ZoomOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MindNode {
  id: string;
  text: string;
  x: number;
  y: number;
  parentId: string | null;
}

const initialNodes: MindNode[] = [
  { id: "1", text: "Quantum Physics", x: 400, y: 250, parentId: null },
  { id: "2", text: "Wave-Particle Duality", x: 200, y: 150, parentId: "1" },
  { id: "3", text: "Uncertainty Principle", x: 200, y: 350, parentId: "1" },
  { id: "4", text: "Quantum Entanglement", x: 600, y: 150, parentId: "1" },
  { id: "5", text: "Superposition", x: 600, y: 350, parentId: "1" },
  { id: "6", text: "Double-Slit", x: 80, y: 100, parentId: "2" },
  { id: "7", text: "Photon Behavior", x: 80, y: 200, parentId: "2" },
];

export default function MindMaps() {
  const [, navigate] = useLocation();
  const params = useParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<MindNode[]>(initialNodes);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPos, setLastPanPos] = useState({ x: 0, y: 0 });

  const handleNodeDragStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggingNode(nodeId);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggingNode) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setNodes(prevNodes => {
          const x = (e.clientX - rect.left - pan.x) / zoom;
          const y = (e.clientY - rect.top - pan.y) / zoom;
          return prevNodes.map(n => n.id === draggingNode ? { ...n, x, y } : n);
        });
      }
    } else if (isPanning) {
      const dx = e.clientX - lastPanPos.x;
      const dy = e.clientY - lastPanPos.y;
      setPan(prevPan => ({ x: prevPan.x + dx, y: prevPan.y + dy }));
      setLastPanPos({ x: e.clientX, y: e.clientY });
    }
  }, [draggingNode, isPanning, lastPanPos, pan.x, pan.y, zoom]);

  const handleMouseUp = useCallback(() => {
    setDraggingNode(null);
    setIsPanning(false);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handlePanStart = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === "svg") {
      setIsPanning(true);
      setLastPanPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleZoom = (delta: number) => {
    setZoom(Math.max(0.5, Math.min(2, zoom + delta)));
  };

  const handleAddNode = (parentId: string) => {
    const parent = nodes.find(n => n.id === parentId);
    if (parent) {
      const newNode: MindNode = {
        id: String(Date.now()),
        text: "New Topic",
        x: parent.x + 100,
        y: parent.y + 80,
        parentId
      };
      setNodes([...nodes, newNode]);
      setEditingNode(newNode.id);
      setEditText(newNode.text);
    }
  };

  const handleDeleteNode = (nodeId: string) => {
    const idsToDelete = new Set<string>([nodeId]);
    let changed = true;
    while (changed) {
      changed = false;
      nodes.forEach(n => {
        if (n.parentId && idsToDelete.has(n.parentId) && !idsToDelete.has(n.id)) {
          idsToDelete.add(n.id);
          changed = true;
        }
      });
    }
    setNodes(nodes.filter(n => !idsToDelete.has(n.id)));
  };

  const handleNodeDoubleClick = (nodeId: string, text: string) => {
    setEditingNode(nodeId);
    setEditText(text);
  };

  const handleEditSubmit = () => {
    if (editingNode) {
      setNodes(nodes.map(n => n.id === editingNode ? { ...n, text: editText } : n));
      setEditingNode(null);
      setEditText("");
    }
  };

  const getConnections = () => {
    return nodes
      .filter(n => n.parentId)
      .map(n => {
        const parent = nodes.find(p => p.id === n.parentId);
        return parent ? { from: parent, to: n } : null;
      })
      .filter(Boolean) as { from: MindNode; to: MindNode }[];
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="border-b border-border px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(`/@me/content/${params.courseId}`)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </button>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleZoom(-0.1)}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button size="sm" variant="ghost" onClick={() => handleZoom(0.1)}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing bg-muted/20"
        onMouseDown={handlePanStart}
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)`,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`
        }}
      >
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0" }}
        >
          {getConnections().map((conn, i) => (
            <line
              key={i}
              x1={conn.from.x}
              y1={conn.from.y}
              x2={conn.to.x}
              y2={conn.to.y}
              stroke="hsl(var(--border))"
              strokeWidth={2}
            />
          ))}
        </svg>

        <div
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0" }}
        >
          {nodes.map(node => (
            <div
              key={node.id}
              className="absolute group"
              style={{ left: node.x, top: node.y, transform: "translate(-50%, -50%)" }}
              onMouseDown={(e) => handleNodeDragStart(e, node.id)}
              onDoubleClick={() => handleNodeDoubleClick(node.id, node.text)}
            >
              <div
                className={`px-4 py-2 rounded-lg border bg-card cursor-move transition-shadow ${
                  node.parentId === null
                    ? "border-foreground font-medium"
                    : "border-border hover:border-foreground/50"
                } ${draggingNode === node.id ? "shadow-lg" : ""}`}
              >
                {editingNode === node.id ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={handleEditSubmit}
                    onKeyDown={(e) => e.key === "Enter" && handleEditSubmit()}
                    className="bg-transparent border-none focus:outline-none text-sm min-w-[80px]"
                    autoFocus
                  />
                ) : (
                  <span className="text-sm whitespace-nowrap">{node.text}</span>
                )}
              </div>

              <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); handleAddNode(node.id); }}
                  className="p-1 bg-card border border-border rounded hover:bg-muted"
                >
                  <Plus className="h-3 w-3" />
                </button>
                {node.parentId && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id); }}
                    className="p-1 bg-card border border-border rounded hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border px-4 py-2 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span>Drag nodes to move</span>
        <span>Double-click to edit</span>
        <span>Hover for actions</span>
      </div>
    </div>
  );
}