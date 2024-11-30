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

  const fetchTreeData = async () => {
    try {
      const response = await axios.get('http://localhost:5124/api/Tree'); // Endpoint API

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

  const addNewNode = async () => {
    try {
      const newNode = {
        name: newNodeName,
        parentId: parentNode?.id || null,
      };

      const response = await axios.post('http://localhost:5124/api/Tree', newNode);

      if (response.status === 201) {
        setTreeData((prevData) => [...prevData, response.data]);
        setShowAddNodeModal(false);
      }
    } catch (error) {
      console.error('Error adding node:', error);
    }
  };

  const renderTree = (nodes, parentId = null) => {
    const filteredNodes = nodes.filter((node) => node.parentId === parentId);

    return (
      <ul>
        {filteredNodes.map((node) => (
          <li key={node.id} onContextMenu={(e) => isLoggedIn && handleRightClick(e, node)}>
            <button onClick={() => toggleNode(node.id)}>
              {expandedNodes.has(node.id) ? '−' : '+'}
            </button>
            {node.name}
            {expandedNodes.has(node.id) && renderTree(nodes, node.id)}
          </li>
        ))}
      </ul>
    );
  };

  const toggleNode = (id) => {
    setExpandedNodes((prevExpandedNodes) => {
      const newExpandedNodes = new Set(prevExpandedNodes);
      if (newExpandedNodes.has(id)) {
        newExpandedNodes.delete(id);
      } else {
        newExpandedNodes.add(id);
      }
      return newExpandedNodes;
    });
  };

  const handleRightClick = (e, node) => {
    e.preventDefault();
    setParentNode(node);
    setShowAddNodeModal(true);
  };

  return (
    <div>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '300px' }}>
        <h2>Tree View</h2>
        {loading ? (
          <p>Loading tree data...</p>
        ) : treeData.length > 0 ? (
          renderTree(treeData)
        ) : (
          <p>No tree data available</p>
        )}
      </div>

      {}
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
            <button onClick={addNewNode}>Add Node</button>
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

export default MainContent;
