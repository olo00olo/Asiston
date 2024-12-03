import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TreeView = () => {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const response = await axios.get('http://localhost:5124/api/tree');
        setNodes(response.data);
      } catch (err) {
        setError('Failed to fetch tree nodes.');
      } finally {
        setLoading(false);
      }
    };

    fetchNodes();
  }, []);

  const buildTree = (nodes, parentId = null) => {
    return nodes
      .filter((node) => node.parentId === parentId)
      .map((node) => ({
        ...node,
        children: buildTree(nodes, node.id),
      }));
  };

  const renderTree = (nodes) => {
    return (
      <ul>
        {nodes.map((node) => (
          <li key={node.id}>
            {node.name}
            {node.children.length > 0 && renderTree(node.children)}
          </li>
        ))}
      </ul>
    );
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const tree = buildTree(nodes);

  return <div>{renderTree(tree)}</div>;
};

export default TreeView;
