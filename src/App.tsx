import React, { useState, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import HomePage from './pages/HomePage';
import Layout from './components/Layout';

// Direct import for PhasePage
import PhasePage from './pages/PhasePage';

export const CodeContext = React.createContext<{
  code: string;
  setCode: (code: string) => void;
}>({
  code: 'int a = 5 + 2;',
  setCode: () => {},
});

const App: React.FC = () => {
  const [code, setCode] = useState('int a = 5 + 2;');
  const location = useLocation();

  return (
    <ThemeProvider>
      <CodeContext.Provider value={{ code, setCode }}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path=":phaseId" element={
              <Suspense fallback={<div>Loading...</div>}>
                <PhasePage />
              </Suspense>
            } />
          </Route>
        </Routes>
      </CodeContext.Provider>
    </ThemeProvider>
  );
};

export default App;
