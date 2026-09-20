import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

const root = process.cwd()
const backendDir = join(root, 'backend')
const python = process.platform === 'win32'
  ? join(backendDir, '.venv', 'Scripts', 'python.exe')
  : join(backendDir, '.venv', 'bin', 'python')

if (!existsSync(python)) {
  console.error(`Backend virtual environment not found at ${python}`)
  console.error('Create it and install backend/requirements.txt before running npm run dev.')
  process.exit(1)
}

const processes = [
  spawn(process.execPath, [join(root, 'node_modules', 'vite', 'bin', 'vite.js'), '--host', '0.0.0.0'], {
    cwd: root,
    stdio: 'inherit',
  }),
  spawn(python, ['-m', 'uvicorn', 'app.main:app', '--reload', '--host', '0.0.0.0', '--port', '8000'], {
    cwd: backendDir,
    stdio: 'inherit',
  }),
]

function stop() {
  for (const child of processes) {
    if (!child.killed) child.kill()
  }
}

process.on('SIGINT', () => {
  stop()
  process.exit(0)
})
process.on('SIGTERM', () => {
  stop()
  process.exit(0)
})

for (const child of processes) {
  child.on('exit', (code) => {
    if (code && code !== 0) {
      stop()
      process.exitCode = code
    }
  })
}