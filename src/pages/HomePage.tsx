import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompilerPhase } from '../types/compiler';
import { FiCode, FiCpu, FiCpu as FiRobot, FiCpu as FiMicrochip, FiGrid as FiTable, FiLayers as FiSitemap, FiSettings as FiCogs } from 'react-icons/fi';
import { CodeContext } from '../App';
import CodeInput from '../components/CodeInput';

const COMPILER_PHASES: CompilerPhase[] = [
  {
    id: 'lexical-analysis',
    title: 'Lexical Analysis',
    description: 'Breaking source code into tokens',
    icon: 'FaCode',
    color: 'bg-blue-500',
  },
  {
    id: 'syntax-analysis',
    title: 'Syntax Analysis',
    description: 'Building a parse tree from tokens',
    icon: 'FaSitemap',
    color: 'bg-green-500',
  },
  {
    id: 'semantic-analysis',
    title: 'Semantic Analysis',
    description: 'Validating the meaning of the program',
    icon: 'FaTable',
    color: 'bg-purple-500',
  },
  {
    id: 'intermediate-code',
    title: 'Intermediate Code',
    description: 'Generating intermediate representation',
    icon: 'FaRobot',
    color: 'bg-yellow-500',
  },
  {
    id: 'optimization',
    title: 'Optimization',
    description: 'Improving the intermediate code',
    icon: 'FaCogs',
    color: 'bg-red-500',
  },
  {
    id: 'code-generation',
    title: 'Code Generation',
    description: 'Producing target machine code',
    icon: 'FaMicrochip',
    color: 'bg-indigo-500',
  },
];

const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  FaCode: FiCode,
  FaSitemap: FiSitemap,
  FaTable: FiTable,
  FaCogs: FiCogs,
  FaRobot: FiRobot,
  FaMicrochip: FiMicrochip,
};

const HomePage = () => {
  const navigate = useNavigate();
  const { code, setCode } = useContext(CodeContext);
  const [localCode, setLocalCode] = useState(code);

  const handlePhaseClick = (phaseId: string) => {
    navigate(`/${phaseId}`);
  };

  const handleCodeChange = (newCode: string) => {
    setLocalCode(newCode);
    setCode(newCode);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
            Compiler Visualizer
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-300">
            Explore how your code is processed through different compiler phases
          </p>
        </div>
        
        <div className="mb-12">
          <CodeInput onCodeChange={handleCodeChange} initialCode={code} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COMPILER_PHASES.map((phase) => {
            const Icon = iconComponents[phase.icon] || FiCode;
            return (
              <div
                key={phase.id}
                onClick={() => navigate(`/${phase.id}`)}
                className={`${phase.color} rounded-xl p-6 text-white cursor-pointer transform transition-transform hover:scale-105 shadow-lg hover:shadow-xl`}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{phase.title}</h2>
                    <p className="text-white text-opacity-90">{phase.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
