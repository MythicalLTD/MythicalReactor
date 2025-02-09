<template>
    <Card>
        <h2 class="text-2xl font-bold mb-4">Neutron Flux</h2>
        <div class="flex items-center justify-between mb-2">
            <span>Flux:</span>
            <span class="text-2xl font-bold">{{ neutronFlux.toExponential(2) }} n/cm²·s</span>
        </div>
        <div class="w-full bg-gray-700 rounded-full h-2.5">
            <div class="bg-primary h-2.5 rounded-full transition-all duration-500 ease-in-out"
                :style="{ width: `${(neutronFlux / 5e14) * 100}%` }"></div>
        </div>
        <p class="mt-2 text-sm">
            Current flux is {{ fluxStatus }}
        </p>
    </Card>
</template>

<script setup>
import { computed } from 'vue'
import { useReactorStore } from '../stores/reactor'
import Card from './ui/Card.vue'

const store = useReactorStore()

const neutronFlux = computed(() => store.neutronFlux)

const fluxStatus = computed(() => {
    if (neutronFlux.value > 4e14) return 'high'
    if (neutronFlux.value < 1e14) return 'low'
    return 'normal'
})
</script>