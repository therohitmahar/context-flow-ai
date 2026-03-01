import React, { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import TopBar from './components/TopBar/TopBar';
import Sidebar from './components/Sidebar/Sidebar';
import Canvas from './components/Canvas/Canvas';
import OutputPanel from './components/OutputPanel/OutputPanel';
import { useStore } from './store/useStore';

const AppInner: React.FC = () => {
  const { load } = useStore();

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#101622]">

      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Canvas />
        <OutputPanel />
      </div>
    </div>
  );
};

// Wrap with ReactFlowProvider so hooks like useEdges() work inside node components
const App: React.FC = () => {
  return (
    <ReactFlowProvider>
      <AppInner />
    </ReactFlowProvider>
  );
};

export default App;
