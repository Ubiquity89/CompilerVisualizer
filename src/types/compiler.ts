export type CompilerPhase = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
};

export type Token = {
  type: string;
  value: string;
  line: number;
  column: number;
};

export type ParseTreeNode = {
  type: string;
  value?: string;
  operator?: string;
  children?: ParseTreeNode[];
};

export type SymbolTableEntry = {
  name: string;
  type: string;
  scope: string;
  line: number;
  value?: string;
};

export type ThreeAddressCode = {
  id?: number;
  op: string;
  arg1: string;
  arg2?: string;
  result: string;
  opType?: string;
};

export type OptimizationExample = {
  original: string;
  optimized: string;
  explanation: string;
  description: string;
};

export type AssemblyCode = {
  address?: number;
  opcode: string;
  operands?: string;
  comment?: string;
  toString?: () => string;
};
