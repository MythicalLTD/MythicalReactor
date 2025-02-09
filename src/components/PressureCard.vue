<template>
    <Card>
        <h2 class="text-2xl font-bold mb-4">Reactor Pressure</h2>
        <div class="flex items-center justify-between mb-2">
            <span>Pressure:</span>
            <span class="text-2xl font-bold" :class="pressureColor">{{ pressure.toFixed(2) }} MPa</span>
        </div>
        <div class="w-full bg-gray-700 rounded-full h-2.5">
            <div class="bg-primary h-2.5 rounded-full transition-all duration-500 ease-in-out"
                :style="{ width: `${(pressure / 300) * 100}%` }" :class="pressureColor"></div>
        </div>
        <p class="mt-2 text-sm" :class="pressureColor">
            {{ pressureStatus }}
        </p>
    </Card>
</template>

<script setup>
import { computed } from 'vue'
import { useReactorStore } from '../stores/reactor'
import Card from './ui/Card.vue'

const store = useReactorStore()

const pressure = computed(() => store.pressure)

const pressureColor = computed(() => {
    if (pressure.value > 250) return 'text-error'
    if (pressure.value > 200) return 'text-secondary'
    return 'text-primary'
})

const pressureStatus = computed(() => {
    if (pressure.value > 250) return 'Critical: Pressure exceeding safe levels'
    if (pressure.value > 200) return 'Warning: High pressure detected'
    return 'Normal: Pressure within safe range'
})
</script>