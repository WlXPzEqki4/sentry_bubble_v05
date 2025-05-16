
import React, { useEffect, useState, useRef } from 'react';
import { SigmaContainer, useSigma, useLoadGraph } from "react-sigma";
import Graph from "graphology";
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Panel } from '@/components/ui/panel';
import { getFamilyColor } from '@/utils/colors';

interface BubbleChartSigmaProps {
  graphData: any;
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetSearch: () => void;
  onNodeClick: (node: any) => void;
  isLoading: boolean;
}

// Sigma component that initializes the graph
const SigmaGraph = ({ 
  graphData, 
  searchTerm, 
  onNodeClick 
}: { 
  graphData: any;
  searchTerm: string;
  onNodeClick: (node: any) => void;
}) => {
  const sigma = useSigma();
  const loadGraph = useLoadGraph();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const graphInitialized = useRef(false);

  useEffect(() => {
    if (!graphData || graphInitialized.current) return;
    
    const graph = new Graph();

    // Add nodes to graph
    graphData.nodes.forEach((node: any) => {
      graph.addNode(node.id.toString(), {
        ...node,
        size: node.size || 5,
        label: node.label,
        color: getFamilyColor(node.family),
        x: Math.random(),
        y: Math.random()
      });
    });

    // Add edges to graph
    graphData.edges.forEach((edge: any) => {
      graph.addEdge(
        edge.source.toString(),
        edge.target.toString(), 
        {
          weight: edge.weight,
          size: edge.weight / 2,
          color: "#aaa"
        }
      );
    });

    loadGraph(graph);
    graphInitialized.current = true;
    
    // Set camera to fit the graph
    sigma.getCamera().animate({ 
      x: 0.5, 
      y: 0.5, 
      ratio: 1.2,
      duration: 500
    });

    // Event listeners
    sigma.on("clickNode", (event) => {
      const nodeId = event.node;
      const nodeAttributes = graph.getNodeAttributes(nodeId);
      onNodeClick({ 
        id: nodeId, 
        data: nodeAttributes 
      });
    });

    sigma.on("enterNode", (event) => {
      setHoveredNode(event.node);
      sigma.getGraph().setNodeAttribute(event.node, "hovered", true);
      sigma.refresh();
    });

    sigma.on("leaveNode", (event) => {
      setHoveredNode(null);
      sigma.getGraph().setNodeAttribute(event.node, "hovered", false);
      sigma.refresh();
    });

    return () => {
      sigma.removeAllListeners();
    };
  }, [graphData, loadGraph, onNodeClick, sigma]);

  // Filter nodes based on search term
  useEffect(() => {
    if (!sigma || !searchTerm) {
      sigma.getGraph().forEachNode((node) => {
        sigma.getGraph().setNodeAttribute(node, "hidden", false);
      });
      sigma.refresh();
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    sigma.getGraph().forEachNode((node) => {
      const attributes = sigma.getGraph().getNodeAttributes(node);
      const label = attributes.label.toLowerCase();
      const matches = label.includes(searchLower);
      
      sigma.getGraph().setNodeAttribute(node, "hidden", !matches);
    });
    
    sigma.refresh();
  }, [searchTerm, sigma]);

  return null;
};

const BubbleChartSigma: React.FC<BubbleChartSigmaProps> = ({
  graphData,
  searchTerm,
  onSearchChange,
  resetSearch,
  onNodeClick,
  isLoading
}) => {
  const key = `sigma-${graphData ? JSON.stringify(graphData).length : '0'}-${Date.now()}`;

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Skeleton className="h-[400px] w-[90%] rounded-md" />
      </div>
    );
  }

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-gray-500">No data available for this network.</p>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <SigmaContainer 
        key={key}
        style={{ height: "100%", width: "100%" }}
        settings={{
          nodeProgramClasses: {},
          defaultNodeColor: "#9b87f5",
          defaultEdgeColor: "#eee",
          labelColor: { color: "#333" },
          labelSize: 14,
          labelWeight: "bold",
          renderLabels: true,
          labelGridCellSize: 100,
          labelDensity: 1,
          labelRenderedSizeThreshold: 10,
        }}
      >
        <SigmaGraph 
          graphData={graphData} 
          searchTerm={searchTerm}
          onNodeClick={onNodeClick} 
        />
        <Panel position="top-left">
          <div className="flex items-center bg-white p-2 rounded-md shadow-sm">
            <Search className="h-4 w-4 text-gray-500 mr-2" />
            <Input
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={onSearchChange}
              className="h-8 w-[200px] border-none focus-visible:ring-0"
            />
            {searchTerm && (
              <button className="h-8 w-8 p-0 ml-1" onClick={resetSearch}>
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </Panel>
      </SigmaContainer>
    </div>
  );
};

export default BubbleChartSigma;
