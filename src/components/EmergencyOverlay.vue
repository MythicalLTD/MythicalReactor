<template>
  <div v-if="store.isScramActive" 
       class="fixed inset-0 bg-error/20 z-50 pointer-events-none">
    <div class="absolute inset-x-0 top-0 bg-error/90 text-white py-4 animate-bounce">
      <div class="container mx-auto px-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <AlertTriangle class="w-8 h-8 animate-pulse" />
            <div>
              <h2 class="text-2xl font-bold font-mono">EMERGENCY SHUTDOWN IN PROGRESS</h2>
              <p class="text-sm">SCRAM initiated at {{ formatTime(store.scramTimestamp) }}</p>
            </div>
          </div>
          <div class="text-3xl font-mono font-bold animate-pulse">
            {{ shutdownTimer }}s
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'
import { useReactorStore } from '../stores/reactor'

const store = useReactorStore()
const timer = ref(0)

const shutdownTimer = computed(() => {
  if (!store.scramTimestamp) return '0'
  return ((new Date() - store.scramTimestamp) / 1000).toFixed(1)
})

function formatTime(date) {
  if (!date) return ''
  return date.toLocaleTimeString()
}

onMounted(() => {
  setInterval(() => {
    if (store.isScramActive) {
      timer.value++
    }
  }, 1000)
})
</script> 