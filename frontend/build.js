#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const frontendDir = __dirname;

// Directories to minify
const jsFiles = [];
const cssFiles = [];

// Find all JS files
function findFiles(dir, ext) {
  const files = [];
  try {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      if (item.startsWith('.') || item === 'node_modules' || item === 'dist') return;
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        files.push(...findFiles(fullPath, ext));
      } else if (fullPath.endsWith(ext) && !fullPath.endsWith(`.min${ext}`)) {
        files.push(fullPath);
      }
    });
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err.message);
  }
  return files;
}

// Get all JS and CSS files
console.log('🔍 Finding all JavaScript and CSS files...');
const allJsFiles = findFiles(frontendDir, '.js');
const allCssFiles = findFiles(frontendDir, '.css');

// Filter out node_modules, build.js, and already minified files
const jsToMinify = allJsFiles.filter(f => 
  !f.includes('node_modules') && 
  !f.endsWith('build.js') &&
  !f.endsWith('.min.js')
);

const cssToMinify = allCssFiles.filter(f =>
  !f.includes('node_modules') &&
  !f.endsWith('.min.css')
);

console.log(`📦 Found ${jsToMinify.length} JavaScript files to minify`);
console.log(`🎨 Found ${cssToMinify.length} CSS files to minify\n`);

// Minify JavaScript files using inline minification
function minifyJs(inputFile) {
  try {
    const code = fs.readFileSync(inputFile, 'utf8');
    
    // Remove comments (both single-line and multi-line)
    let minified = code
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
      .replace(/\/\/.*$/gm, '')          // Remove // comments
      .replace(/^\s*[\r\n]/gm, '');      // Remove empty lines
    
    // Remove unnecessary whitespace
    minified = minified
      .replace(/\s+/g, ' ')              // Collapse multiple spaces
      .replace(/\s*([{}();:,])\s*/g, '$1'); // Remove spaces around operators
    
    const outputFile = inputFile.replace('.js', '.min.js');
    fs.writeFileSync(outputFile, minified);
    console.log(`✅ Minified: ${path.relative(frontendDir, inputFile)}`);
    return true;
  } catch (err) {
    console.error(`❌ Error minifying ${inputFile}:`, err.message);
    return false;
  }
}

// Minify CSS files
function minifyCss(inputFile) {
  try {
    let code = fs.readFileSync(inputFile, 'utf8');
    
    // Remove comments
    code = code.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Remove unnecessary whitespace
    code = code
      .replace(/\s+/g, ' ')               // Collapse whitespace
      .replace(/\s*([{}:;,>+~])\s*/g, '$1'); // Remove spaces around selectors/properties
    
    const outputFile = inputFile.replace('.css', '.min.css');
    fs.writeFileSync(outputFile, code);
    console.log(`✅ Minified: ${path.relative(frontendDir, inputFile)}`);
    return true;
  } catch (err) {
    console.error(`❌ Error minifying ${inputFile}:`, err.message);
    return false;
  }
}

// Process all files
console.log('🔄 Starting minification...\n');

jsToMinify.forEach(file => minifyJs(file));
cssToMinify.forEach(file => minifyCss(file));

console.log('\n✨ Minification complete!');
console.log('📝 Update your HTML files to use .min.js and .min.css files');
console.log('💡 Original files are preserved for development\n');
