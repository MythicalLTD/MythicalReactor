<template>
    <Card>
        <h2 class="text-2xl font-bold mb-4">Coolant System</h2>
        <div class="flex items-center justify-between mb-2">
            <span>Flow Rate:</span>
            <span class="text-2xl font-bold">{{ coolantFlow.toFixed(2) }} m³/h</span>
        </div>
        <div class="w-full bg-gray-700 rounded-full h-2.5">
            <div class="bg-primary h-2.5 rounded-full transition-all duration-500 ease-in-out"
                :style="{ width: `${(coolantFlow / 1200) * 100}%` }" :class="coolantColor"></div>
        </div>
        <div class="mt-4">
            <h3 class="text-lg font-semibold mb-2">System Efficiency</h3>
            <div class="flex items-center justify-between mb-2">
                <span>Efficiency:</span>
                <span class="text-xl font-bold">{{ coolantEfficiency.toFixed(2) }}%</span>
            </div>
            <div class="w-full bg-gray-700 rounded-full h-2.5">
                <div class="bg-primary h-2.5 rounded-full transition-all duration-500 ease-in-out"
                    :style="{ width: `${coolantEfficiency}%` }" :class="efficiencyColor"></div>
            </div>
        </div>
    </Card>
</template>

<script setup>
import { computed } from 'vue'
import { useReactorStore } from '../stores/reactor'
import Card from './ui/Card.vue'

const store = useReactorStore()

const coolantFlow = computed(() => store.coolantFlow)

const coolantColor = computed(() => {
    if (coolantFlow.value < 900 || coolantFlow.value > 1100) return 'bg-secondary'
    return 'bg-primary'
})

const coolantEfficiency = computed(() => {
    const optimalFlow = 1000
    const deviation = Math.abs(coolantFlow.value - optimalFlow)
    return Math.max(0, 100 - (deviation / 10))
})

const efficiencyColor = computed(() => {
    if (coolantEfficiency.value < 80) return 'bg-error'
    if (coolantEfficiency.value < 90) return 'bg-secondary'
    return 'bg-primary'
})
</script>