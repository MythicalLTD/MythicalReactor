<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold font-mono text-gray-200">Safety Systems</h1>
        <p class="text-gray-500 mt-1">Emergency and Safety Control Systems</p>
      </div>
      <div class="flex items-center space-x-4">
        <div class="px-4 py-2 bg-[#1a2233] flex items-center space-x-2">
          <span class="w-2 h-2 rounded-full" :class="systemStatusColor"></span>
          <span class="text-sm font-mono" :class="systemStatusColor">{{ safetyStatus }}</span>
        </div>
        <button class="btn-primary" @click="testSafetySystems">
          Run Safety Test
        </button>
      </div>
    </div>

    <!-- ECCS Status -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card variant="primary">
        <h2 class="text-lg font-mono mb-4">Emergency Core Cooling System</h2>
        <div class="space-y-4">
          <div v-for="(system, index) in eccsSystems" :key="index"
               class="p-3 bg-[#1a2233]">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-400">{{ system.name }}</span>
              <div class="flex items-center space-x-2">
                <span class="w-2 h-2 rounded-full" 
                      :class="system.status === 'READY' ? 'bg-primary' : 'bg-error'"></span>
                <span class="text-sm font-mono" 
                      :class="system.status === 'READY' ? 'text-primary' : 'text-error'">
                  {{ system.status }}
                </span>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-xs">
                <span class="text-gray-500">Pressure</span>
                <span class="text-primary">{{ system.pressure }} MPa</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-gray-500">Flow Rate</span>
                <span class="text-primary">{{ system.flowRate }} m³/h</span>
              </div>
              <div class="w-full h-1 bg-[#243044]">
                <div class="h-full bg-primary transition-all duration-500"
                     :style="{ width: `${system.readiness}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Containment Systems -->
      <Card variant="warning">
        <h2 class="text-lg font-mono mb-4">Containment Systems</h2>
        <div class="space-y-4">
          <div v-for="(system, index) in containmentSystems" :key="index"
               class="p-3 bg-[#1a2233]">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-400">{{ system.name }}</span>
              <span class="text-sm font-mono" :class="system.statusColor">
                {{ system.integrity }}%
              </span>
            </div>
            <div class="w-full h-1 bg-[#243044]">
              <div class="h-full transition-all duration-500"
                   :class="system.statusColor"
                   :style="{ width: `${system.integrity}%` }"></div>
            </div>
            <div class="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div class="p-2 bg-[#243044]">
                <span class="text-gray-500">Pressure</span>
                <div class="text-secondary">{{ system.pressure }} kPa</div>
              </div>
              <div class="p-2 bg-[#243044]">
                <span class="text-gray-500">Temperature</span>
                <div class="text-secondary">{{ system.temperature }}°C</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Emergency Power -->
      <Card variant="danger">
        <h2 class="text-lg font-mono mb-4">Emergency Power Systems</h2>
        <div class="space-y-4">
          <div v-for="(system, index) in powerSystems" :key="index"
               class="p-3 bg-[#1a2233]">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-400">{{ system.name }}</span>
              <div class="flex items-center space-x-2">
                <span class="w-2 h-2 rounded-full" 
                      :class="system.online ? 'bg-primary animate-pulse' : 'bg-error'"></span>
                <span class="text-sm font-mono" 
                      :class="system.online ? 'text-primary' : 'text-error'">
                  {{ system.online ? 'ONLINE' : 'STANDBY' }}
                </span>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-xs">
                <span class="text-gray-500">Load</span>
                <span :class="system.online ? 'text-primary' : 'text-gray-400'">
                  {{ system.load }}%
                </span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-gray-500">Fuel</span>
                <span :class="system.online ? 'text-primary' : 'text-gray-400'">
                  {{ system.fuel }}%
                </span>
              </div>
              <div class="w-full h-1 bg-[#243044]">
                <div class="h-full transition-all duration-500"
                     :class="system.online ? 'bg-primary' : 'bg-gray-600'"
                     :style="{ width: `${system.readiness}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Safety Parameters -->
    <Card>
      <h2 class="text-lg font-mono mb-4">Safety Parameters</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="param in safetyParameters" :key="param.name"
             class="p-4 bg-[#1a2233]">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-400">{{ param.name }}</span>
            <span class="text-sm font-mono" :class="param.valueColor">
              {{ param.value }}{{ param.unit }}
            </span>
          </div>
          <div class="w-full h-1 bg-[#243044]">
            <div class="h-full transition-all duration-500"
                 :class="param.barColor"
                 :style="{ width: `${param.percentage}%` }"></div>
          </div>
          <div class="mt-2 text-xs text-gray-500">
            Limit: {{ param.limit }}{{ param.unit }}
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Card from '@/components/ui/Card.vue'

const safetyStatus = ref('SYSTEMS NOMINAL')
const systemStatusColor = computed(() => 'text-primary')

const eccsSystems = ref([
  {
    name: 'High Pressure Injection',
    status: 'READY',
    pressure: 15.2,
    flowRate: 850,
    readiness: 98
  },
  {
    name: 'Low Pressure Injection',
    status: 'READY',
    pressure: 8.5,
    flowRate: 1200,
    readiness: 95
  },
  {
    name: 'Core Spray System',
    status: 'READY',
    pressure: 12.8,
    flowRate: 680,
    readiness: 97
  }
])

const containmentSystems = ref([
  {
    name: 'Primary Containment',
    integrity: 98,
    pressure: 101.3,
    temperature: 35,
    statusColor: 'text-primary'
  },
  {
    name: 'Secondary Containment',
    integrity: 99,
    pressure: 101.1,
    temperature: 28,
    statusColor: 'text-primary'
  }
])

const powerSystems = ref([
  {
    name: 'Diesel Generator 1',
    online: true,
    load: 15,
    fuel: 92,
    readiness: 100
  },
  {
    name: 'Diesel Generator 2',
    online: false,
    load: 0,
    fuel: 100,
    readiness: 100
  },
  {
    name: 'Battery Backup',
    online: true,
    load: 5,
    fuel: 95,
    readiness: 95
  }
])

const safetyParameters = ref([
  {
    name: 'Radiation Shielding',
    value: 98.5,
    unit: '%',
    limit: '> 95',
    percentage: 98.5,
    valueColor: 'text-primary',
    barColor: 'bg-primary'
  },
  {
    name: 'Containment Pressure',
    value: 101.3,
    unit: ' kPa',
    limit: '< 110',
    percentage: 92,
    valueColor: 'text-primary',
    barColor: 'bg-primary'
  },
  {
    name: 'Emergency Cooling',
    value: 95,
    unit: '%',
    limit: '> 90',
    percentage: 95,
    valueColor: 'text-primary',
    barColor: 'bg-primary'
  },
  {
    name: 'Backup Power',
    value: 100,
    unit: '%',
    limit: '> 90',
    percentage: 100,
    valueColor: 'text-primary',
    barColor: 'bg-primary'
  }
])

function testSafetySystems() {
  // Implement safety systems test logic
}
</script>
