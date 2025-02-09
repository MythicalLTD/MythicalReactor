<template>
    <div class="p-6 space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold font-mono text-gray-200">РВПК-1000 Reactor Core</h1>
                <p class="text-gray-500 mt-1">Real-time Core Monitoring & Visualization</p>
            </div>
            <div class="flex items-center space-x-4">
                <button class="btn-secondary" @click="toggleXRay">
                    {{ xrayMode ? 'Normal View' : 'X-Ray View' }}
                </button>
                <button class="btn-secondary" @click="toggleFlowLines">
                    {{ showFlowLines ? 'Hide Flow' : 'Show Flow' }}
                </button>
                <button class="btn-secondary" @click="resetCamera">
                    Reset View
                </button>

            </div>
        </div>

        <div class="grid grid-cols-12 gap-6">
            <!-- Main 3D Viewport -->
            <div class="col-span-8">
                <div class="relative h-[800px] bg-[#0a0d12] rounded-lg overflow-hidden">
                    <canvas ref="canvas" class="w-full h-full"></canvas>

                    <!-- Core Status Overlay -->
                    <div class="absolute top-4 left-4 space-y-4">
                        <!-- Power Distribution Map -->
                        <div class="bg-[#1a2233]/90 p-4 rounded">
                            <h3 class="text-sm font-mono text-gray-400 mb-2">Power Distribution</h3>
                            <div class="grid grid-cols-7 gap-1">
                                <div v-for="(value, i) in powerDistribution" :key="i" class="w-4 h-4" :style="{
                                    backgroundColor: `rgba(0, ${value * 255}, 0, ${value})`
                                }" :title="`Channel ${i + 1}: ${(value * 100).toFixed(1)}%`">
                                </div>
                            </div>
                        </div>

                        <!-- Neutron Flux Map -->
                        <div class="bg-[#1a2233]/90 p-4 rounded">
                            <h3 class="text-sm font-mono text-gray-400 mb-2">Neutron Flux</h3>
                            <canvas ref="fluxChart" class="w-48 h-32"></canvas>
                        </div>
                    </div>

                    <!-- Parameter Readouts -->
                    <div class="absolute top-4 right-4 bg-[#1a2233]/90 p-4 rounded space-y-4">
                        <div v-for="param in reactorParameters" :key="param.label" class="space-y-1">
                            <div class="flex justify-between items-center">
                                <span class="text-sm font-mono text-gray-500">{{ param.label }}</span>
                                <span class="text-sm font-mono" :class="param.valueColor">
                                    {{ param.value }}{{ param.unit }}
                                </span>
                            </div>
                            <div class="w-48 h-1.5 bg-[#243044] rounded-full overflow-hidden">
                                <div class="h-full transition-all duration-500" :class="param.barColor"
                                    :style="{ width: `${param.percentage}%` }"></div>
                            </div>
                            <div class="flex justify-between text-xs text-gray-600">
                                <span>{{ param.min }}{{ param.unit }}</span>
                                <span>{{ param.max }}{{ param.unit }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Alert Overlay -->
                    <div v-if="alerts.length > 0" class="absolute bottom-4 right-4 space-y-2">
                        <div v-for="alert in alerts" :key="alert.id"
                            class="bg-error/20 border-l-4 border-error px-4 py-2 rounded animate-pulse">
                            <div class="flex items-center space-x-2">
                                <AlertTriangle class="w-4 h-4 text-error" />
                                <span class="text-sm font-mono text-error">{{ alert.message }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Side Panels -->
            <div class="col-span-4 space-y-6">
                <!-- Control Rod Positions -->
                <Card>
                    <h2 class="text-lg font-mono mb-4">Control Rod Groups</h2>
                    <div class="grid grid-cols-4 gap-2">
                        <div v-for="(group, i) in rodGroups" :key="i" class="text-center p-2 bg-[#1a2233] rounded">
                            <div class="text-xs text-gray-500 mb-1">Group {{ i + 1 }}</div>
                            <div class="text-sm font-mono" :class="getRodStatusColor(group.position)">
                                {{ group.position.toFixed(0) }}%
                            </div>
                        </div>
                    </div>
                </Card>

                <!-- Coolant System Status -->
                <Card>
                    <h2 class="text-lg font-mono mb-4">Coolant System</h2>
                    <div class="space-y-4">
                        <div v-for="loop in coolantLoops" :key="loop.id" class="p-3 bg-[#1a2233] rounded">
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-sm text-gray-400">{{ loop.name }}</span>
                                <div class="flex items-center space-x-2">
                                    <span class="w-2 h-2 rounded-full"
                                        :class="loop.status === 'OK' ? 'bg-primary' : 'bg-error animate-pulse'">
                                    </span>
                                    <span class="text-sm font-mono"
                                        :class="loop.status === 'OK' ? 'text-primary' : 'text-error'">
                                        {{ loop.status }}
                                    </span>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div class="text-gray-500">Flow Rate</div>
                                    <div class="font-mono">{{ loop.flowRate }} m³/h</div>
                                </div>
                                <div>
                                    <div class="text-gray-500">Temperature</div>
                                    <div class="font-mono">{{ loop.temperature }}°C</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <!-- Steam Generation -->
                <Card>
                    <h2 class="text-lg font-mono mb-4">Steam Parameters</h2>
                    <canvas ref="steamChart" class="h-48 w-full"></canvas>
                </Card>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useReactorStore } from '@/stores/reactor'
import * as BABYLON from '@babylonjs/core'
import '@babylonjs/core/Materials/standardMaterial'
import '@babylonjs/core/Materials/PBR/pbrMaterial'
import '@babylonjs/core/Loading/loadingScreen'
import '@babylonjs/loaders/glTF'
import { Engine } from "@babylonjs/core/Engines/engine"
import { Scene } from "@babylonjs/core/scene"
import { Vector3 } from "@babylonjs/core/Maths/math.vector"
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color"
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera"
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight"
import { PointLight } from "@babylonjs/core/Lights/pointLight"
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder"
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial"
import { PBRMetallicRoughnessMaterial } from "@babylonjs/core/Materials/PBR/pbrMetallicRoughnessMaterial"
import { Texture } from "@babylonjs/core/Materials/Textures/texture"
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem"
import { AdvancedDynamicTexture, Button, Control, StackPanel, TextBlock } from '@babylonjs/gui/2D'
import { Chart } from 'chart.js/auto'

import { AlertTriangle, AlertOctagon } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'

const store = useReactorStore()
const canvas = ref(null)
const wireframe = ref(false)
const xrayMode = ref(false)
const showFlowLines = ref(true)

let engine, scene, camera
let reactor = {
    vessel: null,
    core: null,
    rods: [],
    coolantPipes: [],
    steamDrums: []
}

// Add these new refs for charts
const fluxChart = ref(null)
const steamChart = ref(null)
let fluxChartInstance = null
let steamChartInstance = null

// Add reactor parameters
const reactorParameters = computed(() => [
    {
        label: 'Core Temperature',
        value: store.temperature.toFixed(1),
        unit: '°C',
        min: 280,
        max: 320,
        percentage: ((store.temperature - 280) / (320 - 280)) * 100,
        valueColor: getTemperatureColor(store.temperature),
        barColor: getTemperatureBarColor(store.temperature)
    },
    {
        label: 'Reactor Power',
        value: store.powerOutput.toFixed(1),
        unit: '%',
        min: 0,
        max: 100,
        percentage: store.powerOutput,
        valueColor: 'text-primary',
        barColor: 'bg-primary'
    },
    {
        label: 'Pressure',
        value: store.pressure.toFixed(1),
        unit: 'MPa',
        min: 14,
        max: 16,
        percentage: ((store.pressure - 14) / (16 - 14)) * 100,
        valueColor: getPressureColor(store.pressure),
        barColor: getPressureBarColor(store.pressure)
    }
])

// Add coolant loop status
const coolantLoops = ref([
    {
        id: 1,
        name: 'Primary Loop A',
        status: 'OK',
        flowRate: 1250,
        temperature: 285
    },
    {
        id: 2,
        name: 'Primary Loop B',
        status: 'OK',
        flowRate: 1200,
        temperature: 288
    }
])

// Add power distribution data
const powerDistribution = ref(Array(49).fill(0).map(() => Math.random() * 0.8 + 0.2))

// Temperature color helpers
function getTemperatureColor(temp) {
    if (temp > 310) return 'text-error'
    if (temp > 300) return 'text-secondary'
    return 'text-primary'
}

function getTemperatureBarColor(temp) {
    if (temp > 310) return 'bg-error'
    if (temp > 300) return 'bg-secondary'
    return 'bg-primary'
}

// Pressure color helpers
function getPressureColor(pressure) {
    if (pressure > 15.8 || pressure < 14.2) return 'text-error'
    if (pressure > 15.5 || pressure < 14.5) return 'text-secondary'
    return 'text-primary'
}

function getPressureBarColor(pressure) {
    if (pressure > 15.8 || pressure < 14.2) return 'bg-error'
    if (pressure > 15.5 || pressure < 14.5) return 'bg-secondary'
    return 'bg-primary'
}

// Rod status color helper
function getRodStatusColor(position) {
    if (position < 20) return 'text-error'
    if (position > 80) return 'text-secondary'
    return 'text-primary'
}

// Add alerts state
const alerts = ref([])

// Add alert checking function
function checkAlerts() {
    alerts.value = []

    // Temperature alerts
    if (store.temperature > 310) {
        alerts.value.push({
            id: 'temp-high',
            message: 'CRITICAL: Core temperature exceeding limits'
        })
    } else if (store.temperature > 300) {
        alerts.value.push({
            id: 'temp-warn',
            message: 'WARNING: High core temperature'
        })
    }

    // Pressure alerts
    if (store.pressure > 15.8) {
        alerts.value.push({
            id: 'press-high',
            message: 'CRITICAL: System pressure too high'
        })
    } else if (store.pressure < 14.2) {
        alerts.value.push({
            id: 'press-low',
            message: 'CRITICAL: System pressure too low'
        })
    }

    // Coolant alerts
    coolantLoops.value.forEach(loop => {
        if (loop.flowRate < 1000) {
            alerts.value.push({
                id: `flow-${loop.id}`,
                message: `WARNING: Low flow rate in ${loop.name}`
            })
        }
        if (loop.temperature > 290) {
            alerts.value.push({
                id: `temp-${loop.id}`,
                message: `WARNING: High temperature in ${loop.name}`
            })
        }
    })
}

function createScene() {
    engine = new Engine(canvas.value, true)
    scene = new Scene(engine)
    scene.clearColor = new Color4(0.03, 0.05, 0.1, 1)

    // Camera setup
    camera = new ArcRotateCamera(
        "camera",
        -Math.PI / 2,
        Math.PI / 2.5,
        15,
        new Vector3(0, 0, 0),
        scene
    )
    camera.attachControl(canvas.value, true)
    camera.minZ = 0.1
    camera.wheelPrecision = 50
    camera.lowerRadiusLimit = 5
    camera.upperRadiusLimit = 30

    // Lighting
    const hemisphericLight = new HemisphericLight(
        "light",
        new Vector3(0, 1, 0),
        scene
    )
    hemisphericLight.intensity = 0.7

    const pointLight = new PointLight(
        "reactorLight",
        new Vector3(0, 0, 0),
        scene
    )
    pointLight.intensity = 0.5
    pointLight.diffuse = new Color3(0, 1, 0)

    createReactorComponents()
    createParticleSystems()
    createGUI()
}

function createReactorComponents() {
    // Create environment first
    createEnvironment()

    // Create enhanced materials
    const vesselMat = createAdvancedMaterials()

    // Create reactor vessel with improved materials
    reactor.vessel = BABYLON.MeshBuilder.CreateCylinder("vessel", {
        height: 8,
        diameter: 6,
        tessellation: 64, // Increased for smoother appearance
        subdivisions: 4   // Added for better lighting
    }, scene)
    reactor.vessel.material = vesselMat

    // Create core structure with glowing material
    const coreMat = new BABYLON.StandardMaterial("coreMat", scene)
    coreMat.emissiveColor = new BABYLON.Color3(0.1, 0.5, 0.1)
    coreMat.wireframe = true

    reactor.core = BABYLON.MeshBuilder.CreateCylinder("core", {
        height: 7,
        diameter: 5,
        tessellation: 32
    }, scene)
    reactor.core.material = coreMat
    reactor.core.parent = reactor.vessel

    // Create fuel channels and control rods
    createFuelAssemblies()
    createControlRods()
    createCoolantSystem()
    createSteamGeneratorSystem()

    // Add enhanced effects
    const coolantParticles = createEnhancedParticles()
    coolantParticles.start()

    createSteamEffects()

    const flowMaterial = createFluidAnimation()
    reactor.coolantPipes.forEach(pipe => {
        pipe.material = flowMaterial
    })
}

function createEnvironment() {
    // Create a simple skybox instead of HDR
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene)
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene)
    skyboxMaterial.backFaceCulling = false
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox", scene)
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0)
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0)
    skybox.material = skyboxMaterial

    // Add glow layer for reactor core
    const glowLayer = new BABYLON.GlowLayer("glow", scene, {
        mainTextureFixedSize: 1024,
        blurKernelSize: 64
    })
    glowLayer.intensity = 0.8
}

function createAdvancedMaterials() {
    // Enhanced vessel material with subsurface scattering
    const vesselMat = new BABYLON.PBRMaterial("vesselMat", scene)
    vesselMat.metallic = 0.8
    vesselMat.roughness = 0.3
    vesselMat.subSurface.isTranslucencyEnabled = true
    vesselMat.subSurface.translucencyIntensity = 0.8
    vesselMat.alpha = 0.7
    vesselMat.backFaceCulling = false

    // Add subtle normal mapping
    const normalTexture = new BABYLON.Texture("/textures/metal_normal.png", scene)
    vesselMat.bumpTexture = normalTexture
    vesselMat.bumpTexture.level = 0.3

    return vesselMat
}

function createEnhancedParticles() {
    // Coolant flow with improved visuals
    const coolantParticles = new BABYLON.GPUParticleSystem("coolant", { capacity: 50000 }, scene)
    coolantParticles.particleTexture = new BABYLON.Texture("/textures/flare.png", scene)
    coolantParticles.emitter = reactor.core

    // More realistic coolant behavior
    coolantParticles.addVelocityGradient(0, 2)
    coolantParticles.addVelocityGradient(1.0, 0.8)

    coolantParticles.addDragGradient(0, 0.4)
    coolantParticles.addDragGradient(1.0, 0.8)

    coolantParticles.addLimitVelocityGradient(0, 2)
    coolantParticles.addLimitVelocityGradient(1.0, 0.5)

    // Animated color gradients
    coolantParticles.addColorGradient(0, new BABYLON.Color4(0.2, 0.5, 1.0, 0))
    coolantParticles.addColorGradient(0.2, new BABYLON.Color4(0.2, 0.5, 1.0, 0.5))
    coolantParticles.addColorGradient(0.8, new BABYLON.Color4(0.1, 0.3, 0.8, 0.3))
    coolantParticles.addColorGradient(1.0, new BABYLON.Color4(0, 0.2, 0.5, 0))

    return coolantParticles
}

function createSteamEffects() {
    const steamMaterial = new BABYLON.StandardMaterial("steamMat", scene)
    steamMaterial.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9)
    steamMaterial.alpha = 0.1
    steamMaterial.alphaMode = BABYLON.Engine.ALPHA_ADD

    reactor.steamDrums.forEach(drum => {
        const steamSystem = new BABYLON.GPUParticleSystem("steam", { capacity: 10000 }, scene)
        steamSystem.particleTexture = new BABYLON.Texture("/textures/smoke.png", scene)
        steamSystem.emitter = new BABYLON.Vector3(
            drum.position.x,
            drum.position.y + 2,
            drum.position.z
        )

        // More realistic steam behavior
        steamSystem.minEmitPower = 0.5
        steamSystem.maxEmitPower = 1.5
        steamSystem.minAngularSpeed = -0.5
        steamSystem.maxAngularSpeed = 0.5

        steamSystem.addSizeGradient(0, 0.2)
        steamSystem.addSizeGradient(0.3, 0.5)
        steamSystem.addSizeGradient(0.7, 0.8)
        steamSystem.addSizeGradient(1.0, 1.0)

        steamSystem.addColorGradient(0, new BABYLON.Color4(0.9, 0.9, 0.9, 0))
        steamSystem.addColorGradient(0.2, new BABYLON.Color4(0.9, 0.9, 0.9, 0.15))
        steamSystem.addColorGradient(0.8, new BABYLON.Color4(0.9, 0.9, 0.9, 0.05))
        steamSystem.addColorGradient(1.0, new BABYLON.Color4(0.9, 0.9, 0.9, 0))

        steamSystem.start()
    })
}

function createFluidAnimation() {
    // Create animated texture for coolant flow
    const flowTexture = new BABYLON.DynamicTexture("flowTexture", { width: 256, height: 256 }, scene)
    const flowMaterial = new BABYLON.StandardMaterial("flowMat", scene)
    flowMaterial.emissiveTexture = flowTexture
    flowMaterial.alpha = 0.3

    // Animate the flow texture
    let time = 0
    scene.onBeforeRenderObservable.add(() => {
        time += 0.01
        const context = flowTexture.getContext()
        context.clearRect(0, 0, 256, 256)

        // Create flowing pattern
        for (let i = 0; i < 10; i++) {
            const y = (time * 50 + i * 25) % 256
            context.beginPath()
            context.moveTo(0, y)
            for (let x = 0; x < 256; x++) {
                context.lineTo(x, y + Math.sin(x * 0.1 + time) * 5)
            }
            context.strokeStyle = `rgba(0, 128, 255, ${0.1 - i * 0.01})`
            context.stroke()
        }

        flowTexture.update()
    })

    return flowMaterial
}

function createFuelAssemblies() {
    const fuelMat = new BABYLON.PBRMetallicRoughnessMaterial("fuelMat", scene)
    fuelMat.baseColor = new BABYLON.Color3(0.7, 0.3, 0.2)
    fuelMat.emissiveColor = new BABYLON.Color3(0.4, 0.1, 0)
    fuelMat.metallic = 0.7
    fuelMat.roughness = 0.3

    // Create hexagonal pattern of fuel channels
    const gridSize = 8
    const spacing = 0.4

    for (let q = -gridSize; q <= gridSize; q++) {
        const r1 = Math.max(-gridSize, -q - gridSize)
        const r2 = Math.min(gridSize, -q + gridSize)
        for (let r = r1; r <= r2; r++) {
            const x = spacing * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r)
            const z = spacing * (3. / 2 * r)

            if (x * x + z * z <= 2 * 2) {
                const channel = BABYLON.MeshBuilder.CreateCylinder("channel", {
                    height: 7,
                    diameter: 0.2,
                    tessellation: 12
                }, scene)
                channel.material = fuelMat
                channel.position = new BABYLON.Vector3(x, 0, z)
                channel.parent = reactor.core

                // Add graphite moderator blocks
                const graphiteMat = new BABYLON.StandardMaterial("graphiteMat", scene)
                graphiteMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2)
                graphiteMat.alpha = 0.3

                const block = BABYLON.MeshBuilder.CreateBox("block", {
                    height: 7,
                    width: spacing * 0.9,
                    depth: spacing * 0.9
                }, scene)
                block.material = graphiteMat
                block.position = new BABYLON.Vector3(x, 0, z)
                block.parent = reactor.core
            }
        }
    }
}

function createControlRods() {
    const rodMat = new BABYLON.PBRMetallicRoughnessMaterial("rodMat", scene)
    rodMat.baseColor = new BABYLON.Color3(0.6, 0.6, 0.6)
    rodMat.metallic = 0.9
    rodMat.roughness = 0.2

    // Match the number of rods to the store
    const rodCount = store.rodGroups?.length || 16

    for (let i = 0; i < rodCount; i++) {
        const angle = (i * Math.PI * 2) / rodCount
        const radius = 1.5
        const x = radius * Math.cos(angle)
        const z = radius * Math.sin(angle)

        const rod = BABYLON.MeshBuilder.CreateCylinder("rod", {
            height: 7,
            diameter: 0.15,
            tessellation: 12
        }, scene)
        rod.material = rodMat.clone() // Clone material for each rod
        rod.position = new BABYLON.Vector3(x, 3.5, z)
        rod.parent = reactor.core
        reactor.rods.push(rod)
    }
}

function createCoolantSystem() {
    // Create coolant pipes with animated textures
    const pipeMat = new BABYLON.StandardMaterial("pipeMat", scene)
    pipeMat.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.8)
    pipeMat.emissiveColor = new BABYLON.Color3(0, 0.2, 0.4)

    // Create primary coolant loop
    const points = []
    for (let i = 0; i <= 20; i++) {
        const angle = (i * Math.PI * 2) / 20
        points.push(new BABYLON.Vector3(
            3 * Math.cos(angle),
            2 * Math.sin(angle),
            0
        ))
    }

    const pipe = BABYLON.MeshBuilder.CreateTube("pipe", {
        path: points,
        radius: 0.2,
        tessellation: 12
    }, scene)
    pipe.material = pipeMat
    reactor.coolantPipes.push(pipe)

    // Create coolant particle system
    const coolantParticles = new BABYLON.ParticleSystem("coolant", 2000, scene)
    coolantParticles.particleTexture = new BABYLON.Texture("/textures/particle.png")
    coolantParticles.emitter = pipe
    coolantParticles.minEmitBox = new BABYLON.Vector3(-0.1, -0.1, -0.1)
    coolantParticles.maxEmitBox = new BABYLON.Vector3(0.1, 0.1, 0.1)
    coolantParticles.color1 = new BABYLON.Color4(0, 0.5, 1, 0.3)
    coolantParticles.color2 = new BABYLON.Color4(0.2, 0.6, 1, 0.3)
    coolantParticles.start()
}

function createSteamGeneratorSystem() {
    // Create steam generator vessel
    const sgMaterial = new BABYLON.PBRMaterial("sgMat", scene)
    sgMaterial.metallic = 0.8
    sgMaterial.roughness = 0.2
    sgMaterial.albedoColor = new BABYLON.Color3(0.7, 0.7, 0.7)

    // Create two steam generators
    for (let i = 0; i < 2; i++) {
        const angle = i * Math.PI
        // Use MeshBuilder instead of CylinderGeometry
        const sg = BABYLON.MeshBuilder.CreateCylinder("steamGen" + i, {
            height: 6,
            diameter: 2.4,
            tessellation: 32
        }, scene)
        sg.material = sgMaterial
        sg.position = new BABYLON.Vector3(
            8 * Math.cos(angle),
            0,
            8 * Math.sin(angle)
        )

        // Add internal tube bundle
        const tubeBundle = createTubeBundle(sg.position)
        tubeBundle.parent = sg

        // Add water level
        const waterLevel = createWaterLevel(sg.position)
        waterLevel.parent = sg

        // Add steam dome
        const steamDome = BABYLON.MeshBuilder.CreateCylinder("dome" + i, {
            height: 2,
            diameterTop: 1.8,
            diameterBottom: 2.4,
            tessellation: 32
        }, scene)
        steamDome.position = new BABYLON.Vector3(
            sg.position.x,
            3.5,
            sg.position.z
        )
        steamDome.material = sgMaterial
        steamDome.parent = sg

        // Add steam outlet pipe
        createSteamPipe(steamDome.position, i)

        // Add enhanced steam effect
        createEnhancedSteamEffect(steamDome.position)

        reactor.steamDrums.push(sg)
    }
}

function createTubeBundle(position) {
    // Create a parent node for all tubes
    const bundle = new BABYLON.TransformNode("tubeBundle", scene)
    bundle.position = position

    // Create tube material once to reuse
    const tubeMat = new BABYLON.PBRMaterial("tubeMat", scene)
    tubeMat.metallic = 0.9
    tubeMat.roughness = 0.1
    tubeMat.albedoColor = new BABYLON.Color3(0.8, 0.8, 0.8)

    // Tube parameters
    const tubeParams = {
        radius: 0.05,
        tessellation: 8,
        cap: BABYLON.Mesh.CAP_ALL
    }

    // Create tube grid
    const rows = 12
    const tubesPerRow = 8
    const spacing = 0.2
    const bendRadius = 0.3
    const tubeHeight = 5

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < tubesPerRow; col++) {
            // Calculate tube position
            const x = (col - tubesPerRow / 2) * spacing
            const y = (row - rows / 2) * spacing

            // Create path points for U-shaped tube
            const points = []
            const segments = 30

            for (let i = 0; i <= segments; i++) {
                const t = i / segments
                let px, py, pz

                if (t <= 0.4) {
                    // Downward section
                    py = -tubeHeight / 2 + t * tubeHeight
                    px = x
                    pz = 0
                } else if (t <= 0.6) {
                    // U-bend
                    const bendT = (t - 0.4) / 0.2
                    const bendAngle = Math.PI * bendT
                    px = x + Math.sin(bendAngle) * bendRadius
                    py = tubeHeight / 2
                    pz = Math.cos(bendAngle) * bendRadius
                } else {
                    // Upward section
                    py = tubeHeight / 2 - (t - 0.6) * tubeHeight
                    px = x + bendRadius * 2
                    pz = 0
                }

                points.push(new BABYLON.Vector3(px, py, pz))
            }

            // Create the tube
            const tube = BABYLON.MeshBuilder.CreateTube(
                `tube_${row}_${col}`,
                {
                    path: points,
                    ...tubeParams
                },
                scene
            )

            // Apply material and parent to bundle
            tube.material = tubeMat
            tube.parent = bundle

            // Add subtle random rotation for variety
            tube.rotation.y = (Math.random() - 0.5) * 0.1
        }
    }

    // Add water flow particles
    const waterParticles = new BABYLON.ParticleSystem("waterFlow", 1000, scene)
    waterParticles.particleTexture = new BABYLON.Texture("/textures/flare.png", scene)
    waterParticles.emitter = new BABYLON.Vector3(0, -tubeHeight / 2, 0)
    waterParticles.minEmitBox = new BABYLON.Vector3(-spacing * tubesPerRow / 2, 0, -0.1)
    waterParticles.maxEmitBox = new BABYLON.Vector3(spacing * tubesPerRow / 2, 0, 0.1)

    // Configure water particles
    waterParticles.color1 = new BABYLON.Color4(0.1, 0.3, 0.5, 0.2)
    waterParticles.color2 = new BABYLON.Color4(0.1, 0.4, 0.6, 0.2)
    waterParticles.colorDead = new BABYLON.Color4(0.1, 0.3, 0.5, 0)

    waterParticles.minSize = 0.03
    waterParticles.maxSize = 0.08
    waterParticles.minLifeTime = 1
    waterParticles.maxLifeTime = 2
    waterParticles.emitRate = 100

    waterParticles.direction1 = new BABYLON.Vector3(0, 1, 0)
    waterParticles.direction2 = new BABYLON.Vector3(0, 1, 0)
    waterParticles.minEmitPower = 1
    waterParticles.maxEmitPower = 2

    waterParticles.parent = bundle
    waterParticles.start()

    return bundle
}

function createWaterLevel(position) {
    // Create animated water level effect
    const waterMaterial = new BABYLON.StandardMaterial("waterMat", scene)
    waterMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.3, 0.5)
    waterMaterial.alpha = 0.5

    const water = BABYLON.MeshBuilder.CreateCylinder("water", {
        height: 3,
        diameter: 2.2,
        tessellation: 32
    }, scene)
    water.position.y = -1
    water.material = waterMaterial

    // Add water ripple animation
    scene.onBeforeRenderObservable.add(() => {
        water.position.y = -1 + Math.sin(Date.now() * 0.001) * 0.05
    })

    return water
}

function createSteamPipe(startPos, index) {
    const points = []
    const endPos = new BABYLON.Vector3(startPos.x * 0.5, startPos.y + 2, startPos.z * 0.5)

    // Create curved path to turbine
    for (let i = 0; i <= 20; i++) {
        const t = i / 20
        points.push(new BABYLON.Vector3(
            startPos.x + (endPos.x - startPos.x) * t,
            startPos.y + (endPos.y - startPos.y) * t + Math.sin(t * Math.PI) * 2,
            startPos.z + (endPos.z - startPos.z) * t
        ))
    }

    const pipe = BABYLON.MeshBuilder.CreateTube("steamPipe" + index, {
        path: points,
        radius: 0.3,
        tessellation: 16
    }, scene)

    const pipeMat = new BABYLON.PBRMaterial("pipeMat", scene)
    pipeMat.metallic = 0.9
    pipeMat.roughness = 0.1
    pipeMat.albedoColor = new BABYLON.Color3(0.7, 0.7, 0.7)
    pipe.material = pipeMat

    return pipe
}

function createTurbineSystem() {
    // Create turbine housing
    const turbineHousing = BABYLON.MeshBuilder.CreateCylinder("turbineHousing", {
        height: 4,
        diameterTop: 1.5,
        diameterBottom: 2,
        tessellation: 32
    }, scene)
    turbineHousing.position = new BABYLON.Vector3(0, 5, 0)
    turbineHousing.rotation.z = Math.PI / 2

    const housingMat = new BABYLON.PBRMaterial("housingMat", scene)
    housingMat.metallic = 0.8
    housingMat.roughness = 0.2
    housingMat.albedoColor = new BABYLON.Color3(0.6, 0.6, 0.6)
    turbineHousing.material = housingMat

    // Create turbine blades
    const bladeCount = 20
    const blades = []
    for (let i = 0; i < bladeCount; i++) {
        const blade = BABYLON.MeshBuilder.CreateBox("blade" + i, {
            height: 0.1,
            width: 1,
            depth: 0.3
        }, scene)
        blade.position = new BABYLON.Vector3(0, 5, 0)
        blade.rotation.y = (i / bladeCount) * Math.PI * 2

        const bladeMat = new BABYLON.PBRMaterial("bladeMat", scene)
        bladeMat.metallic = 0.9
        bladeMat.roughness = 0.1
        bladeMat.albedoColor = new BABYLON.Color3(0.8, 0.8, 0.8)
        blade.material = bladeMat

        blades.push(blade)
    }

    // Animate turbine rotation
    let rotationSpeed = 0
    scene.onBeforeRenderObservable.add(() => {
        const targetSpeed = (store.powerOutput / 100) * 0.2
        rotationSpeed += (targetSpeed - rotationSpeed) * 0.01
        blades.forEach(blade => {
            blade.rotation.y += rotationSpeed
        })
    })

    return { housing: turbineHousing, blades }
}

function createEnhancedSteamEffect(position) {
    const steamSystem = new BABYLON.ParticleSystem("steam", 5000, scene)
    steamSystem.particleTexture = new BABYLON.Texture("/textures/smoke.png", scene)

    // Position the emitter
    steamSystem.emitter = new BABYLON.Vector3(position.x, position.y + 1, position.z)
    steamSystem.minEmitBox = new BABYLON.Vector3(-0.4, 0, -0.4)
    steamSystem.maxEmitBox = new BABYLON.Vector3(0.4, 0, 0.4)

    // Configure particle behavior
    steamSystem.minEmitPower = 1
    steamSystem.maxEmitPower = 2
    steamSystem.minAngularSpeed = -0.5
    steamSystem.maxAngularSpeed = 0.5

    // Size evolution
    steamSystem.minSize = 0.2
    steamSystem.maxSize = 0.8
    steamSystem.minLifeTime = 1
    steamSystem.maxLifeTime = 3

    // Color and opacity
    steamSystem.color1 = new BABYLON.Color4(0.9, 0.9, 0.9, 0)
    steamSystem.color2 = new BABYLON.Color4(0.9, 0.9, 0.9, 0.2)
    steamSystem.colorDead = new BABYLON.Color4(0.9, 0.9, 0.9, 0)

    // Emission rate based on power
    steamSystem.emitRate = 100 + (store.powerOutput * 3)

    // Add some randomization
    steamSystem.direction1 = new BABYLON.Vector3(-0.2, 1, -0.2)
    steamSystem.direction2 = new BABYLON.Vector3(0.2, 1, 0.2)
    steamSystem.gravity = new BABYLON.Vector3(0, 0.5, 0)

    steamSystem.start()
    return steamSystem
}

function createParticleSystems() {
    // Coolant flow particles
    const coolantParticles = new BABYLON.ParticleSystem("coolantFlow", 5000, scene)
    coolantParticles.particleTexture = new BABYLON.Texture("/textures/flare.png")
    coolantParticles.emitter = reactor.core
    coolantParticles.minEmitBox = new BABYLON.Vector3(-2, -3, -2)
    coolantParticles.maxEmitBox = new BABYLON.Vector3(2, 3, 2)

    // Particle properties
    coolantParticles.color1 = new BABYLON.Color4(0, 0.5, 1, 0.1)
    coolantParticles.color2 = new BABYLON.Color4(0.2, 0.6, 1, 0.2)
    coolantParticles.colorDead = new BABYLON.Color4(0, 0, 0.2, 0)

    coolantParticles.minSize = 0.05
    coolantParticles.maxSize = 0.1
    coolantParticles.minLifeTime = 0.3
    coolantParticles.maxLifeTime = 1.5
    coolantParticles.emitRate = 500

    // Flow animation
    coolantParticles.direction1 = new BABYLON.Vector3(-1, 2, -1)
    coolantParticles.direction2 = new BABYLON.Vector3(1, 2, 1)
    coolantParticles.gravity = new BABYLON.Vector3(0, 2, 0)

    coolantParticles.start()

    // Neutron activity particles
    const neutronParticles = new BABYLON.ParticleSystem("neutrons", 2000, scene)
    neutronParticles.particleTexture = new BABYLON.Texture("/textures/particle.png")
    neutronParticles.emitter = reactor.core
    neutronParticles.minEmitBox = new BABYLON.Vector3(-2, -3, -2)
    neutronParticles.maxEmitBox = new BABYLON.Vector3(2, 3, 2)

    // Particle properties
    neutronParticles.color1 = new BABYLON.Color4(0, 1, 0, 0.2)
    neutronParticles.color2 = new BABYLON.Color4(0.5, 1, 0.5, 0.3)
    neutronParticles.colorDead = new BABYLON.Color4(0, 0.5, 0, 0)

    neutronParticles.minSize = 0.05
    neutronParticles.maxSize = 0.15
    neutronParticles.minLifeTime = 0.2
    neutronParticles.maxLifeTime = 0.8
    neutronParticles.emitRate = 200

    // Random movement
    neutronParticles.minEmitPower = 0.5
    neutronParticles.maxEmitPower = 1.5
    neutronParticles.updateSpeed = 0.01

    neutronParticles.start()
}

function createGUI() {
    const guiTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene)

    const statusPanel = new StackPanel()
    statusPanel.width = "200px"
    statusPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT
    statusPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP
    statusPanel.top = "20px"
    statusPanel.right = "20px"
    guiTexture.addControl(statusPanel)

    const tempText = new TextBlock()
    tempText.height = "30px"
    tempText.color = "white"
    tempText.fontSize = 14
    statusPanel.addControl(tempText)

    const powerText = new TextBlock()
    powerText.height = "30px"
    powerText.color = "white"
    powerText.fontSize = 14
    statusPanel.addControl(powerText)

    const modeText = new TextBlock()
    modeText.height = "30px"
    modeText.color = "white"
    modeText.fontSize = 14
    statusPanel.addControl(modeText)

    scene.onBeforeRenderObservable.add(() => {
        tempText.text = `Temperature: ${store.temperature.toFixed(1)}°C`
        powerText.text = `Power: ${store.powerOutput.toFixed(1)}%`
        modeText.text = `Mode: ${store.reactorStatus}`

        tempText.color = store.temperature > 300 ? "#ff4444" : "#ffffff"
        powerText.color = store.powerOutput > 90 ? "#ff4444" : "#ffffff"
        modeText.color = store.reactorStatus === 'Normal' ? "#4CAF50" : "#ff4444"
    })

    const buttonPanel = new StackPanel()
    buttonPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT
    buttonPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM
    buttonPanel.left = "20px"
    buttonPanel.bottom = "20px"
    guiTexture.addControl(buttonPanel)

    const scramButton = Button.CreateSimpleButton("scram", "SCRAM")
    scramButton.width = "150px"
    scramButton.height = "40px"
    scramButton.color = "white"
    scramButton.background = "#c0392b"
    scramButton.onPointerUpObservable.add(() => {
        store.initiateScram()
    })
    buttonPanel.addControl(scramButton)
}

function updateReactorState() {
    // Add safety checks for rod updates
    if (reactor.rods && store.rodGroups) {
        reactor.rods.forEach((rod, i) => {
            if (store.rodGroups[i]) {
                const targetY = 3.5 - (store.rodGroups[i].position || 50) * 0.07
                rod.position.y += (targetY - rod.position.y) * 0.1
            }
        })
    }

    // Update core material if it exists
    if (reactor.core && reactor.core.material) {
        const coreMat = reactor.core.material
        const intensity = store.powerOutput / 100
        coreMat.emissiveColor = new BABYLON.Color3(
            0.1 * intensity,
            0.5 * intensity,
            0.1 * intensity
        )
    }

    // Only update if charts exist
    if (fluxChartInstance || steamChartInstance) {
        updateCharts()
    }

    updatePowerDistribution()
    checkAlerts()
}

function updateCharts() {
    if (fluxChartInstance) {
        fluxChartInstance.data.datasets[0].data = store.neutronFlux
        fluxChartInstance.update('quiet')
    }

    if (steamChartInstance) {
        steamChartInstance.data.datasets.forEach(dataset => {
            dataset.data = [...dataset.data.slice(1), dataset.data[19] + (Math.random() - 0.5)]
        })
        steamChartInstance.update('quiet')
    }
}

function updatePowerDistribution() {
    powerDistribution.value = powerDistribution.value.map(value => {
        return Math.max(0.2, Math.min(1, value + (Math.random() - 0.5) * 0.1))
    })
}

function toggleWireframe() {
    wireframe.value = !wireframe.value
    reactor.core.material.wireframe = wireframe.value
}

function toggleXRay() {
    xrayMode.value = !xrayMode.value
}

function toggleFlowLines() {
    showFlowLines.value = !showFlowLines.value
}

function resetCamera() {
    camera.alpha = -Math.PI / 2
    camera.beta = Math.PI / 2.5
    camera.radius = 15
}

function handleResize() {
    const width = canvas.value.clientWidth
    const height = canvas.value.clientHeight
    camera.radius = Math.min(width, height) / 2
    camera.target.x = width / 2
    camera.target.y = height / 2
    camera.updateMatrixWorld()
    engine.resize()
}

function initCharts() {
    // Make sure the canvas elements exist
    if (!fluxChart.value || !steamChart.value) return;

    // Destroy existing instances if they exist
    if (fluxChartInstance) fluxChartInstance.destroy();
    if (steamChartInstance) steamChartInstance.destroy();

    try {
        const fluxCtx = fluxChart.value.getContext('2d');
        fluxChartInstance = new Chart(fluxCtx, {
            type: 'line',
            data: {
                labels: Array(20).fill(''),
                datasets: [{
                    label: 'Neutron Flux',
                    data: store.neutronFlux || Array(20).fill(80),
                    borderColor: '#00ff00',
                    backgroundColor: 'rgba(0, 255, 0, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#4B5563'
                        }
                    },
                    x: {
                        display: false
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                },
                animation: {
                    duration: 0
                }
            }
        });

        const steamCtx = steamChart.value.getContext('2d');
        steamChartInstance = new Chart(steamCtx, {
            type: 'line',
            data: {
                labels: Array(20).fill(''),
                datasets: [{
                    label: 'Steam Pressure',
                    data: Array(20).fill(0).map(() => 6 + Math.random()),
                    borderColor: '#3b82f6',
                    tension: 0.4
                }, {
                    label: 'Steam Temperature',
                    data: Array(20).fill(0).map(() => 280 + Math.random() * 20),
                    borderColor: '#ef4444',
                    tension: 0.4
                }]
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#4B5563'
                        }
                    },
                    x: {
                        display: false
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#4B5563'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

function handleScram() {
    store.initiateScram()

    // Add dramatic effects to the UI
    const elements = document.querySelectorAll('.animate-on-scram')
    elements.forEach(el => {
        el.classList.add('animate-shake')
    })

    // Play alarm sound if available
    const alarm = new Audio('/sounds/alarm.mp3')
    alarm.play().catch(() => {
        // Handle browsers that block autoplay
        console.log('Audio playback blocked')
    })
}

onMounted(async () => {
    // Ensure store is initialized
    if (!store.rodGroups) {
        store.rodGroups = Array(16).fill(0).map(() => ({
            position: 50,
            manual: false,
            status: 'nominal'
        }))
    }

    createScene()

    await nextTick()
    initCharts()

    engine.runRenderLoop(() => {
        scene.render()
        updateReactorState()
    })

    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)

    // Clean up BabylonJS resources
    if (engine) {
        engine.stopRenderLoop()
        engine.dispose()
    }

    if (scene) {
        scene.dispose()
    }

    // Clean up reactor meshes
    if (reactor) {
        reactor.rods.forEach(rod => rod.dispose())
        reactor.rods = []
        reactor.vessel?.dispose()
        reactor.core?.dispose()
        reactor.coolantPipes.forEach(pipe => pipe.dispose())
        reactor.steamDrums.forEach(drum => drum.dispose())
    }

    // Clean up charts
    if (fluxChartInstance) fluxChartInstance.destroy()
    if (steamChartInstance) steamChartInstance.destroy()
})
</script>
