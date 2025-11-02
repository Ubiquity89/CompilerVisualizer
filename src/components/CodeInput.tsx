import React, { useState, useEffect } from 'react';
import { FiCode } from 'react-icons/fi';

interface CodeInputProps {
  onCodeChange: (code: string) => void;
  initialCode?: string;
}

const CodeInput: React.FC<CodeInputProps> = ({ onCodeChange, initialCode = 'int a = 5 + 2;' }) => {
  const [code, setCode] = useState(initialCode);

  useEffect(() => {
    // Update the parent component when code changes
    const timer = setTimeout(() => {
      onCodeChange(code);
    }, 300); // Small debounce to prevent too many re-renders
    
    return () => clearTimeout(timer);
  }, [code, onCodeChange]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="flex items-center mb-2">
        <FiCode className="text-blue-500 mr-2" size={20} />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Enter Your Code</h2>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <textarea
          value={code}
          onChange={handleChange}
          className="w-full h-48 p-4 text-sm font-mono text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none resize-none"
          placeholder="Enter your code here..."
          spellCheck="false"
        />
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400">
          Tip: Type or paste your code above to see the compilation phases
        </div>
      </div>
    </div>
  );
};

export default CodeInput;
