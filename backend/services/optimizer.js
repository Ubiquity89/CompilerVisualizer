/**
 * Simple optimizer placeholder: constant folding of numeric binary ops in TAC strings
 * This takes TAC lines like "a = 2 + 3" and folds to "a = 5" if present.
 * For our simple TAC format this will be a naive string-based pass.
 */

function constantFold(tac) {
  // Track variable values across the TAC
  const variableValues = {};
  // Track function return values
  const functionReturns = {};
  // Track current function context
  let currentFunction = null;
  
  return tac.map(line => {
    // Handle function labels
    if (line.endsWith(':')) {
      currentFunction = line.slice(0, -1); // Remove ':' to get function name
      return line;
    }
    
    // Remove trailing semicolon for processing
    const cleanLine = line.replace(/;$/, '');
    
    // Handle return statements
    if (cleanLine.startsWith('return')) {
      const returnMatch = cleanLine.match(/^return\s+(.+)$/);
      if (returnMatch) {
        const returnValue = returnMatch[1];
        
        // First evaluate any variables in the return expression
        let evaluatedExpr = returnValue;
        for (const [varName, value] of Object.entries(variableValues)) {
          evaluatedExpr = evaluatedExpr.replace(new RegExp(`\\b${varName}\\b`, 'g'), value);
        }
        
        // Try to fold the return expression
        const folded = evaluateExpression(evaluatedExpr);
        if (folded !== null) {
          // Store the return value for this function
          if (currentFunction) {
            functionReturns[currentFunction] = folded;
          }
          return `return ${folded};`;
        } else {
          // Store the return value as-is
          if (currentFunction) {
            functionReturns[currentFunction] = evaluatedExpr;
          }
        }
      }
      return line;
    }
    
    // Handle function calls
    if (cleanLine.includes('call')) {
      const callMatch = cleanLine.match(/^(\w+)\s*=\s*call\s+(\w+)$/);
      if (callMatch) {
        const [_, varName, funcName] = callMatch;
        // If we know the return value of the function, use it
        if (functionReturns[funcName]) {
          variableValues[varName] = functionReturns[funcName];
          return `${varName} = ${functionReturns[funcName]};`;
        }
      }
      return line;
    }
    
    // Match variable assignments: "var = expr"
    const match = cleanLine.match(/^(\w+)\s*=\s*(.+)$/);
    if (match) {
      const [_, varName, expr] = match;
      
      // First evaluate any variables in the expression
      let evaluatedExpr = expr;
      for (const [varName, value] of Object.entries(variableValues)) {
        evaluatedExpr = evaluatedExpr.replace(new RegExp(`\\b${varName}\\b`, 'g'), value);
      }
      
      // Try to fold the expression
      const folded = evaluateExpression(evaluatedExpr);
      if (folded !== null) {
        // Store the folded value for future references
        variableValues[varName] = folded;
        return `${varName} = ${folded};`;
      } else {
        // Store the expression as-is
        variableValues[varName] = expr;
        return line;
      }
    }
    
    return line;
  });
}

function evaluateExpression(expr) {
  // Handle simple constant expressions: "a + b", "x * y", etc.
  const match = expr.match(/^(\d+)\s*([\+\-\*\/])\s*(\d+)$/);
  if (match) {
    const [_, a, op, b] = match;
    return operate(parseInt(a), parseInt(b), op);
  }
  
  // Handle parentheses: "(a + b)" -> evaluate inner
  const parenMatch = expr.match(/^\((\d+)\s*([\+\-\*\/])\s*(\d+)\)$/);
  if (parenMatch) {
    const [_, a, op, b] = parenMatch;
    return operate(parseInt(a), parseInt(b), op);
  }
  
  // Handle chained operations: "a + b + c"
  const chainMatch = expr.match(/^(\d+)\s*([\+\-\*\/])\s*(\d+)\s*([\+\-\*\/])\s*(\d+)$/);
  if (chainMatch) {
    const [_, a, op1, b, op2, c] = chainMatch;
    const temp = operate(parseInt(a), parseInt(b), op1);
    return operate(temp, parseInt(c), op2);
  }
  
  // If it's just a single constant, return as-is
  if (/^\d+$/.test(expr)) {
    return expr;
  }
  
  // Not a constant expression, return null to indicate no folding
  return null;
}

function operate(a, b, op) {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return Math.floor(a / b);
    default: return null;
  }
}

module.exports = { constantFold };
