import { useEffect, useRef } from 'react'

const TAU = Math.PI * 2

function drawToken(context, token) {
  context.save()
  context.translate(token.x, token.y)
  context.rotate(token.rotation)
  context.globalAlpha = token.alpha
  context.strokeStyle = token.color
  context.lineWidth = 1.5
  context.lineJoin = 'round'
  context.beginPath()

  if (token.kind === 0) {
    // Bottle
    context.roundRect(-token.radius * .42, -token.radius * .45, token.radius * .84, token.radius * 1.15, token.radius * .12)
    context.rect(-token.radius * .22, -token.radius * .7, token.radius * .44, token.radius * .28)
    context.moveTo(-token.radius * .34, -token.radius * .2)
    context.lineTo(token.radius * .34, -token.radius * .2)
  } else if (token.kind === 1) {
    // Glasses
    context.arc(-token.radius * .38, 0, token.radius * .3, 0, TAU)
    context.arc(token.radius * .38, 0, token.radius * .3, 0, TAU)
    context.moveTo(-token.radius * .08, 0)
    context.lineTo(token.radius * .08, 0)
    context.moveTo(-token.radius * .68, -.02 * token.radius)
    context.lineTo(-token.radius * .9, -.15 * token.radius)
    context.moveTo(token.radius * .68, -.02 * token.radius)
    context.lineTo(token.radius * .9, -.15 * token.radius)
  } else if (token.kind === 2) {
    // Key
    context.arc(-token.radius * .35, 0, token.radius * .25, 0, TAU)
    context.moveTo(-token.radius * .1, 0)
    context.lineTo(token.radius * .78, 0)
    context.lineTo(token.radius * .78, token.radius * .25)
    context.moveTo(token.radius * .5, 0)
    context.lineTo(token.radius * .5, token.radius * .2)
  } else if (token.kind === 3) {
    // ID card
    context.roundRect(-token.radius * .72, -token.radius * .48, token.radius * 1.44, token.radius * .96, token.radius * .1)
    context.arc(-token.radius * .35, -.08 * token.radius, token.radius * .16, 0, TAU)
    context.moveTo(-token.radius * .1, token.radius * .18)
    context.lineTo(token.radius * .45, token.radius * .18)
    context.moveTo(token.radius * .05, -.08 * token.radius)
    context.lineTo(token.radius * .48, -.08 * token.radius)
  } else if (token.kind === 4) {
    // Headphones
    context.arc(0, 0, token.radius * .58, Math.PI, TAU)
    context.roundRect(-token.radius * .72, token.radius * .05, token.radius * .25, token.radius * .5, token.radius * .08)
    context.roundRect(token.radius * .47, token.radius * .05, token.radius * .25, token.radius * .5, token.radius * .08)
  } else if (token.kind === 5) {
    // Backpack
    context.roundRect(-token.radius * .52, -token.radius * .48, token.radius * 1.04, token.radius * 1.04, token.radius * .18)
    context.arc(0, -token.radius * .45, token.radius * .3, Math.PI, TAU)
    context.moveTo(-token.radius * .4, -.05 * token.radius)
    context.lineTo(token.radius * .4, -.05 * token.radius)
    context.moveTo(-token.radius * .32, token.radius * .28)
    context.lineTo(token.radius * .32, token.radius * .28)
  } else if (token.kind === 6) {
    // Umbrella
    context.arc(0, 0, token.radius * .65, Math.PI, TAU)
    context.moveTo(0, 0)
    context.lineTo(0, token.radius * .72)
    context.arc(token.radius * .12, token.radius * .72, token.radius * .15, 0, Math.PI)
  } else if (token.kind === 7) {
    // Watch
    context.roundRect(-token.radius * .34, -token.radius * .55, token.radius * .68, token.radius * 1.1, token.radius * .12)
    context.moveTo(-token.radius * .34, -.18 * token.radius)
    context.lineTo(token.radius * .34, -.18 * token.radius)
    context.moveTo(0, -.18 * token.radius)
    context.lineTo(0, token.radius * .12)
    context.moveTo(0, -.18 * token.radius)
    context.lineTo(token.radius * .18, -.02 * token.radius)
  } else if (token.kind === 8) {
    // Wallet
    context.roundRect(-token.radius * .7, -token.radius * .42, token.radius * 1.4, token.radius * .84, token.radius * .1)
    context.moveTo(-token.radius * .7, -.08 * token.radius)
    context.lineTo(token.radius * .28, -.08 * token.radius)
    context.arc(token.radius * .3, .12 * token.radius, token.radius * .08, 0, TAU)
  } else if (token.kind === 9) {
    // Pencil
    context.moveTo(-token.radius * .7, token.radius * .35)
    context.lineTo(token.radius * .45, -token.radius * .72)
    context.lineTo(token.radius * .72, -.45 * token.radius)
    context.lineTo(-token.radius * .43, token.radius * .62)
    context.closePath()
    context.moveTo(-token.radius * .43, token.radius * .62)
    context.lineTo(-token.radius * .7, token.radius * .35)
  } else if (token.kind === 10) {
    // Earbuds
    context.arc(-token.radius * .3, -.25 * token.radius, token.radius * .18, 0, TAU)
    context.arc(token.radius * .3, -.25 * token.radius, token.radius * .18, 0, TAU)
    context.moveTo(-token.radius * .3, -.07 * token.radius)
    context.lineTo(-token.radius * .3, token.radius * .52)
    context.moveTo(token.radius * .3, -.07 * token.radius)
    context.lineTo(token.radius * .3, token.radius * .52)
  } else if (token.kind === 11) {
    // Notebook
    context.roundRect(-token.radius * .6, -token.radius * .68, token.radius * 1.2, token.radius * 1.36, token.radius * .08)
    context.moveTo(-token.radius * .32, -.68 * token.radius)
    context.lineTo(-token.radius * .32, token.radius * .68)
    context.moveTo(-token.radius * .08, -.35 * token.radius)
    context.lineTo(token.radius * .38, -.35 * token.radius)
    context.moveTo(-token.radius * .08, -.05 * token.radius)
    context.lineTo(token.radius * .38, -.05 * token.radius)
    context.moveTo(-token.radius * .08, .25 * token.radius)
    context.lineTo(token.radius * .38, .25 * token.radius)
  } else if (token.kind === 12) {
    // Coin
    context.arc(0, 0, token.radius * .7, 0, TAU)
    context.moveTo(-token.radius * .48, 0)
    context.lineTo(token.radius * .48, 0)
    context.moveTo(0, -token.radius * .48)
    context.lineTo(0, token.radius * .48)
  } else if (token.kind === 13) {
    // Phone
    context.rect(-token.radius * .7, -token.radius * .52, token.radius * 1.4, token.radius * 1.04)
    context.moveTo(-token.radius * .7, -token.radius * .08)
    context.lineTo(token.radius * .7, -token.radius * .08)
    context.moveTo(-token.radius * .15, -token.radius * .52)
    context.lineTo(-token.radius * .15, token.radius * .52)
  } else if (token.kind === 14) {
    // Triangle pennant
    context.moveTo(0, -token.radius * .7)
    context.lineTo(token.radius * .7, token.radius * .58)
    context.lineTo(-token.radius * .7, token.radius * .58)
    context.closePath()
    context.moveTo(-token.radius * .3, .08 * token.radius)
    context.lineTo(token.radius * .3, .08 * token.radius)
  } else if (token.kind === 15) {
    // Ring
    context.arc(0, 0, token.radius * .68, 0, TAU)
    context.arc(0, 0, token.radius * .3, 0, TAU)
  } else if (token.kind === 16) {
    // Diamond
    context.moveTo(0, -token.radius * .78)
    context.lineTo(token.radius * .7, 0)
    context.lineTo(0, token.radius * .78)
    context.lineTo(-token.radius * .7, 0)
    context.closePath()
    context.moveTo(-token.radius * .35, 0)
    context.lineTo(token.radius * .35, 0)
  } else {
    // Loose cable
    context.arc(0, 0, token.radius * .65, Math.PI * .15, Math.PI * 1.85)
    context.moveTo(token.radius * .2, token.radius * .45)
    context.lineTo(token.radius * .68, token.radius * .78)
  }

  context.stroke()
  context.restore()
}

export default function OrbitField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointer = { x: 0, y: 0, active: false }
    const tokens = []
    let animationFrame
    let width = 0
    let height = 0
    let origin = { x: 0, y: 0 }
    let startTime = performance.now()
    let draggedToken = null

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = width * ratio
      canvas.height = height * ratio
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      origin = { x: width / 2, y: height / 2 }
    }

    const resetTokens = () => {
      tokens.length = 0
      const colors = ['#6B8F71', '#1E2A3A', '#C1524B', '#B8862E']
      const count = 100
      for (let index = 0; index < count; index += 1) {
        const angle = (index / count) * TAU + Math.random() * .35
        const distance = Math.min(width, height) * (.3 + Math.random() * .47)
        const radius = 10 + Math.random() * 6
        tokens.push({
          x: origin.x,
          y: origin.y,
          targetX: origin.x + Math.cos(angle) * distance,
          targetY: origin.y + Math.sin(angle) * distance,
          vx: Math.cos(angle + Math.PI / 2) * (.15 + Math.random() * .35),
          vy: Math.sin(angle + Math.PI / 2) * (.15 + Math.random() * .35),
          radius,
          kind: index % 17,
          color: colors[index % colors.length],
          rotation: Math.random() * TAU,
          spin: (Math.random() - .5) * .012,
          alpha: .16 + Math.random() * .18
        })
      }
      startTime = performance.now()
    }

    const pointerPosition = (event) => {
      const bounds = canvas.getBoundingClientRect()
      return { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
    }

    const onPointerMove = (event) => {
      const position = pointerPosition(event)
      pointer.x = position.x
      pointer.y = position.y
      pointer.active = true
      if (draggedToken) {
        draggedToken.x = position.x
        draggedToken.y = position.y
        draggedToken.vx = 0
        draggedToken.vy = 0
      }
    }

    const onPointerDown = (event) => {
      const position = pointerPosition(event)
      draggedToken = [...tokens].reverse().find((token) => Math.hypot(token.x - position.x, token.y - position.y) < token.radius + 10)
      if (draggedToken) canvas.setPointerCapture(event.pointerId)
    }

    const releasePointer = () => { draggedToken = null }
    const onPointerLeave = () => { pointer.active = false }

    const animate = (now) => {
      const elapsed = reduceMotion ? 1500 : now - startTime
      const vortexProgress = Math.min(1, elapsed / 1500)
      const eased = 1 - ((1 - vortexProgress) ** 3)
      context.clearRect(0, 0, width, height)

      context.save()
      context.translate(origin.x, origin.y)
      context.strokeStyle = 'rgba(107, 143, 113, .13)'
      context.lineWidth = 1
      context.setLineDash([2, 9])
      context.beginPath()
      context.arc(0, 0, Math.min(width, height) * .25, 0, TAU)
      context.arc(0, 0, Math.min(width, height) * .43, 0, TAU)
      context.stroke()
      context.setLineDash([])
      const glow = context.createRadialGradient(0, 0, 0, 0, 0, Math.min(width, height) * .2)
      glow.addColorStop(0, 'rgba(221, 233, 222, .36)')
      glow.addColorStop(1, 'rgba(221, 233, 222, 0)')
      context.fillStyle = glow
      context.beginPath()
      context.arc(0, 0, Math.min(width, height) * .2, 0, TAU)
      context.fill()
      context.restore()

      tokens.forEach((token) => {
        if (!draggedToken && vortexProgress < 1) {
          const angle = Math.atan2(token.targetY - origin.y, token.targetX - origin.x) + (1 - eased) * Math.PI * 2.4
          const distance = Math.hypot(token.targetX - origin.x, token.targetY - origin.y) * eased
          token.x = origin.x + Math.cos(angle) * distance
          token.y = origin.y + Math.sin(angle) * distance
        } else if (token !== draggedToken) {
          token.x += token.vx
          token.y += token.vy
          token.vx *= .999
          token.vy *= .999
          if (token.x < token.radius || token.x > width - token.radius) token.vx *= -1
          if (token.y < token.radius || token.y > height - token.radius) token.vy *= -1
          token.x = Math.max(token.radius, Math.min(width - token.radius, token.x))
          token.y = Math.max(token.radius, Math.min(height - token.radius, token.y))
        }
        token.rotation += token.spin
      })

      for (let first = 0; first < tokens.length; first += 1) {
        for (let second = first + 1; second < tokens.length; second += 1) {
          const a = tokens[first]
          const b = tokens[second]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const distance = Math.hypot(dx, dy) || .01
          const minimum = a.radius + b.radius
          if (distance < minimum) {
            const nx = dx / distance
            const ny = dy / distance
            const overlap = (minimum - distance) / 2
            if (a !== draggedToken) { a.x -= nx * overlap; a.y -= ny * overlap }
            if (b !== draggedToken) { b.x += nx * overlap; b.y += ny * overlap }
            const impulse = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
            if (impulse < 0) {
              if (a !== draggedToken) { a.vx += impulse * nx; a.vy += impulse * ny }
              if (b !== draggedToken) { b.vx -= impulse * nx; b.vy -= impulse * ny }
            }
          }
        }
      }

      if (pointer.active && !draggedToken && vortexProgress >= 1) {
        tokens.forEach((token) => {
          const distance = Math.hypot(token.x - pointer.x, token.y - pointer.y)
          if (distance < 100 && distance > 1) {
            const force = (100 - distance) / 1000
            token.vx += ((token.x - pointer.x) / distance) * force
            token.vy += ((token.y - pointer.y) / distance) * force
          }
        })
      }
      tokens.forEach((token) => drawToken(context, token))
      animationFrame = requestAnimationFrame(animate)
    }

    resize()
    resetTokens()
    window.addEventListener('resize', resize)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointerup', releasePointer)
    canvas.addEventListener('pointercancel', releasePointer)
    canvas.addEventListener('pointerleave', onPointerLeave)
    animationFrame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointerup', releasePointer)
      canvas.removeEventListener('pointercancel', releasePointer)
      canvas.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="orbit-field" aria-hidden="true" />
}