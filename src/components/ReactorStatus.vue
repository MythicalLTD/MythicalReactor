<template>
    <Card>
        <h2 class="text-2xl font-bold mb-4">Reactor Status</h2>
        <div class="flex items-center justify-between">
            <div class="text-4xl font-bold" :class="statusColor">
                {{ reactorStatus }}
            </div>
            <div class="text-2xl">
                Power Output: {{ powerOutput.toFixed(2) }}%
            </div>
        </div>
    </Card>
</template>

<script setup>
import { computed } from 'vue'
import { useReactorStore } from '../stores/reactor'
import Card from './ui/Card.vue'

const store = useReactorStore()

const reactorStatus = computed(() => store.reactorStatus)
const powerOutput = computed(() => store.powerOutput)

const statusColor = computed(() => {
    switch (reactorStatus.value) {
        case 'Critical':
            return 'text-error'
        case 'Warning':
            return 'text-secondary'
        default:
            return 'text-primary'
    }
})
</script>