// Simple server startup script
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Dine-Dash server...');

// Set environment
process.env.NODE_ENV = 'development';

// Start the server using tsx
const serverPath = path.join(__dirname, 'server', 'index.ts');
const server = spawn('npx', ['tsx', serverPath], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
  
  // Fallback: try with node directly
  console.log('Trying alternative startup method...');
  const fallback = spawn('node', ['-r', 'tsx/cjs', serverPath], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });
  
  fallback.on('error', (err) => {
    console.error('Server startup failed:', err);
    console.log('\nPlease install dependencies first:');
    console.log('npm install');
    console.log('Then run: npm run dev');
  });
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});