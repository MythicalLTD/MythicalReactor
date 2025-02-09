<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold font-mono text-gray-200">Alarms & Alerts</h1>
        <p class="text-gray-500 mt-1">System Warnings and Critical Alerts</p>
      </div>
      <div class="flex items-center space-x-4">
        <div class="px-4 py-2 bg-[#1a2233] flex items-center space-x-2">
          <span class="w-2 h-2 rounded-full animate-pulse bg-error"></span>
          <span class="text-sm font-mono text-error">2 ACTIVE ALARMS</span>
        </div>
        <button class="btn-secondary" @click="acknowledgeAll">
          Acknowledge All
        </button>
      </div>
    </div>

    <!-- Active Alarms -->
    <Card variant="danger">
      <h2 class="text-lg font-mono mb-4">Active Alarms</h2>
      <div class="space-y-2">
        <div v-for="alarm in activeAlarms" :key="alarm.id"
             class="p-3 bg-[#1a2233] border-l-4"
             :class="{
               'border-error animate-pulse': alarm.severity === 'CRITICAL',
               'border-secondary': alarm.severity === 'WARNING'
             }">
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center space-x-2">
                <span class="text-sm font-mono" 
                      :class="alarm.severity === 'CRITICAL' ? 'text-error' : 'text-secondary'">
                  {{ alarm.severity }}
                </span>
                <span class="text-sm font-mono text-gray-400">{{ alarm.code }}</span>
              </div>
              <p class="text-gray-300 mt-1">{{ alarm.message }}</p>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-xs text-gray-500">{{ alarm.time }}</span>
              <button class="px-3 py-1 bg-[#243044] hover:bg-[#2d3b55] text-gray-400 text-sm"
                      @click="acknowledgeAlarm(alarm.id)">
                ACK
              </button>
            </div>
          </div>
          <div class="mt-2 flex items-center space-x-4 text-xs text-gray-500">
            <span>System: {{ alarm.system }}</span>
            <span>Location: {{ alarm.location }}</span>
            <span>Value: {{ alarm.value }}{{ alarm.unit }}</span>
          </div>
        </div>
      </div>
    </Card>

    <!-- Alarm History -->
    <Card>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-mono">Alarm History</h2>
        <div class="flex items-center space-x-2">
          <input type="text" 
                 v-model="search" 
                 placeholder="Search alarms..."
                 class="px-3 py-1.5 bg-[#1a2233] text-gray-400 text-sm focus:outline-none">
          <select v-model="filterSeverity"
                  class="px-3 py-1.5 bg-[#1a2233] text-gray-400 text-sm focus:outline-none">
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="WARNING">Warning</option>
            <option value="INFO">Info</option>
          </select>
        </div>
      </div>
      <div class="space-y-1">
        <div v-for="alarm in filteredHistory" :key="alarm.id"
             class="p-2 bg-[#1a2233] flex items-center justify-between hover:bg-[#243044] transition-colors">
          <div class="flex items-center space-x-4">
            <span class="w-2 h-2 rounded-full"
                  :class="{
                    'bg-error': alarm.severity === 'CRITICAL',
                    'bg-secondary': alarm.severity === 'WARNING',
                    'bg-blue-400': alarm.severity === 'INFO'
                  }"></span>
            <span class="text-sm font-mono text-gray-400">{{ alarm.code }}</span>
            <span class="text-sm text-gray-300">{{ alarm.message }}</span>
          </div>
          <span class="text-xs text-gray-500">{{ alarm.time }}</span>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Card from '@/components/ui/Card.vue'

const search = ref('')
const filterSeverity = ref('')

const activeAlarms = ref([
  {
    id: 1,
    severity: 'CRITICAL',
    code: 'TEMP-001',
    message: 'Core temperature exceeding operational limits',
    system: 'Primary Cooling',
    location: 'Core Section A2',
    value: 342.5,
    unit: '°C',
    time: '08:42:15'
  },
  {
    id: 2,
    severity: 'WARNING',
    code: 'PRES-003',
    message: 'Secondary loop pressure deviation detected',
    system: 'Secondary Cooling',
    location: 'Loop 2',
    value: 16.2,
    unit: ' MPa',
    time: '08:43:22'
  }
])

const alarmHistory = ref([
  {
    id: 3,
    severity: 'INFO',
    code: 'SYS-045',
    message: 'Routine sensor calibration completed',
    time: '08:30:00'
  },
  {
    id: 4,
    severity: 'WARNING',
    code: 'RAD-002',
    message: 'Minor radiation level increase in containment area',
    time: '08:15:33'
  },
  {
    id: 5,
    severity: 'CRITICAL',
    code: 'COOL-007',
    message: 'Coolant flow rate below minimum threshold',
    time: '08:12:45'
  }
])

const filteredHistory = computed(() => {
  return alarmHistory.value.filter(alarm => {
    const matchesSearch = alarm.message.toLowerCase().includes(search.value.toLowerCase()) ||
                         alarm.code.toLowerCase().includes(search.value.toLowerCase())
    const matchesSeverity = !filterSeverity.value || alarm.severity === filterSeverity.value
    return matchesSearch && matchesSeverity
  })
})

function acknowledgeAlarm(id) {
  activeAlarms.value = activeAlarms.value.filter(alarm => alarm.id !== id)
  // Add to history
  const alarm = activeAlarms.value.find(a => a.id === id)
  if (alarm) {
    alarmHistory.value.unshift({
      ...alarm,
      message: `[ACKNOWLEDGED] ${alarm.message}`
    })
  }
}

function acknowledgeAll() {
  activeAlarms.value.forEach(alarm => {
    alarmHistory.value.unshift({
      ...alarm,
      message: `[ACKNOWLEDGED] ${alarm.message}`
    })
  })
  activeAlarms.value = []
}
</script>
