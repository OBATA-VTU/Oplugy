import React from 'react';
import { Navigate } from 'react-router-dom';

const TestTerminalPage: React.FC = () => {
  return <Navigate to="/terminal/overview" replace />;
};

export default TestTerminalPage;