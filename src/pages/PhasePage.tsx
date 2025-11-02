// src/pages/PhasePage.tsx
import React, { useContext, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CompilerPhase, Token, ParseTreeNode, SymbolTableEntry, ThreeAddressCode, OptimizationExample, AssemblyCode } from '../types/compiler';
import { COMPILER_PHASES } from '../data/compilerPhases';
import { FiArrowLeft } from 'react-icons/fi';
import { CodeContext } from '../App';
import {
  SAMPLE_TOKENS,
  SAMPLE_PARSE_TREE,
  SAMPLE_SYMBOL_TABLE,
  SAMPLE_TAC,
  SAMPLE_OPTIMIZATION,
  SAMPLE_ASSEMBLY
} from '../data/sampleData';
import {
  generateTokens as importedGenerateTokens,
  generateParseTree as importedGenerateParseTree,
  generateSymbolTable as importedGenerateSymbolTable,
  generateThreeAddressCode as importedGenerateThreeAddressCode,
  generateOptimization as importedGenerateOptimization,
  generateAssembly as importedGenerateAssembly
} from '../utils/codeGenerators';

// Parse tree rendering helper
const renderParseTree = (node: ParseTreeNode, level = 0): React.ReactElement => {
  if (!node) return <div>No parse tree available</div>;
  
  return (
    <div className="ml-6 my-1" key={node.type + level}>
      <div className="flex items-center">
        <div className="w-2 h-0.5 bg-gray-400 mr-2"></div>
        <span className="font-mono text-sm font-semibold text-purple-600 dark:text-purple-400">
          {node.type}
        </span>
        {node.value && (
          <span className="ml-2 text-gray-700 dark:text-gray-300">
            {node.value}
          </span>
        )}
      </div>
      {node.children?.map((child, index) => (
        <React.Fragment key={index}>
          {renderParseTree(child, level + 1)}
        </React.Fragment>
      ))}
    </div>
  );
};

const PhasePage: React.FC = () => {
  const { phaseId } = useParams<{ phaseId: string }>();
  const navigate = useNavigate();
  const { code } = useContext(CodeContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the current phase details
  const currentPhase = COMPILER_PHASES.find(phase => phase.id === phaseId);
  
  // Generate phase-specific content
  // In PhasePage.tsx, update the switch statement in the useMemo hook:

const phaseContent = useMemo(() => {
  if (!phaseId) return null;
  
  try {
    switch (phaseId) {
      case 'lexical-analysis':  // Changed from 'lexical'
        const tokens = importedGenerateTokens(code);
        return tokens.length > 0 ? tokens : SAMPLE_TOKENS;
        
      case 'syntax-analysis':  // Changed from 'syntax'
        const parseTree = importedGenerateParseTree(code);
        return parseTree?.children?.length ? parseTree : SAMPLE_PARSE_TREE;
        
      case 'semantic-analysis':  // Changed from 'semantic'
        const symbolTable = importedGenerateSymbolTable(code);
        return symbolTable.length > 0 ? symbolTable : SAMPLE_SYMBOL_TABLE;
        
      case 'intermediate-code':  // Changed from 'intermediate'
        const tac = importedGenerateThreeAddressCode(code);
        return tac.length > 0 ? tac : SAMPLE_TAC;
        
      case 'optimization':
        const optimization = importedGenerateOptimization(code);
        return optimization || SAMPLE_OPTIMIZATION;
        
      case 'code-generation':  // Changed from 'codegen'
        const assembly = importedGenerateAssembly(code);
        return assembly.length > 0 ? assembly : SAMPLE_ASSEMBLY;
        
      default:
        return null;
    }
  } catch (err) {
    console.error(`Error generating ${phaseId} content:`, err);
    setError(`Error generating ${currentPhase?.title} content`);
    return null;
  }
}, [code, phaseId, currentPhase]);

  // Render content based on phase
  const renderPhaseContent = () => {
    if (isLoading) {
      return <div className="text-center py-8">Loading...</div>;
    }

    if (error) {
      return <div className="text-red-500 p-4">{error}</div>;
    }

    if (!phaseContent) {
      return <div className="text-gray-500 p-4">No content available</div>;
    }

     switch (phaseId) {
    case 'lexical-analysis':  // Changed from 'lexical'
      const tokens = phaseContent as Token[];
      return (
        <div className="space-y-2">
          {tokens.map((token, index) => (
            <div key={index} className="p-2 border-b border-gray-200 dark:border-gray-700">
              <span className="font-mono">{token.value}</span>
              <span className="ml-4 text-sm text-gray-500">
                ({token.type}, line: {token.line}, col: {token.column})
              </span>
            </div>
          ))}
        </div>
      );

      case 'syntax-analysis':
        const parseTree = phaseContent as ParseTreeNode;
        return (
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
            {parseTree ? renderParseTree(parseTree) : 'No parse tree available'}
          </div>
        );

      case 'semantic-analysis':
        const symbols = phaseContent as SymbolTableEntry[];
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Scope</th>
                  <th className="px-4 py-2 text-left">Line</th>
                  <th className="px-4 py-2 text-left">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {symbols.map((symbol, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">{symbol.name}</td>
                    <td className="px-4 py-2">{symbol.type}</td>
                    <td className="px-4 py-2">{symbol.scope}</td>
                    <td className="px-4 py-2">{symbol.line}</td>
                    <td className="px-4 py-2">{symbol.value || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'intermediate-code':
        const tac = phaseContent as ThreeAddressCode[];
        return (
          <div className="space-y-2">
            {tac.map((instr, index) => (
              <div key={index} className="p-2 font-mono bg-gray-50 dark:bg-gray-800 rounded">
                {instr.result} = {instr.arg1}{instr.op === '=' ? '' : ` ${instr.op} ${instr.arg2}`}
              </div>
            ))}
          </div>
        );

      case 'optimization':
        const optimization = phaseContent as OptimizationExample;
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Original Code:</h3>
              <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
                {optimization.original}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2">Optimized Code:</h3>
              <pre className="p-4 bg-green-50 dark:bg-green-900 rounded">
                {optimization.optimized}
              </pre>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium">Optimization Applied:</p>
              <p>{optimization.explanation}</p>
            </div>
          </div>
        );

      case 'code-generation':
        const assembly = phaseContent as AssemblyCode[];
        return (
          <div className="font-mono text-sm space-y-2">
            {assembly.map((line, index) => (
              <div key={index} className="flex">
                {line.address !== undefined && (
                  <span className="w-16 text-gray-500">{line.address.toString(16).toUpperCase().padStart(4, '0')}:</span>
                )}
                <div className="flex-1">
                  <span className="text-blue-600 dark:text-blue-400">{line.opcode}</span>
                  {line.operands && (
                    <span> {line.operands}</span>
                  )}
                  {line.comment && (
                    <span className="ml-4 text-gray-500">; {line.comment}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return <div>No content available for this phase</div>;
    }
  };

  if (!currentPhase) {
    return (
      <div className="p-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 dark:text-blue-400 mb-4"
        >
          <FiArrowLeft className="mr-2" /> Back
        </button>
        <div className="text-red-500">Phase not found</div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 dark:text-blue-400 hover:underline mr-4"
        >
          <FiArrowLeft className="mr-2" /> Back
        </button>
        <h1 className="text-2xl font-bold">{currentPhase.title}</h1>
      </div>
      
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
        <p className="text-blue-800 dark:text-blue-200">{currentPhase.description}</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {renderPhaseContent()}
      </div>
    </div>
  );
};

export default PhasePage;