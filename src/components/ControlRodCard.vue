<template>
    <Card>
        <h2 class="text-2xl font-bold mb-4">Control Rod Management</h2>
        <div class="flex items-center justify-between mb-2">
            <span>Insertion:</span>
            <span class="text-2xl font-bold">{{ controlRodInsertion.toFixed(2) }}%</span>
        </div>
        <div class="w-full bg-gray-700 rounded-full h-2.5">
            <div class="bg-primary h-2.5 rounded-full transition-all duration-500 ease-in-out"
                :style="{ width: `${controlRodInsertion}%` }"></div>
        </div>
        <div class="mt-4">
            <label for="rod-control" class="block text-sm font-medium mb-2">Adjust Control Rod Insertion</label>
            <input id="rod-control" type="range" min="0" max="100" step="1" v-model="localControlRodInsertion"
                class="w-full" @input="updateControlRodInsertion" />
        </div>
        <div class="mt-4">
            <Button @click="initiateScram" variant="danger" class="w-full">SCRAM</Button>
        </div>
    </Card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useReactorStore } from '../stores/reactor'
import Card from './ui/Card.vue'
import Button from './ui/Button.vue'

const store = useReactorStore()

const controlRodInsertion = computed(() => store.controlRodInsertion)
const localControlRodInsertion = ref(controlRodInsertion.value)

function updateControlRodInsertion() {
    store.controlRodInsertion = localControlRodInsertion.value
}

function initiateScram() {
    store.controlRodInsertion = 100
    localControlRodInsertion.value = 100
    // Add any additional SCRAM procedures here
}
</script>