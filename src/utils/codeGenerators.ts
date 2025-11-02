// src/utils/codeGenerators.ts
import { Token, ParseTreeNode, SymbolTableEntry, ThreeAddressCode, OptimizationExample, AssemblyCode } from '../types/compiler';

// Token generation
export function generateTokens(code: string): Token[] {
  const tokens: Token[] = [];
  const lines = code.split('\n');
  let lineNumber = 1;

  for (const line of lines) {
    const tokenPatterns = [
      { type: 'keyword', pattern: /\b(int|float|double|char|void|if|else|for|while|do|return)\b/ },
      { type: 'identifier', pattern: /[a-zA-Z_]\w*/ },
      { type: 'number', pattern: /\d+(\.\d+)?/ },
      { type: 'operator', pattern: /[+\-*/=<>!&|^%]|\+\+|--|==|!=|<=|>=|&&|\|\|/ },
      { type: 'delimiter', pattern: /[;,\{\}\(\)\[\]]/ },
      { type: 'whitespace', pattern: /\s+/ },
      { type: 'unknown', pattern: /.?/ },
    ];

    let position = 0;
    while (position < line.length) {
      const remainingLine = line.substring(position);
      let matched = false;

      for (const { type, pattern } of tokenPatterns) {
        const match = remainingLine.match(new RegExp(`^${pattern.source}`, pattern.flags));
        if (match && match[0]) {
          const value = match[0];
          if (type !== 'whitespace') {
            tokens.push({
              type,
              value,
              line: lineNumber,
              column: position + 1
            });
          }
          position += value.length;
          matched = true;
          break;
        }
      }

      if (!matched) position++;
    }
    lineNumber++;
  }

  return tokens;
}

// Parse tree generation
// In codeGenerators.ts
export function generateParseTree(code: string): ParseTreeNode {
  const tokens = generateTokens(code);
  const root: ParseTreeNode = { 
    type: 'Program', 
    children: [] 
  };
  
  let currentIndex = 0;

  const parseExpression = (): ParseTreeNode => {
    if (currentIndex >= tokens.length) {
      return { type: 'EmptyExpression' };
    }

    const token = tokens[currentIndex];
    
    if (token.type === 'number') {
      currentIndex++;
      return { 
        type: 'NumberLiteral', 
        value: token.value 
      };
    }
    
    if (token.type === 'identifier') {
      currentIndex++;
      return { 
        type: 'Identifier', 
        value: token.value 
      };
    }
    
    if (token.value === '(') {
      currentIndex++; // Skip '('
      const expr = parseExpression();
      if (tokens[currentIndex]?.value === ')') {
        currentIndex++; // Skip ')'
      }
      return expr;
    }
    
    return { type: 'UnknownExpression' };
  };

  const parseBinaryExpression = (precedence = 0): ParseTreeNode => {
    let left = parseExpression();
    
    while (currentIndex < tokens.length) {
      const token = tokens[currentIndex];
      
      if (token.type !== 'operator' || !['+', '-', '*', '/'].includes(token.value)) {
        break;
      }
      
      const opPrecedence = ['+', '-'].includes(token.value) ? 1 : 2;
      if (opPrecedence <= precedence) break;
      
      currentIndex++;
      const right = parseBinaryExpression(opPrecedence);
      
      left = {
        type: 'BinaryExpression',
        operator: token.value,
        children: [left, right]
      };
    }
    
    return left;
  };

  const parseStatement = (): ParseTreeNode | null => {
    if (currentIndex >= tokens.length) return null;
    
    const token = tokens[currentIndex];
    
    // Handle variable declaration
    if (token.type === 'keyword' && token.value === 'int' && currentIndex + 1 < tokens.length) {
      const typeNode: ParseTreeNode = {
        type: 'Type',
        value: token.value
      };
      
      currentIndex++; // Skip 'int'
      
      if (tokens[currentIndex]?.type === 'identifier') {
        const idNode: ParseTreeNode = {
          type: 'Identifier',
          value: tokens[currentIndex].value
        };
        
        currentIndex++; // Skip identifier
        
        // Handle assignment
        if (tokens[currentIndex]?.value === '=') {
          currentIndex++; // Skip '='
          const expr = parseBinaryExpression();
          
          return {
            type: 'VariableDeclaration',
            children: [typeNode, idNode, expr]
          };
        }
        
        // Simple declaration without assignment
        return {
          type: 'VariableDeclaration',
          children: [typeNode, idNode]
        };
      }
    }
    
    // Handle expression statements
    const expr = parseBinaryExpression();
    if (tokens[currentIndex]?.value === ';') {
      currentIndex++; // Skip ';'
    }
    return {
      type: 'ExpressionStatement',
      children: [expr]
    };
  };

  // Parse all statements
  while (currentIndex < tokens.length) {
    const stmt = parseStatement();
    if (stmt) {
      root.children?.push(stmt);
    } else {
      currentIndex++; // Skip any unrecognized tokens
    }
  }

  return root;
}

// Symbol table generation
export function generateSymbolTable(code: string): SymbolTableEntry[] {
  const tokens = generateTokens(code);
  const symbolTable: SymbolTableEntry[] = [];
  let currentType = 'int'; // Default type

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === 'keyword' && ['int', 'float', 'char', 'double'].includes(token.value)) {
      currentType = token.value;
      // Look for identifier after type
      if (i + 1 < tokens.length && tokens[i + 1].type === 'identifier') {
        symbolTable.push({
          name: tokens[i + 1].value,
          type: currentType,
          scope: 'global',
          line: token.line,
          value: '0' // Default value
        });
      }
    }
  }

  return symbolTable;
}

// Three-address code generation
export function generateThreeAddressCode(code: string): ThreeAddressCode[] {
  const tac: ThreeAddressCode[] = [];
  const lines = code.split('\n').filter(line => line.trim() !== '');

  for (const line of lines) {
    if (line.includes('=')) {
      const [left, right] = line.split('=').map(s => s.trim());
      
      if (right.includes('+')) {
        const [op1, op2] = right.split('+').map(s => s.trim());
        const tempVar = `t${tac.length + 1}`;
        
        tac.push({
          op: '+',
          arg1: op1,
          arg2: op2,
          result: tempVar,
          opType: 'arithmetic'
        });

        tac.push({
          op: '=',
          arg1: tempVar,
          result: left.replace('int', '').trim(),
          opType: 'assign'
        });
      } else {
        tac.push({
          op: '=',
          arg1: right,
          result: left.replace('int', '').trim(),
          opType: 'assign'
        });
      }
    }
  }

  return tac;
}

// Optimization
export function generateOptimization(code: string): OptimizationExample {
  const tac = generateThreeAddressCode(code);
  let original = tac.map(instr => 
    `${instr.result} = ${instr.arg1}${instr.arg2 ? ` ${instr.op} ${instr.arg2}` : ''}`
  ).join('\n');

  // Simple constant folding optimization
  if (tac.length >= 2 && 
      tac[0].op === '+' && 
      !isNaN(Number(tac[0].arg1)) && 
      !isNaN(Number(tac[0].arg2)) &&
      tac[1].op === '=') {
    
    const result = String(Number(tac[0].arg1) + Number(tac[0].arg2));
    return {
      original: original,
      optimized: `${tac[1].result} = ${result}`,
      explanation: 'Constant folding: arithmetic operation computed at compile time',
      description: 'Constant Folding'
    };
  }

  return {
    original: original,
    optimized: original,
    explanation: 'No optimizations could be applied',
    description: 'No optimizations'
  };
}

// Assembly generation (updated)
export function generateAssembly(code: string): AssemblyCode[] {
  const assembly: AssemblyCode[] = [
    {
      opcode: 'section',
      operands: '.text',
      comment: 'Start of code section',
      toString() { 
        return `${this.opcode} ${this.operands}${this.comment ? `  ; ${this.comment}` : ''}`; 
      }
    },
    {
      opcode: 'global',
      operands: '_start',
      toString() { 
        return `${this.opcode} ${this.operands}`; 
      }
    },
    {
      opcode: '_start:',
      comment: 'Entry point',
      toString() { 
        return `${this.opcode}${this.comment ? `  ; ${this.comment}` : ''}`; 
      }
    }
  ];

  const tac = generateThreeAddressCode(code);
  
  for (const instr of tac) {
    switch (instr.op) {
      case '=':
        assembly.push({
          opcode: 'MOV',
          operands: `[${instr.result}], ${instr.arg1}`,
          comment: `Store ${instr.arg1} in ${instr.result}`,
          toString() {
            return `    ${this.opcode} ${this.operands}${this.comment ? `  ; ${this.comment}` : ''}`;
          }
        });
        break;
        
      case '+':
        assembly.push(
          {
            opcode: 'MOV',
            operands: `EAX, [${instr.arg1}]`,
            comment: `Load ${instr.arg1} into EAX`,
            toString() {
              return `    ${this.opcode} ${this.operands}${this.comment ? `  ; ${this.comment}` : ''}`;
            }
          },
          {
            opcode: 'ADD',
            operands: `EAX, [${instr.arg2}]`,
            comment: `Add ${instr.arg2} to EAX`,
            toString() {
              return `    ${this.opcode} ${this.operands}${this.comment ? `  ; ${this.comment}` : ''}`;
            }
          },
          {
            opcode: 'MOV',
            operands: `[${instr.result}], EAX`,
            comment: `Store result in ${instr.result}`,
            toString() {
              return `    ${this.opcode} ${this.operands}${this.comment ? `  ; ${this.comment}` : ''}`;
            }
          }
        );
        break;
        
      // Add more operations as needed
    }
  }

  // Add exit sequence
  assembly.push(
    {
      opcode: 'MOV',
      operands: 'EBX, 0',
      comment: 'Exit code 0',
      toString() { 
        return `    ${this.opcode} ${this.operands}${this.comment ? `  ; ${this.comment}` : ''}`; 
      }
    },
    {
      opcode: 'MOV',
      operands: 'EAX, 1',
      comment: 'sys_exit system call',
      toString() { 
        return `    ${this.opcode} ${this.operands}${this.comment ? `  ; ${this.comment}` : ''}`; 
      }
    },
    {
      opcode: 'INT',
      operands: '0x80',
      comment: 'Call kernel',
      toString() { 
        return `    ${this.opcode} ${this.operands}${this.comment ? `  ; ${this.comment}` : ''}`; 
      }
    }
  );

  return assembly;
}