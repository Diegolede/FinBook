const { spawn } = require('child_process');

// Start the renderer process (Vite)
const renderer = spawn('npm', ['run', 'dev:renderer'], { stdio: 'inherit' });

// Start the main process (Electron)
const main = spawn('npm', ['run', 'dev:main'], { stdio: 'inherit' });

// Handle process exit
renderer.on('exit', (code) => {
  console.log(`Renderer process exited with code ${code}`);
});

main.on('exit', (code) => {
  console.log(`Main process exited with code ${code}`);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('Shutting down...');
  renderer.kill();
  main.kill();
  process.exit();
});