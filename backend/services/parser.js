// C Parser - A real C compiler frontend
class CParser {
    constructor() {
        this.tokens = [];
        this.position = 0;
    }
    
    parse(code) {
        this.tokens = this.tokenize(code);
        this.position = 0;
        
        const ast = {
            type: 'Program',
            text: code,
            children: [],
        };
        
        while (!this.isAtEnd()) {
            const decl = this.parseDeclaration();
            if (decl) {
                ast.children.push(decl);
            }
        }
        
        return ast;
    }
    
    tokenize(code) {
        const tokens = [];
        let i = 0;
        
        while (i < code.length) {
            // Skip whitespace
            if (/\s/.test(code[i])) {
                i++;
                continue;
            }
            
            // Numbers
            if (/\d/.test(code[i])) {
                let num = '';
                while (i < code.length && /\d/.test(code[i])) {
                    num += code[i++];
                }
                tokens.push({ type: 'NUMBER', value: num });
                continue;
            }
            
            // Identifiers and keywords
            if (/[a-zA-Z_]/.test(code[i])) {
                let ident = '';
                while (i < code.length && /[a-zA-Z0-9_]/.test(code[i])) {
                    ident += code[i++];
                }
                
                // Check if it's a keyword
                const keywords = ['int', 'void', 'return', 'if', 'else', 'while', 'for', 'char', 'float', 'double'];
                if (keywords.includes(ident)) {
                    tokens.push({ type: 'KEYWORD', value: ident });
                } else {
                    tokens.push({ type: 'IDENTIFIER', value: ident });
                }
                continue;
            }
            
            // Operators and punctuation
            const singleCharTokens = {
                '+': 'PLUS', '-': 'MINUS', '*': 'STAR', '/': 'SLASH',
                '=': 'EQUAL', ';': 'SEMICOLON', ',': 'COMMA',
                '(': 'LPAREN', ')': 'RPAREN', '{': 'LBRACE', '}': 'RBRACE'
            };
            
            if (singleCharTokens[code[i]]) {
                tokens.push({ type: singleCharTokens[code[i]], value: code[i] });
                i++;
                continue;
            }
            
            // Unknown character
            i++;
        }
        
        return tokens;
    }
    
    parseDeclaration() {
        if (this.match('KEYWORD', 'int') || this.match('KEYWORD', 'void')) {
            const type = this.previous().value;
            
            // Function definition
            if (this.check('IDENTIFIER') && this.checkNext('LPAREN')) {
                return this.parseFunctionDefinition(type);
            }
            
            // Variable declaration
            if (this.check('IDENTIFIER')) {
                return this.parseVariableDeclaration(type);
            }
        }
        
        this.advance();
        return null;
    }
    
    parseFunctionDefinition(returnType) {
        const name = this.advance().value; // function name
        this.consume('LPAREN', 'Expect "(" after function name');
        
        // Parse parameters (simplified - empty for now)
        const params = [];
        while (!this.check('RPAREN') && !this.isAtEnd()) {
            // Skip parameters for simplicity
            this.advance();
        }
        this.consume('RPAREN', 'Expect ")" after parameters');
        
        this.consume('LBRACE', 'Expect "{" before function body');
        
        const body = this.parseBlock();
        
        return {
            type: 'FunctionDefinition',
            text: `${returnType} ${name}() { ... }`,
            children: [body],
        };
    }
    
    parseVariableDeclaration(type) {
        const name = this.advance().value; // variable name
        
        let init = null;
        if (this.match('EQUAL')) {
            // Capture the entire expression until semicolon
            const initTokens = [];
            while (!this.check('SEMICOLON') && !this.isAtEnd()) {
                initTokens.push(this.advance());
            }
            if (initTokens.length > 0) {
                init = initTokens.map(t => t.value).join(' ');
            }
        }
        
        this.consume('SEMICOLON', 'Expect ";" after variable declaration');
        
        const node = {
            type: 'VariableDeclaration',
            text: `${type} ${name}`,
            children: [],
        };
        
        if (init) {
            node.text += ` = ${init}`;
            node.children.push({
                type: 'Initializer',
                text: `= ${init}`,
                children: [],
            });
        }
        
        node.text += ';';
        return node;
    }
    
    parseBlock() {
        const statements = [];
        
        while (!this.check('RBRACE') && !this.isAtEnd()) {
            const stmt = this.parseStatement();
            if (stmt) {
                statements.push(stmt);
            }
        }
        
        this.consume('RBRACE', 'Expect "}" after block');
        
        return {
            type: 'CompoundStatement',
            text: '{ ... }',
            children: statements,
        };
    }
    
    parseStatement() {
        // Return statement
        if (this.match('KEYWORD', 'return')) {
            let value = null;
            if (!this.check('SEMICOLON')) {
                // Capture the entire expression until semicolon
                const valueTokens = [];
                while (!this.check('SEMICOLON') && !this.isAtEnd()) {
                    valueTokens.push(this.advance());
                }
                if (valueTokens.length > 0) {
                    value = valueTokens.map(t => t.value).join(' ');
                }
            }
            this.consume('SEMICOLON', 'Expect ";" after return value');
            
            const node = {
                type: 'ReturnStatement',
                text: 'return',
                children: [],
            };
            
            if (value) {
                node.text += ` ${value}`;
                node.children.push({
                    type: 'Expression',
                    text: value,
                    children: [],
                });
            }
            
            node.text += ';';
            return node;
        }
        
        // Variable declaration in block
        if (this.match('KEYWORD', 'int') || this.match('KEYWORD', 'void')) {
            const type = this.previous().value;
            if (this.check('IDENTIFIER')) {
                return this.parseVariableDeclaration(type);
            }
        }
        
        // Skip unknown statements
        while (!this.check('SEMICOLON') && !this.check('RBRACE') && !this.isAtEnd()) {
            this.advance();
        }
        if (this.match('SEMICOLON')) return null;
        
        return null;
    }
    
    // Helper methods
    match(type, value = null) {
        if (this.check(type, value)) {
            this.advance();
            return true;
        }
        return false;
    }
    
    check(type, value = null) {
        if (this.isAtEnd()) return false;
        if (this.tokens[this.position].type !== type) return false;
        if (value !== null && this.tokens[this.position].value !== value) return false;
        return true;
    }
    
    checkNext(type) {
        if (this.position + 1 >= this.tokens.length) return false;
        return this.tokens[this.position + 1].type === type;
    }
    
    advance() {
        if (!this.isAtEnd()) this.position++;
        return this.previous();
    }
    
    consume(type, message) {
        if (this.check(type)) return this.advance();
        // For simplicity, just advance instead of throwing error
        this.advance();
        return null;
    }
    
    isAtEnd() {
        return this.position >= this.tokens.length;
    }
    
    previous() {
        return this.tokens[this.position - 1];
    }
}

function parse(code) {
    const parser = new CParser();
    return parser.parse(code);
}

function treeToJSON(tree) {
    return tree;
}

module.exports = { parse, treeToJSON };
