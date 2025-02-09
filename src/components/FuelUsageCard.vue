<template>
    <Card>
        <h2 class="text-2xl font-bold mb-4">Fuel Usage</h2>
        <div class="flex items-center justify-between mb-2">
            <span>Fuel Consumed:</span>
            <span class="text-2xl font-bold" :class="fuelColor">{{ fuelUsage.toFixed(2) }}%</span>
        </div>
        <div class="w-full bg-gray-700 rounded-full h-2.5">
            <div class="bg-primary h-2.5 rounded-full transition-all duration-500 ease-in-out"
                :style="{ width: `${fuelUsage}%` }" :class="fuelColor"></div>
        </div>
        <p class="mt-2 text-sm">
            Estimated time until refueling: {{ refuelingTime }}
        </p>
    </Card>
</template>

<script setup>
import { computed } from 'vue'
import { useReactorStore } from '../stores/reactor'
import Card from './ui/Card.vue'

const store = useReactorStore()

const fuelUsage = computed(() => store.fuelUsage)

const fuelColor = computed(() => {
    if (fuelUsage.value > 90) return 'text-error'
    if (fuelUsage.value > 75) return 'text-secondary'
    return 'text-primary'
})

const refuelingTime = computed(() => {
    const hoursLeft = Math.floor((100 - fuelUsage.value) / 0.1)
    const days = Math.floor(hoursLeft / 24)
    const hours = hoursLeft % 24
    return `${days} days, ${hours} hours`
})
</script>