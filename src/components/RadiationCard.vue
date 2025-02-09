<template>
    <Card>
        <h2 class="text-2xl font-bold mb-4">Radiation Levels</h2>
        <div class="flex items-center justify-between mb-2">
            <span>Radiation:</span>
            <span class="text-2xl font-bold" :class="radiationColor">{{ radiationLevel.toFixed(4) }} mSv/h</span>
        </div>
        <div class="w-full bg-gray-700 rounded-full h-2.5">
            <div class="bg-primary h-2.5 rounded-full transition-all duration-500 ease-in-out"
                :style="{ width: `${radiationLevel * 100}%` }" :class="radiationColor"></div>
        </div>
        <p class="mt-2 text-sm" :class="radiationColor">
            {{ radiationStatus }}
        </p>
    </Card>
</template>

<script setup>
import { computed } from 'vue'
import { useReactorStore } from '../stores/reactor'
import Card from './ui/Card.vue'

const store = useReactorStore()

const radiationLevel = computed(() => store.radiationLevel)

const radiationColor = computed(() => {
    if (radiationLevel.value > 0.5) return 'text-error'
    if (radiationLevel.value > 0.2) return 'text-secondary'
    return 'text-primary'
})

const radiationStatus = computed(() => {
    if (radiationLevel.value > 0.5) return 'Critical: Dangerous radiation levels detected'
    if (radiationLevel.value > 0.2) return 'Warning: Elevated radiation levels'
    return 'Normal: Radiation within safe limits'
})
</script>