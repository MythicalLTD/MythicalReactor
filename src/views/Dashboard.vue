<template>
  <div class="p-6 space-y-6">
    <!-- Critical Status Overview -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card variant="primary" class="relative overflow-hidden">
        <div class="absolute top-0 right-0 p-4">
          <span class="text-xs text-gray-500">REACTOR POWER</span>
        </div>
        <div class="pt-8">
          <div class="text-5xl font-mono text-primary mb-2">{{ store.powerOutput?.toFixed(1) }}%</div>
          <div class="text-sm text-gray-500">Nominal Power: 3200 MWt</div>
        </div>
        <div class="mt-4 space-y-2">
          <div class="w-full h-1 bg-[#1a2233]">
            <div class="h-full bg-primary transition-all duration-500"
                 :style="{ width: `${store.powerOutput}%` }"></div>
          </div>
          <div class="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </Card>

      <Card variant="warning">
        <div class="absolute top-0 right-0 p-4">
          <span class="text-xs text-gray-500">CORE TEMPERATURE</span>
        </div>
        <div class="pt-8">
          <div class="text-5xl font-mono text-secondary mb-2">{{ store.temperature?.toFixed(1) }}°C</div>
          <div class="text-sm text-gray-500">Operating Range: 280-320°C</div>
        </div>
        <div class="space-y-1">
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">Current</span>
            <span class="text-secondary">{{ store.temperature }}°C</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">Maximum</span>
            <span class="text-error">{{ maxTemp }}°C</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">Minimum</span>
            <span class="text-blue-400">{{ minTemp }}°C</span>
          </div>
        </div>
      </Card>

      <Card variant="danger">
        <div class="absolute top-0 right-0 p-4">
          <span class="text-xs text-gray-500">COOLANT PRESSURE</span>
        </div>
        <div class="pt-8">
          <div class="text-5xl font-mono text-error mb-2">{{ store.pressure?.toFixed(1) }} MPa</div>
          <div class="text-sm text-gray-500">Normal: 14.5-15.5 MPa</div>
        </div>
      </Card>
    </div>

    <!-- Trend Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <h2 class="text-lg font-mono mb-4">Power Trend</h2>
        <Chart
          :data="powerTrendData"
          variant="primary"
          class="min-h-[300px]"
        />
      </Card>

      <Card>
        <h2 class="text-lg font-mono mb-4">Temperature Trend</h2>
        <Chart
          :data="temperatureTrendData"
          variant="warning"
          class="min-h-[300px]"
        />
      </Card>
    </div>

    <!-- System Parameters -->
    <Card>
      <h2 class="text-lg font-mono mb-4">System Parameters</h2>
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div v-for="param in systemParameters" :key="param.label" class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">{{ param.label }}</span>
            <span class="text-sm font-mono" :class="param.valueColor">
              {{ param.value }}{{ param.unit }}
            </span>
          </div>
          <div class="w-full h-1.5 bg-[#1a2233]">
            <div class="h-full transition-all duration-500"
                 :class="param.barColor"
                 :style="{ width: `${param.percentage}%` }"></div>
          </div>
        </div>
      </div>
    </Card>

    <!-- System Status -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card v-for="system in systemStatuses" :key="system.name"
            :variant="system.status === 'Normal' ? 'primary' : system.status === 'Warning' ? 'warning' : 'danger'"
            class="relative">
        <div class="absolute top-3 right-3">
          <span class="px-2 py-1 text-xs"
                :class="{
                  'bg-primary/10 text-primary': system.status === 'Normal',
                  'bg-secondary/10 text-secondary': system.status === 'Warning',
                  'bg-error/10 text-error': system.status === 'Critical'
                }">
            {{ system.status }}
          </span>
        </div>
        <div class="space-y-4">
          <h3 class="text-lg font-mono">{{ system.name }}</h3>
          <div class="space-y-2">
            <div v-for="metric in system.metrics" :key="metric.label"
                 class="flex justify-between items-center">
              <span class="text-sm text-gray-500">{{ metric.label }}</span>
              <span class="text-sm font-mono" :class="metric.valueClass">
                {{ metric.value }}{{ metric.unit }}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useReactorStore } from '@/stores/reactor'
import Card from '@/components/ui/Card.vue'
import Chart from '@/components/ui/Chart.vue'

const store = useReactorStore()

// Reactive values
const maxTemp = ref(320)
const minTemp = ref(280)

// Generate time points for initial data
function generateTimePoints(count) {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date()
    date.setSeconds(date.getSeconds() - (count - i))
    return date.toLocaleTimeString()
  })
}

// Trend data
const powerTrendData = ref({
  labels: generateTimePoints(20),
  label: 'Power Output',
  values: Array(20).fill(store.powerOutput || 80)
})

const temperatureTrendData = ref({
  labels: generateTimePoints(20),
  label: 'Core Temperature',
  values: Array(20).fill(store.temperature || 290)
})

// System parameters
const systemParameters = computed(() => [
  {
    label: 'Coolant Flow',
    value: store.coolantFlow?.toFixed(0) || 0,
    unit: ' m³/h',
    percentage: ((store.coolantFlow || 0) / 1500) * 100,
    valueColor: 'text-blue-400',
    barColor: 'bg-blue-400'
  },
  {
    label: 'Coolant Temp',
    value: store.coolantTemp?.toFixed(1) || 0,
    unit: '°C',
    percentage: ((store.coolantTemp || 0) / 300) * 100,
    valueColor: 'text-secondary',
    barColor: 'bg-secondary'
  },
  {
    label: 'System Efficiency',
    value: store.efficiency || 0,
    unit: '%',
    percentage: store.efficiency || 0,
    valueColor: 'text-primary',
    barColor: 'bg-primary'
  },
  {
    label: 'Neutron Flux',
    value: (store.neutronFlux?.[19] || 0).toFixed(1),
    unit: '%',
    percentage: store.neutronFlux?.[19] || 0,
    valueColor: 'text-green-400',
    barColor: 'bg-green-400'
  }
])

// System statuses
const systemStatuses = ref([
  {
    name: 'Primary Cooling',
    status: 'Normal',
    metrics: [
      { label: 'Flow Rate', value: '84.5', unit: ' m³/h', valueClass: 'text-primary' },
      { label: 'Pressure', value: '15.2', unit: ' MPa', valueClass: 'text-primary' },
      { label: 'Temperature', value: '295.8', unit: '°C', valueClass: 'text-primary' }
    ]
  },
  {
    name: 'Control Systems',
    status: 'Warning',
    metrics: [
      { label: 'Rod Position', value: '65.2', unit: '%', valueClass: 'text-secondary' },
      { label: 'Response Time', value: '2.1', unit: ' ms', valueClass: 'text-secondary' },
      { label: 'Deviation', value: '3.4', unit: '%', valueClass: 'text-secondary' }
    ]
  },
  {
    name: 'Emergency Systems',
    status: 'Normal',
    metrics: [
      { label: 'ECCS Status', value: 'Ready', unit: '', valueClass: 'text-primary' },
      { label: 'Backup Power', value: '100', unit: '%', valueClass: 'text-primary' },
      { label: 'Response Check', value: 'Pass', unit: '', valueClass: 'text-primary' }
    ]
  }
])

let updateInterval
onMounted(() => {
  updateInterval = setInterval(() => {
    const newTime = new Date().toLocaleTimeString()
    
    powerTrendData.value.labels = [...powerTrendData.value.labels.slice(1), newTime]
    powerTrendData.value.values = [...powerTrendData.value.values.slice(1), store.powerOutput]
    
    temperatureTrendData.value.labels = [...temperatureTrendData.value.labels.slice(1), newTime]
    temperatureTrendData.value.values = [...temperatureTrendData.value.values.slice(1), store.temperature]
  }, 2000)
})

onUnmounted(() => {
  if (updateInterval) clearInterval(updateInterval)
})
</script>