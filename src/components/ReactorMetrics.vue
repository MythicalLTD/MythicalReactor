<template>
    <Card class="h-full">
        <h2 class="text-2xl font-bold mb-4">Real-time Metrics</h2>
        <div class="space-y-4">
            <div v-for="(metric, index) in metrics" :key="index" 
                 class="bg-gray-800 p-4">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm text-gray-400">{{ metric.label }}</span>
                    <span class="text-lg font-bold" :class="metric.color">
                        {{ metric.value }}{{ metric.unit }}
                    </span>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-1.5">
                    <div class="h-1.5 rounded-full transition-all duration-500"
                         :class="metric.color"
                         :style="{ width: `${metric.percentage}%` }">
                    </div>
                </div>
            </div>
        </div>
    </Card>
</template>

<script setup>
import { computed } from 'vue'
import { useReactorStore } from '@/stores/reactor'
import Card from './ui/Card.vue'

const store = useReactorStore()

const metrics = computed(() => [
    {
        label: 'Core Stability',
        value: ((100 - Math.abs(store.temperature - 500)) / 100 * 100).toFixed(1),
        unit: '%',
        percentage: (100 - Math.abs(store.temperature - 500)) / 100 * 100,
        color: 'text-primary'
    },
    {
        label: 'Power Generation',
        value: store.powerOutput.toFixed(1),
        unit: '%',
        percentage: store.powerOutput,
        color: 'text-blue-400'
    },
    {
        label: 'System Efficiency',
        value: store.efficiency.toFixed(1),
        unit: '%',
        percentage: store.efficiency,
        color: 'text-green-400'
    },
    {
        label: 'Coolant Flow',
        value: (store.coolantFlow / 12).toFixed(1),
        unit: ' m³/s',
        percentage: (store.coolantFlow - 800) / 4,
        color: 'text-cyan-400'
    }
])
</script> 