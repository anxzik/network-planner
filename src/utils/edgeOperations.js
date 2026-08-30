// Pure transforms over the edges array.

// Drop one edge.
export function removeEdge(edges, edgeId) {
  return edges.filter((edge) => edge.id !== edgeId);
}

// Drop every edge touching a node, at either end. Used when the node itself is
// deleted, so no edge is left dangling.
export function removeEdgesForNode(edges, nodeId) {
  return edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);
}

// Look up an edge by id.
export function findEdge(edges, edgeId) {
  return edges.find((edge) => edge.id === edgeId);
}
