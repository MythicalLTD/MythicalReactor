import { createCanvas } from 'canvas'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

// Get current directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Create flare texture
function createFlareTexture() {
    const canvas = createCanvas(64, 64)
    const ctx = canvas.getContext('2d')

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)

    return canvas.toBuffer()
}

// Create particle texture
function createParticleTexture() {
    const canvas = createCanvas(32, 32)
    const ctx = canvas.getContext('2d')

    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 32, 32)

    return canvas.toBuffer()
}

// Create smoke texture
function createSmokeTexture() {
    const canvas = createCanvas(64, 64)
    const ctx = canvas.getContext('2d')

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)

    return canvas.toBuffer()
}

// Ensure directory exists
const texturesPath = new URL('../public/textures', import.meta.url)
if (!existsSync(texturesPath)) {
    mkdirSync(texturesPath, { recursive: true })
}

// Save textures
writeFileSync(new URL('flare.png', texturesPath), createFlareTexture())
writeFileSync(new URL('particle.png', texturesPath), createParticleTexture())
writeFileSync(new URL('smoke.png', texturesPath), createSmokeTexture())

console.log('Textures created successfully!') 