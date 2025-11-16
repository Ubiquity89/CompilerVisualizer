const express = require("express");
const router = express.Router();

const parserService = require("../services/parser");
const tokenizer = require("../services/tokenizer");
const symbolTable = require("../services/symbolTable");
const tacGen = require("../services/tacGenerator");
const optimizer = require("../services/optimizer");
const asmGen = require("../services/assemblyGenerator");

/**
 * Expect body: { code: "<C code string>" }
 */

/* Preprocess (pass-through for now) */
router.post("/preprocess", (req, res) => {
  const { code = "" } = req.body;
  // Placeholder: real preprocessing would run cpp; here we just return code.
  res.json({ preprocessedCode: code });
});

/* Tokenize */
router.post("/tokenize", (req, res) => {
  const { code = "" } = req.body;
  const tokens = tokenizer.tokenize(code);
  res.json({ tokens });
});

/* Parse */
router.post("/parse", async (req, res) => {
  const { code = "" } = req.body;
  try {
    const tree = parserService.parse(code);
    const json = parserService.treeToJSON(tree);
    res.json({ ast: json });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Semantic analysis (symbol table & scopes) */
router.post("/semantic", (req, res) => {
  const { code = "" } = req.body;
  try {
    const tree = parserService.parse(code);
    const symbols = symbolTable.buildSymbolTable(tree);
    res.json({ symbolTable: symbols });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* TAC generation */
router.post("/tac", (req, res) => {
  const { code = "" } = req.body;
  try {
    const tree = parserService.parse(code);
    const tac = tacGen.generateTAC(tree);
    res.json({ tac });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Optimization (simple placeholder) */
router.post("/optimize", (req, res) => {
  const { tac = [] , code = "" } = req.body;
  // Either accept TAC in body or regenerate from code
  try {
    const tacToOptimize = tac.length ? tac : tacGen.generateTAC(parserService.parse(code));
    const optimized = optimizer.constantFold(tacToOptimize);
    res.json({ optimizedTAC: optimized });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Assembly generation (pseudo) */
router.post("/assembly", (req, res) => {
  const { code = "" } = req.body;
  try {
    const tree = parserService.parse(code);
    const tac = tacGen.generateTAC(tree);
    const asm = asmGen.generateAssembly(tac);
    res.json({ assembly: asm });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Aggregate analyze endpoint for frontend compatibility */
router.post("/analyze", async (req, res) => {
  const { code = "" } = req.body;
  try {
    const tree = parserService.parse(code);
    const json = parserService.treeToJSON(tree);
    const tokens = tokenizer.tokenize(code);
    const symbols = symbolTable.buildSymbolTable(tree);
    const tac = tacGen.generateTAC(tree);
    const optimized = optimizer.constantFold(tac);
    const asm = asmGen.generateAssembly(tac);
    
    // Transform symbol table into the structure the frontend expects
    const globalVariables = symbols.filter(s => s.scope === 'global' && s.type !== 'function');
    const globalFunctions = symbols.filter(s => s.scope === 'global' && s.type === 'function');
    const localScopes = {};
    
    symbols.forEach(s => {
      if (s.scope !== 'global') {
        if (!localScopes[s.scope]) {
          localScopes[s.scope] = [];
        }
        localScopes[s.scope].push(s);
      }
    });
    
    res.json({
      preprocessedCode: code, // placeholder
      tokens,
      ast: json,
      symbolTable: {
        classes: [],
        methods: globalFunctions,
        variables: globalVariables
      },
      scopes: {
        global: {
          variables: globalVariables,
          functions: globalFunctions
        },
        local: Object.keys(localScopes).map(scopeName => ({
          scope: scopeName,
          variables: localScopes[scopeName]
        }))
      },
      tac,
      optimizedCode: optimized.join('\n'),
      assembly: asm
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
