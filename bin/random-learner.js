#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Random Learner...');
console.log('📚 Your intelligent learning companion');

// Get the path to the main application
const appPath = path.join(__dirname, '..', 'src', 'index.js');
const packageRoot = path.join(__dirname, '..');

// Try to find electron executable
let electronPath;

// First, try local node_modules
const localElectron = path.join(packageRoot, 'node_modules', '.bin', 'electron');
if (fs.existsSync(localElectron)) {
  electronPath = localElectron;
} else {
  // Try to use npx to find electron
  electronPath = 'npx';
}

// Start the Electron application
const args = electronPath === 'npx' ? ['electron', appPath] : [appPath];
const electronProcess = spawn(electronPath, args, {
  stdio: 'inherit',
  cwd: packageRoot
});

electronProcess.on('error', (error) => {
  console.error('❌ Failed to start Random Learner:', error.message);
  console.log('💡 Installation help:');
  console.log('   Local install: npm install (in the project directory)');
  console.log('   Global Electron: npm install -g electron');
  console.log('   Or run: npx electron src/index.js');
  process.exit(1);
});

electronProcess.on('close', (code) => {
  if (code !== 0) {
    console.log(`👋 Random Learner closed with code ${code}`);
  } else {
    console.log('👋 Random Learner closed successfully');
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Random Learner...');
  electronProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  electronProcess.kill('SIGTERM');
});
