import { CompilerPhase } from '../types/compiler';
import { FaCode, FaSitemap, FaTable, FaCogs, FaRobot, FaMicrochip } from 'react-icons/fa';

export const COMPILER_PHASES: CompilerPhase[] = [
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

export const getPhaseById = (id: string): CompilerPhase | undefined => {
  return COMPILER_PHASES.find(phase => phase.id === id);
};
