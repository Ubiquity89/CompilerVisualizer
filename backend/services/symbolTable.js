function buildSymbolTable(tree) {
    const symbols = [];
    
    function walk(node, scope = "global") {
        if (!node) return;
        
        // Add function to symbol table
        if (node.type === "FunctionDefinition") {
            // Extract function name from text
            const match = node.text.match(/(\w+)\s*\(/);
            const funcName = match ? match[1] : "<anon>";
            
            symbols.push({ 
                name: funcName, 
                type: "function", 
                scope: "global"
            });
            
            // Enter function scope for nested symbols
            if (node.children && node.children.length > 0) {
                node.children.forEach(child => {
                    walk(child, funcName);
                });
            }
            return;
        }
        
        // Add variable to symbol table
        if (node.type === "VariableDeclaration") {
            // Extract variable name and type from text
            const match = node.text.match(/(\w+)\s+(\w+)/);
            if (match) {
                const varType = match[1];
                const varName = match[2];
                
                symbols.push({ 
                    name: varName, 
                    type: varType, 
                    scope: scope
                });
            }
        }
        
        // Recursively walk children
        if (node.children) {
            node.children.forEach(child => {
                walk(child, scope);
            });
        }
    }
    
    walk(tree);
    return symbols;
}

module.exports = { buildSymbolTable };
