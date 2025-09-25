import React, { useState } from 'react';
import ReactFlow, { Controls, Background, BackgroundVariant, type Node, type Edge } from 'reactflow'; // <-- 1. IMPORT 'Edge'
import 'reactflow/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, GitBranchPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

// --- Initial Data ---
const initialNodes: Node[] = [
  { id: '1', position: { x: 0, y: 100 }, data: { label: 'Diagnosis: Type 2 Diabetes' } },
  { id: '2', position: { x: 250, y: 100 }, data: { label: 'Prescription: Metformin' } },
  { id: '3', position: { x: 500, y: 100 }, data: { label: 'Follow-up Consultation' } },
];
const initialEdges: Edge[] = [ // <-- Added 'Edge[]' type for clarity
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
];
const mockPatients = ["PAT-101", "PAT-102", "PAT-103", "PAT-104", "PAT-105"];

export function TimelineViewer() {
  const { datasetId } = useParams();
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges); // <-- Use the 'Edge' type here
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [scenario, setScenario] = useState("");

  const onNodeClick = (_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  const addBranch = () => {
    if (!selectedNode) return;

    const newBranchY = selectedNode.position.y + 150;
    const lastNodeId = nodes.length;

    const newNode: Node = {
      id: `${lastNodeId + 1}`,
      position: { x: selectedNode.position.x + 250, y: newBranchY },
      data: { label: scenario },
    };
    
    // Create an edge from the selected node to the new branch node
    const newEdge: Edge = {
      id: `e${selectedNode.id}-${newNode.id}`,
      source: selectedNode.id,
      target: newNode.id,
      type: 'step',
      animated: true, // <-- 2. THIS WAS THE MISSING PIECE
    };

    setNodes((nds) => nds.concat(newNode));
    setEdges((eds) => eds.concat(newEdge));
    setSelectedNode(null);
    setScenario("");
  };

  return (
    <div className="h-screen w-full flex">
      <Card className="w-[300px] h-screen rounded-none border-r flex flex-col">
        <CardHeader>
          <Button asChild variant="outline" size="sm" className="mb-4">
            <Link to="/dashboard/researcher"><ArrowLeft className="w-4 h-4 mr-2" />Back to Dashboard</Link>
          </Button>
          <CardTitle>Dataset: {datasetId}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {mockPatients.map((patientId) => (
                <Button key={patientId} variant="ghost" className="w-full justify-start">
                  {patientId}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <div className="flex-grow h-screen">
        <Dialog open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a "What If" Scenario</DialogTitle>
              <DialogDescription>
                Branching from: <strong>{selectedNode?.data.label}</strong>. Describe the new event or intervention.
              </DialogDescription>
            </DialogHeader>
            <Input 
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="e.g., Prescribe Ozempic"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedNode(null)}>Cancel</Button>
              <Button onClick={addBranch}>
                <GitBranchPlus className="w-4 h-4 mr-2" />
                Create Branch
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={onNodeClick}
          fitView
        >
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}