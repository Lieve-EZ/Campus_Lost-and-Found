import { spawn } from 'node:child_process'
import process from 'node:process'

const processes = [
  spawn(process.execPath, ['scripts/dev.mjs'], {
    cwd: process.cwd(),
    stdio: 'inherit',
  }),
  spawn('cloudflared', ['tunnel', '--url', 'http://localhost:5173'], {
    cwd: process.cwd(),
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
  child.on('error', (error) => {
    console.error(error.message)
    stop()
    process.exitCode = 1
  })
  child.on('exit', (code) => {
    if (code && code !== 0) {
      stop()
      process.exitCode = code
    }
  })
}