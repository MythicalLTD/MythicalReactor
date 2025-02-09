<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold font-mono text-gray-200">Operation History</h1>
        <p class="text-gray-500 mt-1">Historical Data and Trends Analysis</p>
      </div>
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <select v-model="timeRange" 
                  class="px-4 py-2 bg-[#1a2233] text-gray-400 font-mono text-sm focus:outline-none">
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button class="btn-secondary" @click="exportData">
            <Download class="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>
    </div>

    <!-- Main Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card variant="primary">
        <h2 class="text-lg font-mono mb-4">Power Output History</h2>
        <Chart
          :data="powerHistory"
          variant="primary"
          class="min-h-[300px]"
        />
      </Card>

      <Card variant="warning">
        <h2 class="text-lg font-mono mb-4">Temperature Trends</h2>
        <Chart
          :data="temperatureHistory"
          variant="warning"
          class="min-h-[300px]"
        />
      </Card>
    </div>

    <!-- Event Log -->
    <Card>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-mono">System Events</h2>
        <div class="flex items-center space-x-2">
          <input type="text" 
                 v-model="search" 
                 placeholder="Search events..."
                 class="px-3 py-1.5 bg-[#1a2233] text-gray-400 text-sm focus:outline-none">
          <select v-model="eventType"
                  class="px-3 py-1.5 bg-[#1a2233] text-gray-400 text-sm focus:outline-none">
            <option value="">All Events</option>
            <option value="SYSTEM">System</option>
            <option value="OPERATION">Operation</option>
            <option value="ALARM">Alarm</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>
      </div>
      <div class="space-y-1">
        <div v-for="event in filteredEvents" :key="event.id"
             class="p-3 bg-[#1a2233] flex items-center space-x-4">
          <span class="w-2 h-2 rounded-full"
                :class="{
                  'bg-primary': event.type === 'SYSTEM',
                  'bg-blue-400': event.type === 'OPERATION',
                  'bg-error': event.type === 'ALARM',
                  'bg-secondary': event.type === 'MAINTENANCE'
                }"></span>
          <span class="text-sm font-mono text-gray-400 w-32">{{ event.timestamp }}</span>
          <span class="text-sm font-mono w-24"
                :class="{
                  'text-primary': event.type === 'SYSTEM',
                  'text-blue-400': event.type === 'OPERATION',
                  'text-error': event.type === 'ALARM',
                  'text-secondary': event.type === 'MAINTENANCE'
                }">{{ event.type }}</span>
          <span class="text-sm text-gray-300 flex-1">{{ event.message }}</span>
          <span class="text-xs text-gray-500">{{ event.user }}</span>
        </div>
      </div>
    </Card>

    <!-- Performance Metrics -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card v-for="metric in performanceMetrics" :key="metric.name">
        <h2 class="text-lg font-mono mb-4">{{ metric.name }}</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-3xl font-mono" :class="metric.valueColor">
              {{ metric.currentValue }}{{ metric.unit }}
            </span>
            <div :class="metric.changeColor" class="flex items-center">
              <TrendingUp v-if="metric.change > 0" class="w-4 h-4 mr-1" />
              <TrendingDown v-else class="w-4 h-4 mr-1" />
              {{ Math.abs(metric.change) }}%
            </div>
          </div>
          <div class="text-sm text-gray-500">
            Average: {{ metric.average }}{{ metric.unit }}
          </div>
          <Chart
            :data="metric.history"
            :variant="metric.variant"
            class="h-32"
          />
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Download, TrendingUp, TrendingDown } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Chart from '@/components/ui/Chart.vue'

const timeRange = ref('24h')
const search = ref('')
const eventType = ref('')

// Sample data generators
const generateTimePoints = (count) => {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date()
    date.setMinutes(date.getMinutes() - (count - i))
    return date.toLocaleTimeString()
  })
}

const powerHistory = ref({
  labels: generateTimePoints(60),
  label: 'Power Output %',
  values: Array.from({ length: 60 }, () => 80 + Math.random() * 10)
})

const temperatureHistory = ref({
  labels: generateTimePoints(60),
  label: 'Temperature °C',
  values: Array.from({ length: 60 }, () => 290 + Math.random() * 20)
})

const events = ref([
  {
    id: 1,
    type: 'SYSTEM',
    timestamp: '08:45:12',
    message: 'System startup sequence completed',
    user: 'SYSTEM'
  },
  {
    id: 2,
    type: 'OPERATION',
    timestamp: '08:47:33',
    message: 'Control rod group 2 position adjusted to 65%',
    user: 'Operator'
  },
  {
    id: 3,
    type: 'ALARM',
    timestamp: '08:50:15',
    message: 'High temperature warning in core zone 4',
    user: 'SYSTEM'
  },
  {
    id: 4,
    type: 'MAINTENANCE',
    timestamp: '09:00:00',
    message: 'Scheduled sensor calibration started',
    user: 'Maintenance'
  }
])

const performanceMetrics = ref([
  {
    name: 'System Efficiency',
    currentValue: 94.5,
    unit: '%',
    change: 2.3,
    average: 93.2,
    valueColor: 'text-primary',
    changeColor: 'text-green-400',
    variant: 'primary',
    history: {
      labels: generateTimePoints(20),
      label: 'Efficiency',
      values: Array.from({ length: 20 }, () => 90 + Math.random() * 8)
    }
  },
  {
    name: 'Power Generation',
    currentValue: 2840,
    unit: 'MW',
    change: -1.2,
    average: 2900,
    valueColor: 'text-blue-400',
    changeColor: 'text-error',
    variant: 'warning',
    history: {
      labels: generateTimePoints(20),
      label: 'Power',
      values: Array.from({ length: 20 }, () => 2800 + Math.random() * 200)
    }
  },
  {
    name: 'Coolant Efficiency',
    currentValue: 96.8,
    unit: '%',
    change: 0.8,
    average: 96.2,
    valueColor: 'text-green-400',
    changeColor: 'text-green-400',
    variant: 'primary',
    history: {
      labels: generateTimePoints(20),
      label: 'Efficiency',
      values: Array.from({ length: 20 }, () => 95 + Math.random() * 3)
    }
  }
])

const filteredEvents = computed(() => {
  return events.value.filter(event => {
    const matchesSearch = event.message.toLowerCase().includes(search.value.toLowerCase())
    const matchesType = !eventType.value || event.type === eventType.value
    return matchesSearch && matchesType
  })
})

function exportData() {
  // Implement export functionality
  console.log('Exporting data...')
}

// Update data periodically
setInterval(() => {
  const newTime = new Date().toLocaleTimeString()
  
  powerHistory.value.labels = [...powerHistory.value.labels.slice(1), newTime]
  powerHistory.value.values = [...powerHistory.value.values.slice(1), 80 + Math.random() * 10]
  
  temperatureHistory.value.labels = [...temperatureHistory.value.labels.slice(1), newTime]
  temperatureHistory.value.values = [...temperatureHistory.value.values.slice(1), 290 + Math.random() * 20]
  
  performanceMetrics.value.forEach(metric => {
    metric.history.labels = [...metric.history.labels.slice(1), newTime]
    metric.history.values = [...metric.history.values.slice(1), metric.history.values[18] + (Math.random() - 0.5) * 2]
  })
}, 2000)
</script>
