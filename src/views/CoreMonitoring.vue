<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold font-mono text-gray-200">Core Monitoring</h1>
        <p class="text-gray-500 mt-1">Real-time reactor core parameters and trends</p>
      </div>
      <div class="flex items-center space-x-4">
        <button class="btn-secondary">
          <Download class="w-4 h-4 mr-2" />
          Export Data
        </button>
        <button class="btn-primary">
          <RefreshCw class="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Temperature Trend -->
      <Chart
        title="Core Temperature Trend"
        :data="temperatureData"
        variant="primary"
        class="min-h-[300px]"
      />

      <!-- Power Output -->
      <Chart
        title="Power Output"
        :data="powerData"
        variant="warning"
        class="min-h-[300px]"
      />

      <!-- Control Rod Positions -->
      <div class="lg:col-span-2">
        <Card title="Control Rod Positions" class="min-h-[400px]">
          <div class="grid grid-cols-5 gap-4">
            <div v-for="(rod, index) in controlRods" :key="index"
                 class="flex flex-col items-center">
              <div class="w-full h-40 bg-[#1a2233] relative overflow-hidden">
                <div class="absolute bottom-0 w-full bg-primary transition-all duration-500"
                     :style="{ height: `${rod}%`, opacity: rod / 100 }">
                </div>
                <div class="absolute inset-0 flex flex-col items-center justify-between p-2">
                  <span class="text-xs font-mono">Rod {{ index + 1 }}</span>
                  <span class="text-sm font-mono font-bold">{{ rod.toFixed(1) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Download, RefreshCw } from 'lucide-vue-next'
import Chart from '@/components/ui/Chart.vue'
import Card from '@/components/ui/Card.vue'

const controlRods = ref(Array(10).fill(50))

// Sample data for charts
const temperatureData = ref({
  labels: Array.from({ length: 20 }, (_, i) => i),
  label: 'Temperature °C',
  values: Array.from({ length: 20 }, () => 300 + Math.random() * 20)
})

const powerData = ref({
  labels: Array.from({ length: 20 }, (_, i) => i),
  label: 'Power Output %',
  values: Array.from({ length: 20 }, () => 80 + Math.random() * 10)
})

onMounted(() => {
  // Simulate real-time updates
  setInterval(() => {
    temperatureData.value.values = [
      ...temperatureData.value.values.slice(1),
      300 + Math.random() * 20
    ]
    powerData.value.values = [
      ...powerData.value.values.slice(1),
      80 + Math.random() * 10
    ]
  }, 2000)
})
</script>
