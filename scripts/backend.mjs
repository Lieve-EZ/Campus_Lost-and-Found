import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

const backendDir = join(process.cwd(), 'backend')
const python = process.platform === 'win32'
  ? join(backendDir, '.venv', 'Scripts', 'python.exe')
  : join(backendDir, '.venv', 'bin', 'python')

if (!existsSync(python)) {
  console.error(`Backend virtual environment not found at ${python}`)
  process.exit(1)
}

const server = spawn(python, ['-m', 'uvicorn', 'app.main:app', '--reload', '--host', '0.0.0.0', '--port', '8000'], {
  cwd: backendDir,
  stdio: 'inherit',
})

process.on('SIGINT', () => server.kill())
process.on('SIGTERM', () => server.kill())
server.on('exit', (code) => { process.exitCode = code || 0 })