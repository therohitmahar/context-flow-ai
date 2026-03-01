import React, { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import TopBar from '../components/TopBar/TopBar';
import Sidebar from '../components/Sidebar/Sidebar';
import Canvas from '../components/Canvas/Canvas';
import OutputPanel from '../components/OutputPanel/OutputPanel';
import EditContextModal from '../components/EditContextModal/EditContextModal';
import { useStore } from '../store/useStore';
import { useParams } from 'react-router-dom';

const FlowPageInner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // @ts-ignore - The load method typing issue will be ignored here while store type stabilizes
  const { load, modalState } = useStore();

  useEffect(() => {
    load(id || undefined);
  }, [load, id]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#101622]">
      <TopBar />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <Canvas />
        <OutputPanel />
        {modalState.isOpen && <EditContextModal />}
      </div>
    </div>
  );
};

// Wrap with ReactFlowProvider so hooks like useEdges() work inside node components
const FlowPage: React.FC = () => {
  return (
    <ReactFlowProvider>
      <FlowPageInner />
    </ReactFlowProvider>
  );
};

export default FlowPage;
