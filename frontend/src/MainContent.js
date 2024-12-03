import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MainContent = ({ isLoggedIn }) => {
  const [treeData, setTreeData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [newNodeName, setNewNodeName] = useState('');
  const [parentNode, setParentNode] = useState(null);
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // State for sorting order

  // Fetch tree data
  const fetchTreeData = async () => {
    try {
      const response = await axios.get('http://localhost:5124/api/Tree');
      if (response.status === 200) {
        setTreeData(response.data);
      }
    } catch (error) {
      setErrorMessage('Failed to fetch tree data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreeData();
  }, []);

  // Sort nodes alphabetically based on sortOrder (asc or desc)
  const sortNodes = (nodes) => {
    return nodes.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
  };

  // Add new node
  const addNewNode = async (nodeId) => {
    try {
      const newNode = {
        name: newNodeName,
        parentId: nodeId,
      };

      if (!newNode.name.trim()) {
        alert("Node name can't be empty");
        throw new Error('Node name cannot be empty.');
      }

      const isDuplicateName = treeData.some(
        (node) => node.parentId === nodeId && node.name === newNodeName
      );

      if (isDuplicateName) {
        alert("A node with the same name already exists under the same parent.");
        return;
      }

      const token = localStorage.getItem('accessToken');

      if (!token) {
        alert("You are not authorized. Please log in.");
        return;
      }

      const response = await axios.post(
        'http://localhost:5124/api/Tree',
        newNode);

      if (response.status === 201) {
        const addedNode = { ...response.data, parentId: nodeId };
        setTreeData((prevData) => [...prevData, addedNode]);
        setShowAddNodeModal(false);
        setNewNodeName('');
      }
    } catch (error) {
      console.error('Error adding node:', error);
    }
  };

  // Delete node
  const deleteNode = async (nodeId) => {
    const hasChildren = treeData.some((node) => node.parentId === nodeId);

    if (hasChildren) {
      const confirmDelete = window.confirm(
        'This node has children. Deleting this node will also delete all its descendants. Do you want to proceed?'
      );

      if (!confirmDelete) {
        return;
      }
    }

    try {
      await axios.delete(`http://localhost:5124/api/Tree/${nodeId}`);
      setTreeData((prevData) => prevData.filter((node) => node.id !== nodeId));
    } catch (error) {
      console.error('Error deleting node:', error);
    }
  };

  // Check if a node is a descendant of another
  const isDescendant = (nodeId, potentialAncestorId, nodes) => {
    const node = nodes.find((node) => node.id === nodeId);
    if (!node) return false;
  
    let currentNode = node;
  
    currentNode = nodes.find((n) => n.id === potentialAncestorId);
    while (currentNode) {
      if (currentNode.id === nodeId) {
        return true; // It's an ancestor
      }
      currentNode = nodes.find((n) => n.id === currentNode.parentId); // Move to the parent
    }
  
    return false;
  };

  // Handle drag start
  const handleDragStart = (e, node) => {
    e.stopPropagation();
    setDraggedNode(node);
    e.target.classList.add('dragging');
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.target.classList.add('drag-over');
  };

  const checkDuplicateName = (nodeName, parentId) => {
    return treeData.some(
      (node) => node.parentId === parentId && node.name === nodeName
    );
  };

  // Handle drop
  const handleDrop = async (e, targetNode) => {
    e.preventDefault();
    e.stopPropagation();
    e.target.classList.remove('drag-over');

    if (!draggedNode || draggedNode.id === targetNode.id) return;

    if (isDescendant(draggedNode.id, targetNode.id, treeData)) {
      alert("You can't move a node into one of its descendants.");
      return;
    }

    if (draggedNode.parentId === null) {
      alert("The root node cannot be moved.");
      return;
    }

    const isDuplicate = checkDuplicateName(draggedNode.name, targetNode.id);
    if (isDuplicate) {
      alert('A node with the same name already exists under this parent.');
      return;
    }

    try {
      const updatedNode = { ...draggedNode, parentId: targetNode.id };
      await axios.put(`http://localhost:5124/api/Tree/${draggedNode.id}`, updatedNode);

      setTreeData((prevData) =>
        prevData.map((node) =>
          node.id === draggedNode.id
            ? { ...node, parentId: targetNode.id }
            : node
        )
      );
      setDraggedNode(null);
    } catch (error) {
      console.error('Error updating parent ID:', error);
    }
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging', 'drag-over');
    setDraggedNode(null);
  };

  // Handle right-click to show context menu
  const handleRightClick = (e, node) => {
    if (!isLoggedIn) {
      return; // Skip context menu if not logged in
    }
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      nodeId: node.id,
    });
  };

  // Handle Add Node click
  const handleAddClick = () => {
    if (contextMenu?.nodeId) {
      setParentNode(contextMenu.nodeId);
      setShowAddNodeModal(true);
    }
    setContextMenu(null);
  };

  // Handle Delete Node click
  const handleDeleteClick = () => {
    if (contextMenu?.nodeId) {
      deleteNode(contextMenu.nodeId);
    }
    setContextMenu(null);
  };

  // Close context menu
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  // Toggle all nodes (expand or collapse all)
  const toggleAllNodes = () => {
    if (expandedNodes.size === treeData.length) {
      setExpandedNodes(new Set()); // Collapse all
    } else {
      setExpandedNodes(new Set(treeData.map((node) => node.id))); // Expand all
    }
  };

  // Render tree recursively with sorting
  const renderTree = (nodes, parentId = null) => {
    const filteredNodes = nodes.filter((node) => node.parentId === parentId);
    const sortedNodes = sortNodes(filteredNodes); // Sort nodes before rendering

    return (
      <ul>
        {sortedNodes.map((node) => {
          // Sprawdzamy, czy węzeł ma dzieci
          const hasChildren = nodes.some((child) => child.parentId === node.id);

          return (
            <li
              key={node.id}
              draggable
              onDragStart={(e) => handleDragStart(e, node)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, node)}
              onDragEnd={handleDragEnd}
              onContextMenu={(e) => handleRightClick(e, node)}
            >
              {node.name}
              {" "}
              {hasChildren && (
                <button onClick={() => toggleNode(node.id)}>
                  {expandedNodes.has(node.id) ? '−' : '+'}
                </button>
              )}
              {expandedNodes.has(node.id) && hasChildren && renderTree(nodes, node.id)}
            </li>
          );
        })}
      </ul>
    );
  };

  const toggleNode = (id) => {
    setExpandedNodes((prev) =>
      prev.has(id) ? new Set([...prev].filter((nodeId) => nodeId !== id)) : new Set(prev.add(id))
    );
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div onClick={handleCloseContextMenu}>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '300px' }}>
        <h2>Tree View</h2>

        {/* Sort Order Button */}
        <button onClick={toggleSortOrder}>
          Sort {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
        </button>

        {/* Toggle all nodes button */}
        <button onClick={toggleAllNodes}>
          {expandedNodes.size === treeData.length ? 'Collapse All' : 'Expand All'}
        </button>

        {/* Render Tree */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div>{renderTree(treeData)}</div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          style={{
            position: 'absolute',
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            backgroundColor: 'white',
            boxShadow: '0px 0px 5px rgba(0,0,0,0.2)',
            padding: '10px',
            zIndex: 1000,
          }}
        >
          <div onClick={handleAddClick} style={contextMenuOptionStyle}>
            Add Node
          </div>
          <div onClick={handleDeleteClick} style={contextMenuOptionStyle}>
            Delete Node
          </div>
        </div>
      )}

      {/* Modal for Adding New Node */}
      {showAddNodeModal && isLoggedIn && (
        <div style={modalStyle}>
          <h3>Add New Node</h3>
          <input
            type="text"
            value={newNodeName}
            onChange={(e) => setNewNodeName(e.target.value)}
            placeholder="Node name"
          />
          <div>
            <button onClick={() => addNewNode(parentNode)}>Add Node</button>
            <button onClick={() => setShowAddNodeModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

const modalStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  padding: '20px',
  boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
};

const contextMenuOptionStyle = {
  padding: '5px 10px',
  cursor: 'pointer',
  borderBottom: '1px solid #ddd',
};

export default MainContent;
