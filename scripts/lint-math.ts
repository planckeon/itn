/**
 * Math/Typography Linter for ITN
 * 
 * Neurosymbolic approach: combines symbolic rules with actual KaTeX parsing
 * to catch math rendering issues before deployment.
 * 
 * Only checks files that actually contain educational math content.
 */

import * as fs from "fs";
import * as path from "path";

interface LintError {
  file: string;
  line: number;
  column: number;
  message: string;
  severity: "error" | "warning";
  rule: string;
  suggestion?: string;
}

interface MathExpr {
  raw: string;       // Raw from source (with \\)
  latex: string;     // Unescaped for KaTeX (with \)
  line: number;
  display: boolean;
  context: string;   // Surrounding text for debugging
}

// Files that contain educational math content
const MATH_CONTENT_FILES = [
  "LearnMorePanel.tsx",
  "InfoTooltip.tsx",
];

// Extract math expressions from template literal content strings
function extractMathFromContent(content: string, file: string): MathExpr[] {
  const results: MathExpr[] = [];
  
  // Find content: `...` sections in the file
  const contentRegex = /content:\s*`([^`]+)`/gs;
  let contentMatch;
  
  while ((contentMatch = contentRegex.exec(content)) !== null) {
    const templateContent = contentMatch[1];
    const templateStart = content.slice(0, contentMatch.index).split("\n").length;
    
    // Extract display math $$...$$
    const displayRegex = /\$\$([^$]+)\$\$/g;
    let match;
    while ((match = displayRegex.exec(templateContent)) !== null) {
      const lineOffset = templateContent.slice(0, match.index).split("\n").length - 1;
      results.push({
        raw: match[1],
        latex: match[1].replace(/\\\\/g, "\\"),
        line: templateStart + lineOffset,
        display: true,
        context: match[0].slice(0, 50),
      });
    }
    
    // Extract inline math $...$ (but not $$)
    const withoutDisplay = templateContent.replace(/\$\$[^$]+\$\$/g, "##DISPLAY##");
    const inlineRegex = /\$([^$]+)\$/g;
    while ((match = inlineRegex.exec(withoutDisplay)) !== null) {
      const lineOffset = withoutDisplay.slice(0, match.index).split("\n").length - 1;
      results.push({
        raw: match[1],
        latex: match[1].replace(/\\\\/g, "\\"),
        line: templateStart + lineOffset,
        display: false,
        context: match[0].slice(0, 50),
      });
    }
  }
  
  return results;
}

// Rule: Validate with actual KaTeX
async function checkKatexParsability(mathExprs: MathExpr[], file: string): Promise<LintError[]> {
  const errors: LintError[] = [];
  
  let katex: any;
  try {
    katex = await import("katex");
  } catch {
    console.log("  ⚠️  KaTeX not available for parse checking");
    return errors;
  }
  
  for (const expr of mathExprs) {
    try {
      katex.default.renderToString(expr.latex, {
        displayMode: expr.display,
        throwOnError: true,
        strict: false,  // Be lenient
      });
    } catch (e: any) {
      errors.push({
        file,
        line: expr.line,
        column: 1,
        message: `KaTeX error: ${e.message}`,
        severity: "error",
        rule: "katex-parse-error",
        suggestion: `LaTeX: ${expr.raw.slice(0, 80)}${expr.raw.length > 80 ? "..." : ""}`,
      });
    }
  }
  
  return errors;
}

// Rule: Check for common issues in math expressions
function checkCommonIssues(mathExprs: MathExpr[], file: string): LintError[] {
  const errors: LintError[] = [];
  
  for (const expr of mathExprs) {
    const raw = expr.raw;
    
    // Empty expression
    if (raw.trim() === "") {
      errors.push({
        file,
        line: expr.line,
        column: 1,
        message: "Empty math expression",
        severity: "warning",
        rule: "empty-math",
      });
      continue;
    }
    
    // Degree symbol: should use ° outside math or ^\circ inside
    // Actually ° works fine in text, only flag if mixed with math
    
    // Unbalanced braces
    const openBraces = (raw.match(/\{/g) || []).length;
    const closeBraces = (raw.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push({
        file,
        line: expr.line,
        column: 1,
        message: `Unbalanced braces: ${openBraces} '{' vs ${closeBraces} '}'`,
        severity: "error",
        rule: "unbalanced-braces",
        suggestion: expr.context,
      });
    }
    
    // Missing backslash on common commands (in raw form, should have \\)
    const commands = ["nu", "alpha", "beta", "Delta", "theta", "sin", "cos", "frac", "sqrt", "sum", "int", "text"];
    for (const cmd of commands) {
      // If we see the command with single backslash in raw, it's wrong
      // In raw (source), it should be \\cmd to become \cmd at runtime
      const singlePattern = new RegExp(`(?<!\\\\)\\\\${cmd}\\b`);
      if (singlePattern.test(raw)) {
        errors.push({
          file,
          line: expr.line,
          column: 1,
          message: `Single backslash before ${cmd} - use \\\\${cmd} in source`,
          severity: "error",
          rule: "single-backslash",
          suggestion: `\\\\${cmd}`,
        });
      }
    }
    
    // Check for unescaped special chars
    if (raw.includes("%") && !raw.includes("\\%") && !raw.includes("\\\\%")) {
      errors.push({
        file,
        line: expr.line,
        column: 1,
        message: "Unescaped % in math",
        severity: "warning",
        rule: "unescaped-percent",
        suggestion: "Use \\\\% for percent",
      });
    }
  }
  
  return errors;
}

// Rule: Check for consistency
function checkConsistency(mathExprs: MathExpr[], file: string): LintError[] {
  const errors: LintError[] = [];
  
  // Check that similar expressions use similar notation
  // e.g., if one uses \nu_e and another uses ν_e (Unicode)
  
  const hasLatexNu = mathExprs.some(e => e.raw.includes("\\\\nu"));
  const hasUnicodeNu = mathExprs.some(e => e.raw.includes("ν"));
  
  if (hasLatexNu && hasUnicodeNu) {
    errors.push({
      file,
      line: 1,
      column: 1,
      message: "Inconsistent notation: mixing \\nu (LaTeX) and ν (Unicode)",
      severity: "warning",
      rule: "inconsistent-notation",
      suggestion: "Use \\\\nu consistently in math expressions",
    });
  }
  
  return errors;
}

// Main linting function
async function lintFile(filePath: string): Promise<LintError[]> {
  const fileName = path.basename(filePath);
  
  // Only lint files that contain educational math content
  if (!MATH_CONTENT_FILES.some(f => fileName === f)) {
    return [];
  }
  
  const content = fs.readFileSync(filePath, "utf-8");
  const mathExprs = extractMathFromContent(content, filePath);
  
  if (mathExprs.length === 0) {
    return [];
  }
  
  console.log(`  Found ${mathExprs.length} math expressions`);
  
  const errors: LintError[] = [];
  
  // Run all rules
  errors.push(...checkCommonIssues(mathExprs, filePath));
  errors.push(...checkConsistency(mathExprs, filePath));
  errors.push(...await checkKatexParsability(mathExprs, filePath));
  
  return errors;
}

// Walk directory and collect files
function walkDir(dir: string, files: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
      walkDir(fullPath, files);
    } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  const targetDir = path.join(process.cwd(), "src");
  const files = walkDir(targetDir);
  
  console.log(`\n🔬 ITN Math Linter`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Scanning ${files.length} files for math content files...\n`);
  
  let totalErrors = 0;
  let totalWarnings = 0;
  let filesChecked = 0;
  
  for (const file of files) {
    const errors = await lintFile(file);
    
    if (errors.length > 0 || MATH_CONTENT_FILES.some(f => file.endsWith(f))) {
      if (errors.length > 0 || MATH_CONTENT_FILES.some(f => file.endsWith(f))) {
        filesChecked++;
      }
      
      if (errors.length > 0) {
        const relPath = path.relative(process.cwd(), file);
        console.log(`\n📄 ${relPath}`);
        
        for (const err of errors) {
          const icon = err.severity === "error" ? "❌" : "⚠️";
          console.log(`   ${icon} L${err.line}: [${err.rule}] ${err.message}`);
          if (err.suggestion) {
            console.log(`      💡 ${err.suggestion}`);
          }
          
          if (err.severity === "error") totalErrors++;
          else totalWarnings++;
        }
      }
    }
  }
  
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Checked ${filesChecked} math content files`);
  
  if (totalErrors === 0 && totalWarnings === 0) {
    console.log(`✅ All clear! No math issues found.\n`);
  } else {
    console.log(`📊 Found: ${totalErrors} errors, ${totalWarnings} warnings\n`);
  }
  
  if (totalErrors > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
