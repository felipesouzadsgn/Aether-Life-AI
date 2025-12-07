import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import { ViewState } from './types';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'finance':
        return (
          <div className="flex items-center justify-center h-[80vh] text-zinc-600 font-light tracking-widest uppercase">
            Finance Module Loading...
          </div>
        );
      case 'calendar':
        return (
          <div className="flex items-center justify-center h-[80vh] text-zinc-600 font-light tracking-widest uppercase">
            Temporal Engine Loading...
          </div>
        );
      case 'brain':
        return (
          <div className="flex items-center justify-center h-[80vh] text-zinc-600 font-light tracking-widest uppercase">
            Neural Interface Loading...
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 0.3 }}
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
};

export default App;