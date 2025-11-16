/**
 * Pseudo assembly generator: convert simple TAC to a few pseudo x86 lines.
 * This is for visualization only.
 */

function generateAssembly(tac) {
  const asm = [];
  for (const line of tac) {
    // function label
    if (/^[A-Za-z_]\w*:$/.test(line)) {
      asm.push(`${line}    ; function label`);
      continue;
    }
    // function return label like "main: return"
    if (/: return$/.test(line)) {
      asm.push("  ret");
      continue;
    }
    // match function-scoped assignments: "func: x = 5"
    const mfunc = line.match(/^([A-Za-z_]\w*):\s*([A-Za-z_]\w*)\s*=\s*(.+)$/);
    if (mfunc) {
      const [, func, name, val] = mfunc;
      asm.push(`  ; in ${func}`);
      asm.push(`  mov DWORD PTR [${name}], ${val}`);
      continue;
    }
    // match global assignments: "x = 10"
    const mg = line.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);
    if (mg) {
      const [, name, val] = mg;
      asm.push(`mov DWORD PTR [${name}], ${val}`);
      continue;
    }
    // fallback
    asm.push(`; ${line}`);
  }
  return asm;
}

module.exports = { generateAssembly };
