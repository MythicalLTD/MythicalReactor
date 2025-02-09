<template>
    <Card class="h-full">
        <h2 class="text-2xl font-bold mb-4">Control Rod Positions</h2>
        <div class="grid grid-cols-5 gap-2 mb-4">
            <div v-for="(rod, index) in controlRods" :key="index" 
                 class="relative h-40 bg-gray-800 overflow-hidden">
                <div class="absolute bottom-0 w-full bg-primary transition-all duration-500"
                     :style="{ height: `${rod}%`, opacity: rod / 100 }">
                </div>
                <div class="absolute inset-0 flex flex-col items-center justify-between p-2">
                    <span class="text-xs">Rod {{ index + 1 }}</span>
                    <span class="text-sm font-bold">{{ rod.toFixed(1) }}%</span>
                </div>
            </div>
        </div>
        <div class="flex justify-between items-center">
            <Button @click="randomizeRods" variant="secondary">Adjust Rods</Button>
            <Button @click="resetRods" variant="primary">Reset</Button>
        </div>
    </Card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Card from './ui/Card.vue'
import Button from './ui/Button.vue'

const controlRods = ref(Array(10).fill(50))

function randomizeRods() {
    controlRods.value = controlRods.value.map(() => 
        Math.max(0, Math.min(100, 50 + (Math.random() - 0.5) * 20))
    )
}

function resetRods() {
    controlRods.value = controlRods.value.map(() => 50)
}

onMounted(() => {
    setInterval(randomizeRods, 5000)
})
</script> 