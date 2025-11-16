import { Token, ParseTreeNode, SymbolTableEntry, ThreeAddressCode, OptimizationExample, AssemblyCode } from '../types/compiler';

export const SAMPLE_TOKENS: Token[] = [
  { type: 'keyword', value: 'int', line: 1, column: 1 },
  { type: 'identifier', value: 'a', line: 1, column: 5 },
  { type: 'operator', value: '=', line: 1, column: 7 },
  { type: 'number', value: '5', line: 1, column: 9 },
  { type: 'operator', value: '+', line: 1, column: 11 },
  { type: 'number', value: '2', line: 1, column: 13 },
  { type: 'delimiter', value: ';', line: 1, column: 14 },
];

export const SAMPLE_PARSE_TREE: ParseTreeNode = {
  type: 'Program',
  children: [
    {
      type: 'VariableDeclaration',
      children: [
        { type: 'Type', value: 'int' },
        { type: 'Identifier', value: 'a' },
        {
          type: 'BinaryExpression',
          operator: '+',
          children: [
            { type: 'NumberLiteral', value: '5' },
            { type: 'NumberLiteral', value: '2' }
          ]
        }
      ]
    }
  ]
};

export const SAMPLE_SYMBOL_TABLE: SymbolTableEntry[] = [
  { name: 'a', type: 'int', scope: 'global', line: 1, value: '7' }
];

export const SAMPLE_TAC: ThreeAddressCode[] = [
  { op: '=', arg1: '5', arg2: '2', result: 't1', opType: '+' },
  { op: '=', arg1: 't1', result: 'a' }
];

export const SAMPLE_OPTIMIZATION: OptimizationExample = {
  original: 't1 = 5 + 2\na = t1',
  optimized: 'a = 7',
  explanation: 'Constant folding: 5 + 2 can be computed at compile time',
  description: 'Constant Folding'
};

export const SAMPLE_ASSEMBLY: AssemblyCode[] = [
  { address: 0, opcode: 'LOADI', operands: 'R1, #5', comment: 'Load immediate 5 into R1' },
  { address: 4, opcode: 'LOADI', operands: 'R2, #2', comment: 'Load immediate 2 into R2' },
  { address: 8, opcode: 'ADD', operands: 'R3, R1, R2', comment: 'R3 = R1 + R2' },
  { address: 12, opcode: 'STORE', operands: 'R3, [a]', comment: 'Store result in a' }
];
