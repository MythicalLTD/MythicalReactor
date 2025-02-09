<template>
    <Card>
        <h2 class="text-2xl font-bold mb-4">Core Temperature</h2>
        <div class="flex items-center justify-between mb-2">
            <span>Temperature:</span>
            <span class="text-2xl font-bold">{{ temperature.toFixed(2) }}°C</span>
        </div>
        <div class="w-full bg-gray-700 rounded-full h-2.5">
            <div class="bg-primary h-2.5 rounded-full transition-all duration-500 ease-in-out"
                :style="{ width: `${(temperature / 1000) * 100}%` }" :class="{ 'bg-error': temperature > 800 }"></div>
        </div>
    </Card>
</template>

<script setup>
import { computed } from 'vue'
import { useReactorStore } from '../stores/reactor'
import Card from './ui/Card.vue'

const store = useReactorStore()

const temperature = computed(() => store.temperature)
</script>