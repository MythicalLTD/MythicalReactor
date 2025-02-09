<template>
    <Card>
        <h2 class="text-2xl font-bold mb-4">Reactor Efficiency</h2>
        <div class="flex items-center justify-between mb-2">
            <span>Efficiency:</span>
            <span class="text-2xl font-bold" :class="efficiencyColor">{{ efficiency.toFixed(2) }}%</span>
        </div>
        <div class="w-full bg-gray-700 rounded-full h-2.5">
            <div class="bg-primary h-2.5 rounded-full transition-all duration-500 ease-in-out"
                :style="{ width: `${efficiency}%` }" :class="efficiencyColor"></div>
        </div>
    </Card>
</template>

<script setup>
import { computed } from 'vue'
import { useReactorStore } from '../stores/reactor'
import Card from './ui/Card.vue'

const store = useReactorStore()

const efficiency = computed(() => store.efficiency)

const efficiencyColor = computed(() => {
    if (efficiency.value > 90) return 'text-primary'
    if (efficiency.value > 75) return 'text-secondary'
    return 'text-error'
})
</script>