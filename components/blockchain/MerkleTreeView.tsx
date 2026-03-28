/**
 * Merkle Tree Visualiser Component
 *
 * Interactive simplified tree diagram showing verification proof path
 * for WREI carbon credit blockchain verification with educational tooltips.
 *
 * WREI Trading Platform - Phase 3: Institutional Depth
 * Enhancement C2: Blockchain Provenance Visualiser
 */

'use client';

import React, { useState } from 'react';

// Merkle tree node structure
export interface MerkleNode {
  id: string;
  hash: string;
  level: number;
  isProofPath: boolean;
  isTarget: boolean;
  children?: MerkleNode[];
  data?: {
    type: 'leaf' | 'branch' | 'root';
    description: string;
    tooltip: string;
  };
}

export interface MerkleTreeViewProps {
  creditId: string;
  rootHash?: string;
  proofPath?: string[];
  className?: string;
  showTooltips?: boolean;
}

// Sample Merkle tree structure for demonstration
const generateSampleMerkleTree = (creditId: string): MerkleNode => {
  return {
    id: 'root',
    hash: '0x8f3d2c1a9b7e5f4c2a9d8e6b3f1c5a7e9d2b8f4a6c3e1d9b7f5c2a8e6d4b1f3a',
    level: 0,
    isProofPath: true,
    isTarget: false,
    data: {
      type: 'root',
      description: 'Merkle Root',
      tooltip: 'The root hash represents the entire batch of carbon credits verified together. This ensures the integrity of all credits in the batch.',
    },
    children: [
      {
        id: 'branch-left',
        hash: '0x4a6b2e8d1c9f3b7a5e2d8c6f1a9b4e7d2c5a8f3b6e9d1c4f7a2e5b8d3c6f9a1',
        level: 1,
        isProofPath: true,
        isTarget: false,
        data: {
          type: 'branch',
          description: 'Left Branch',
          tooltip: 'This branch contains hashes from credits WREI-001 to WREI-128. Our target credit is in this branch.',
        },
        children: [
          {
            id: 'leaf-target',
            hash: '0x2e5b8d3c6f9a1b4e7d2c5a8f3b6e9d1c4f7a2e5b8d3c6f9a1b4e7d2c5a8f3b6',
            level: 2,
            isProofPath: true,
            isTarget: true,
            data: {
              type: 'leaf',
              description: `Credit ${creditId}`,
              tooltip: 'This is our target credit! This leaf contains the hash of all verification data for this specific carbon credit.',
            },
          },
          {
            id: 'leaf-sibling',
            hash: '0x9d1c4f7a2e5b8d3c6f9a1b4e7d2c5a8f3b6e9d1c4f7a2e5b8d3c6f9a1b4e7d2',
            level: 2,
            isProofPath: true,
            isTarget: false,
            data: {
              type: 'leaf',
              description: 'Sibling Credit',
              tooltip: 'This sibling leaf is needed to verify our target credit. The hash of both leaves creates the parent branch hash.',
            },
          },
        ],
      },
      {
        id: 'branch-right',
        hash: '0x7d2c5a8f3b6e9d1c4f7a2e5b8d3c6f9a1b4e7d2c5a8f3b6e9d1c4f7a2e5b8d3',
        level: 1,
        isProofPath: false,
        isTarget: false,
        data: {
          type: 'branch',
          description: 'Right Branch',
          tooltip: 'This branch contains credits WREI-129 to WREI-256. Not part of our proof path, but needed to verify the root.',
        },
        children: [
          {
            id: 'leaf-other1',
            hash: '0x6f9a1b4e7d2c5a8f3b6e9d1c4f7a2e5b8d3c6f9a1b4e7d2c5a8f3b6e9d1c4f7',
            level: 2,
            isProofPath: false,
            isTarget: false,
            data: {
              type: 'leaf',
              description: 'Other Credit 1',
              tooltip: 'Another carbon credit in the same batch, verified simultaneously.',
            },
          },
          {
            id: 'leaf-other2',
            hash: '0xa2e5b8d3c6f9a1b4e7d2c5a8f3b6e9d1c4f7a2e5b8d3c6f9a1b4e7d2c5a8f3b6',
            level: 2,
            isProofPath: false,
            isTarget: false,
            data: {
              type: 'leaf',
              description: 'Other Credit 2',
              tooltip: 'Another carbon credit in the same batch, verified simultaneously.',
            },
          },
        ],
      },
    ],
  };
};

const MerkleTreeView: React.FC<MerkleTreeViewProps> = ({
  creditId,
  rootHash,
  proofPath = [],
  className = '',
  showTooltips = true,
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const tree = generateSampleMerkleTree(creditId);

  const copyToClipboard = async (text: string, nodeId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHash(nodeId);
      setTimeout(() => setCopiedHash(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatHash = (hash: string): string => {
    if (hash.length <= 16) return hash;
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  const getNodeStyle = (node: MerkleNode) => {
    let baseStyle = 'border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 text-center min-w-32 ';

    if (node.isTarget) {
      baseStyle += 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200 ';
    } else if (node.isProofPath) {
      baseStyle += 'border-green-500 bg-green-50 ';
    } else {
      baseStyle += 'border-slate-300 bg-slate-50 opacity-60 ';
    }

    if (hoveredNode === node.id) {
      baseStyle += 'scale-105 shadow-lg ';
    }

    if (selectedNode === node.id) {
      baseStyle += 'ring-2 ring-purple-300 ';
    }

    return baseStyle;
  };

  const getConnectionStyle = (isProofPath: boolean) => {
    return isProofPath
      ? 'stroke-green-500 stroke-2'
      : 'stroke-slate-300 stroke-1 opacity-60';
  };

  const renderNode = (node: MerkleNode, x: number, y: number) => {
    const isHovered = hoveredNode === node.id;
    const showTooltip = showTooltips && isHovered && node.data?.tooltip;

    return (
      <g key={node.id}>
        {/* Node */}
        <foreignObject
          x={x - 80}
          y={y - 40}
          width="160"
          height="80"
          onMouseEnter={() => setHoveredNode(node.id)}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
        >
          <div className={getNodeStyle(node)}>
            <div className="bloomberg-section-label font-medium text-slate-700 mb-1">
              {node.data?.description || 'Node'}
            </div>
            <div className="bloomberg-data bloomberg-section-label text-slate-600">
              {formatHash(node.hash)}
            </div>
            {node.isTarget && (
              <div className="bloomberg-section-label text-blue-600  mt-1">
                🎯 TARGET
              </div>
            )}
          </div>
        </foreignObject>

        {/* Tooltip */}
        {showTooltip && (
          <foreignObject
            x={x - 120}
            y={y - 100}
            width="240"
            height="50"
            className="pointer-events-none"
          >
            <div className="bg-slate-800 text-white bloomberg-section-label p-2 rounded shadow-lg max-w-xs">
              {node.data?.tooltip}
            </div>
          </foreignObject>
        )}
      </g>
    );
  };

  const renderConnection = (fromX: number, fromY: number, toX: number, toY: number, isProofPath: boolean) => {
    return (
      <line
        x1={fromX}
        y1={fromY + 40}
        x2={toX}
        y2={toY - 40}
        className={getConnectionStyle(isProofPath)}
      />
    );
  };

  const renderTree = (node: MerkleNode, x: number, y: number, width: number): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];

    // Render current node
    elements.push(renderNode(node, x, y));

    // Render children
    if (node.children && node.children.length > 0) {
      const childWidth = width / node.children.length;
      const startX = x - width / 2 + childWidth / 2;

      node.children.forEach((child, index) => {
        const childX = startX + index * childWidth;
        const childY = y + 120;

        // Render connection line
        elements.push(
          <g key={`connection-${node.id}-${child.id}`}>
            {renderConnection(x, y, childX, childY, child.isProofPath)}
          </g>
        );

        // Recursively render child
        elements.push(...renderTree(child, childX, childY, childWidth));
      });
    }

    return elements;
  };

  return (
    <div className={`merkle-tree-view ${className}`}>
      <div className="mb-6">
        <h3 className="bloomberg-card-title text-slate-800 mb-2">
          Merkle Tree Proof Path
        </h3>
        <p className="bloomberg-small-text text-slate-600 mb-4">
          Verification path for credit <span className="bloomberg-data text-slate-800">{creditId}</span>.
          Green nodes show the proof path needed to verify this credit&apos;s authenticity.
        </p>
      </div>

      {/* Tree visualization */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 overflow-x-auto">
        <svg
          width="800"
          height="400"
          viewBox="0 0 800 400"
          className="w-full h-auto"
        >
          {renderTree(tree, 400, 80, 600)}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 p-4 bg-slate-50 rounded-lg">
        <h4 className="bloomberg-small-text  text-slate-700 mb-3">Legend</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bloomberg-section-label">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-500 bg-blue-50 rounded"></div>
            <span className="text-slate-600">Target Credit (your credit)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-green-500 bg-green-50 rounded"></div>
            <span className="text-slate-600">Proof Path (needed for verification)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-slate-300 bg-slate-50 rounded opacity-60"></div>
            <span className="text-slate-600">Other Credits (in same batch)</span>
          </div>
        </div>
      </div>

      {/* Selected node details */}
      {selectedNode && (
        <div className="mt-4 p-4 bg-white border border-slate-200 rounded-lg">
          <h4 className="bloomberg-small-text  text-slate-700 mb-2">Node Details</h4>
          {(() => {
            const findNode = (node: MerkleNode): MerkleNode | null => {
              if (node.id === selectedNode) return node;
              if (node.children) {
                for (const child of node.children) {
                  const found = findNode(child);
                  if (found) return found;
                }
              }
              return null;
            };

            const node = findNode(tree);
            if (!node) return null;

            return (
              <div className="space-y-2 bloomberg-small-text">
                <div className="flex justify-between">
                  <span className="text-slate-600">Description:</span>
                  <span className="font-medium">{node.data?.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Type:</span>
                  <span className="bloomberg-data">{node.data?.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Level:</span>
                  <span className="bloomberg-data">{node.level}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Hash:</span>
                  <button
                    onClick={() => copyToClipboard(node.hash, node.id)}
                    className="bloomberg-data text-blue-600 hover:text-blue-800 bloomberg-section-label bg-blue-50 px-2 py-1 rounded"
                  >
                    {formatHash(node.hash)}
                    {copiedHash === node.id ? ' ✓' : ' 📋'}
                  </button>
                </div>
                {node.data?.tooltip && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-slate-600 italic">{node.data.tooltip}</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* How it works section */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="bloomberg-small-text  text-blue-800 mb-2">🔍 How Merkle Proof Works</h4>
        <div className="bloomberg-section-label text-blue-700 space-y-2">
          <p>
            <strong>1.</strong> Your credit is hashed and becomes a &quot;leaf&quot; in the tree
          </p>
          <p>
            <strong>2.</strong> Pairs of leaves are hashed together to create &quot;branch&quot; nodes
          </p>
          <p>
            <strong>3.</strong> This process continues until we reach a single &quot;root&quot; hash
          </p>
          <p>
            <strong>4.</strong> To verify your credit, we only need the hashes along the green path -
            not the entire batch!
          </p>
        </div>
      </div>
    </div>
  );
};

export default MerkleTreeView;