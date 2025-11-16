/**
 * Very simple tokenizer for small C snippets. Not a production lexer.
 * It classifies keywords, identifiers, numbers, operators, punctuation.
 */

const keywords = new Set(["int", "void", "return", "if", "else", "for", "while", "char", "float", "double"]);

function classify(token) {
  if (/^\d+$/.test(token)) return "NUMBER";
  if (keywords.has(token)) return "KEYWORD";
  if (/^[A-Za-z_]\w*$/.test(token)) return "IDENTIFIER";
  if (/^[+\-*/=<>!]+$/.test(token)) return "OPERATOR";
  if (/^[{}();,]$/.test(token)) return "PUNCTUATION";
  return "UNKNOWN";
}

function tokenize(code) {
  // token regex picks identifiers, numbers, operators, punctuations
  const regex = /[A-Za-z_]\w*|\d+|==|!=|<=|>=|->|[+\-*/=<>]|[{}();,]/g;
  const tokens = [];
  let match;
  let lineStarts = [0];
  // compute line numbers
  for (let i = 0; i < code.length; i++) if (code[i] === "\n") lineStarts.push(i + 1);

  while ((match = regex.exec(code)) !== null) {
    const idx = match.index;
    // line number: count of lineStarts <= idx
    let line = lineStarts.length;
    for (let i = 0; i < lineStarts.length; i++) {
      if (lineStarts[i] > idx) { line = i; break; }
      if (i === lineStarts.length - 1) line = lineStarts.length;
    }
    tokens.push({
      type: classify(match[0]),
      value: match[0],
      index: idx,
      line,
    });
  }
  return tokens;
}

module.exports = { tokenize };
