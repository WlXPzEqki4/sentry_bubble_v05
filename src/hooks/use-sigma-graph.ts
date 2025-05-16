
import { useState, useEffect, useRef } from 'react';
import { Sigma } from "sigma";
import Graph from "graphology";
import { getFamilyColor } from '@/utils/colors';

export const useSigmaGraph = (graphData: any, searchTerm: string, containerRef: React.RefObject<HTMLDivElement>) => {
  const sigmaRef = useRef<Sigma | null>(null);
  const graphRef = useRef<Graph | null>(null);

  // Initialize the graph when component mounts or data changes
  useEffect(() => {
    if (!graphData || !graphData.nodes || !containerRef.current) return;
    
    // Create a new graph instance
    const graph = new Graph();
    graphRef.current = graph;
    
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
    
    // Initialize sigma
    const sigma = new Sigma(graph, containerRef.current, {
      defaultNodeColor: "#9b87f5",
      defaultEdgeColor: "#eee",
      labelColor: { attribute: "color" },
      labelSize: 14,
      renderEdgeLabels: false
    });
    
    sigmaRef.current = sigma;
    
    // Position camera
    sigma.getCamera().animate({
      x: 0.5,
      y: 0.5,
      ratio: 1.2
    });
    
    // Cleanup
    return () => {
      if (sigma) {
        sigma.kill();
        sigmaRef.current = null;
      }
    };
  }, [graphData]);

  // Filter nodes based on search term
  useEffect(() => {
    if (!sigmaRef.current || !graphRef.current) return;
    
    const graph = graphRef.current;
    const sigma = sigmaRef.current;
    
    if (!searchTerm) {
      // If search is empty, show all nodes
      graph.forEachNode((nodeId) => {
        graph.setNodeAttribute(nodeId, "hidden", false);
      });
      sigma.refresh();
      return;
    }
    
    const searchLower = searchTerm.toLowerCase();
    
    graph.forEachNode((nodeId) => {
      const attributes = graph.getNodeAttributes(nodeId);
      const label = attributes.label ? attributes.label.toLowerCase() : '';
      const matches = label.includes(searchLower);
      
      graph.setNodeAttribute(nodeId, "hidden", !matches);
    });
    
    sigma.refresh();
  }, [searchTerm]);

  return { sigmaRef, graphRef };
};
