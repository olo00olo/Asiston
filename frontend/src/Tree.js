import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Tree from './Tree';

const MainContent = ({ isLoggedIn }) => {
  const [treeData, setTreeData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [newNodeName, setNewNodeName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState(null);

  const fetchTreeData = async () => {
    try {
      const response = await axios.get('http://localhost:5124/api/Tree');

      if (response.status === 200) {
        const data = response.data;
        const treeWithChildren = buildTreeHierarchy(data);
        setTreeData(treeWithChildren);
      }
    } catch (error) {
      setErrorMessage('Failed to fetch tree data');
    }
  };

  const buildTreeHierarchy = (data) => {
    const map = new Map();
    const roots = [];

    data.forEach((node) => {
      map.set(node.id, { ...node, children: [] });
    });

    data.forEach((node) => {
      if (node.parentId === null) {
        roots.push(map.get(node.id));
      } else {
        const parent = map.get(node.parentId);
        parent.children.push(map.get(node.id));
      }
    });

    return roots;
  };

  const addNewNode = async () => {
    if (!newNodeName.trim()) {
      return;
    }

    try {
      const newNode = {
        name: newNodeName,
        parentId: selectedParentId,
      };

      const response = await axios.post('http://localhost:5124/api/Tree', newNode);

      if (response.status === 201) {
        fetchTreeData();
        setNewNodeName('');
        setSelectedParentId(null);
      }
    } catch (error) {
      setErrorMessage('Failed to add new node');
    }
  };

  useEffect(() => {
    fetchTreeData();
  }, []);

  return (
    <div>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '300px' }}>
        <h2>Tree View</h2>

        {isLoggedIn && (
          <div style={{ marginBottom: '20px' }}>
            <h3>Add New Node</h3>
            <input
              type="text"
              value={newNodeName}
              onChange={(e) => setNewNodeName(e.target.value)}
              placeholder="Enter new node name"
            />
            <div>
              <label>Select Parent: </label>
              <select
                value={selectedParentId || ''}
                onChange={(e) => setSelectedParentId(Number(e.target.value))}
              >
                <option value="">None (Root)</option>
                {treeData.map((rootNode) => (
                  <option key={rootNode.id} value={rootNode.id}>
                    {rootNode.name}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={addNewNode}>Add Node</button>
          </div>
        )}

        {treeData.length > 0 ? (
          <Tree data={treeData} />
        ) : (
          <p>Loading tree data...</p>
        )}
      </div>
    </div>
  );
};

export default MainContent;
