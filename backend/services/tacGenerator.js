function generateTAC(tree) {
    const instructions = [];
    let tempCounter = 0;
    
    function getTemp() {
        return `t${tempCounter++}`;
    }
    
    function breakExpression(expr, func = null) {
        // Break down complex expressions into temporaries
        // Handle expressions like "x + y + g1" or "a + b"
        const parts = expr.split(/\s*([\+\-\*\/])\s*/);
        
        if (parts.length <= 3) {
            // Simple expression like "a + b" or single value
            return expr;
        }
        
        // Complex expression, break it down
        let result = parts[0]; // First operand
        for (let i = 1; i < parts.length; i += 2) {
            if (i + 1 < parts.length) {
                const op = parts[i];
                const operand = parts[i + 1];
                const temp = getTemp();
                
                instructions.push(`${temp} = ${result} ${op} ${operand}`);
                result = temp;
            }
        }
        
        return result;
    }
    
    function walk(node, func = null) {
        if (!node) return;
        
        if (node.type === "VariableDeclaration") {
            // Extract variable name from the text
            const varMatch = node.text.match(/int\s+(\w+)/);
            if (varMatch) {
                const varName = varMatch[1];
                
                // Look for initializer in children
                let value = "0"; // Default value
                if (node.children && node.children.length > 0) {
                    const initializer = node.children[0];
                    if (initializer.type === "Initializer") {
                        // Extract the full RHS from the original code text
                        const fullText = node.text;
                        const exprMatch = fullText.match(/=\s*(.+)$/);
                        if (exprMatch) {
                            value = exprMatch[1].trim();
                        }
                    }
                }
                
                // Check if this is a function call assignment
                // Handle various space patterns in function calls
                // Check if it contains parentheses after a word
                if (value.match(/^(\w+)\s*\(/)) {
                    const funcName = value.match(/^(\w+)/)[1];
                    instructions.push(`${varName} = call ${funcName}`);
                } else {
                    // Regular expression
                    const finalValue = breakExpression(value, func);
                    instructions.push(`${varName} = ${finalValue}`);
                }
            }
            return;
        }
        
        if (node.type === "FunctionDefinition") {
            // Extract function name from text
            const match = node.text.match(/(\w+)\s*\(/);
            const fname = match ? match[1] : "<anon>";
            
            // function label
            instructions.push(`${fname}:`);
            
            // walk body with func context
            if (node.children && node.children.length > 0) {
                walk(node.children[0], fname);
            }
            
            return;
        }
        
        if (node.type === "FunctionCall") {
            // Handle function calls like "b = add()"
            const callMatch = node.text.match(/(\w+)\s*=\s*(\w+)\s*\(\s*\)/);
            if (callMatch) {
                const [_, varName, funcName] = callMatch;
                
                if (func) {
                    instructions.push(`${func}: ${varName} = call ${funcName}`);
                } else {
                    instructions.push(`${varName} = call ${funcName}`);
                }
            }
            return;
        }
        
        if (node.type === "ReturnStatement") {
            // Extract return value
            const returnMatch = node.text.match(/return\s+(.+);?$/);
            if (returnMatch) {
                const returnValue = returnMatch[1].trim();
                
                // Break down complex return expressions
                const finalValue = breakExpression(returnValue, func);
                
                instructions.push(`return ${finalValue}`);
            } else {
                // Simple return without value
                instructions.push(`return`);
            }
            return;
        }
        
        // Recursively walk children
        if (node.children) {
            node.children.forEach(child => {
                walk(child, func);
            });
        }
    }
    
    walk(tree, null);
    return instructions;
}

module.exports = { generateTAC };
