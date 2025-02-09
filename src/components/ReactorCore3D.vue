<template>
    <Card class="h-96">
        <h2 class="text-2xl font-bold mb-4">Reactor Core 3D</h2>
        <div ref="container" class="w-full h-full"></div>
    </Card>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Card from './ui/Card.vue'

const container = ref(null)
let scene, camera, renderer, controls

onMounted(() => {
    initThree()
    animate()
})

onUnmounted(() => {
    if (renderer) {
        renderer.dispose()
    }
})

function initThree() {
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(75, container.value.clientWidth / container.value.clientHeight, 0.1, 1000)
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(container.value.clientWidth, container.value.clientHeight)
    container.value.appendChild(renderer.domElement)

    controls = new OrbitControls(camera, renderer.domElement)

    // Create reactor vessel
    const vesselGeometry = new THREE.CylinderGeometry(5, 5, 20, 32)
    const vesselMaterial = new THREE.MeshPhongMaterial({ color: 0x666666, transparent: true, opacity: 0.5 })
    const vessel = new THREE.Mesh(vesselGeometry, vesselMaterial)
    scene.add(vessel)

    // Create fuel rods
    const rodGeometry = new THREE.CylinderGeometry(0.2, 0.2, 18, 16)
    const rodMaterial = new THREE.MeshPhongMaterial({ color: 0xff9800 })

    for (let i = 0; i < 50; i++) {
        const rod = new THREE.Mesh(rodGeometry, rodMaterial)
        rod.position.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 8)
        vessel.add(rod)
    }

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040)
    scene.add(ambientLight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(1, 1, 1)
    scene.add(directionalLight)

    camera.position.z = 30
}

function animate() {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
}
</script>