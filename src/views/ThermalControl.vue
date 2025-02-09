<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold font-mono text-gray-200">Thermal Control</h1>
        <p class="text-gray-500 mt-1">Reactor Temperature Management System</p>
      </div>
      <div class="flex items-center space-x-4">
        <div class="px-4 py-2 bg-[#1a2233] flex items-center space-x-2">
          <span class="w-2 h-2 rounded-full animate-pulse" 
                :class="coolingStatus === 'NORMAL' ? 'bg-primary' : 'bg-error'"></span>
          <span class="text-sm font-mono" 
                :class="coolingStatus === 'NORMAL' ? 'text-primary' : 'text-error'">
            {{ coolingStatus }}
          </span>
        </div>
      </div>
    </div>

    <!-- Temperature Overview -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Core Temperature -->
      <Card variant="primary">
        <h2 class="text-lg font-mono mb-4">Core Temperature</h2>
        <div class="space-y-6">
          <div class="text-center">
            <div class="text-5xl font-mono text-primary mb-2">{{ coreTemp }}°C</div>
            <div class="text-sm text-gray-500">Operating Range: 280-320°C</div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-xs">
              <span class="text-gray-500">Current</span>
              <span class="text-primary">{{ coreTemp }}°C</span>
            </div>
            <div class="w-full h-2 bg-[#1a2233] relative">
              <div class="absolute inset-y-0 bg-error/20" style="left: 20%; right: 20%"></div>
              <div class="absolute inset-y-0 bg-primary/20" style="left: 40%; right: 40%"></div>
              <div class="absolute top-0 bottom-0 w-1 bg-primary transition-all duration-500"
                   :style="{ left: `${(coreTemp - 250) / 2}%` }"></div>
            </div>
            <div class="flex justify-between text-xs text-gray-500">
              <span>250°C</span>
              <span>300°C</span>
              <span>350°C</span>
            </div>
          </div>
        </div>
      </Card>

      <!-- Cooling Systems -->
      <Card variant="warning">
        <h2 class="text-lg font-mono mb-4">Primary Cooling Loop</h2>
        <div class="space-y-4">
          <div v-for="loop in coolingLoops" :key="loop.id" class="p-3 bg-[#1a2233]">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-400">{{ loop.name }}</span>
              <div class="flex items-center space-x-2">
                <span class="w-2 h-2 rounded-full" 
                      :class="loop.status === 'ACTIVE' ? 'bg-primary' : 'bg-error'"></span>
                <span class="text-sm font-mono" 
                      :class="loop.status === 'ACTIVE' ? 'text-primary' : 'text-error'">
                  {{ loop.status }}
                </span>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-xs">
                <span class="text-gray-500">Flow Rate</span>
                <span class="text-primary">{{ loop.flowRate }} m³/h</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-gray-500">Temperature</span>
                <span class="text-primary">{{ loop.temperature }}°C</span>
              </div>
              <div class="w-full h-1 bg-[#243044]">
                <div class="h-full bg-primary transition-all duration-500"
                     :style="{ width: `${loop.efficiency}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Heat Exchangers -->
      <Card variant="danger">
        <h2 class="text-lg font-mono mb-4">Heat Exchangers</h2>
        <div class="space-y-4">
          <div v-for="exchanger in heatExchangers" :key="exchanger.id"
               class="p-3 bg-[#1a2233]">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-400">{{ exchanger.name }}</span>
              <span class="text-sm font-mono text-primary">{{ exchanger.efficiency }}%</span>
            </div>
            <div class="grid grid-cols-2 gap-2 mb-2">
              <div class="text-center p-2 bg-[#243044]">
                <div class="text-xs text-gray-500">Input</div>
                <div class="text-sm font-mono text-primary">{{ exchanger.inputTemp }}°C</div>
              </div>
              <div class="text-center p-2 bg-[#243044]">
                <div class="text-xs text-gray-500">Output</div>
                <div class="text-sm font-mono text-primary">{{ exchanger.outputTemp }}°C</div>
              </div>
            </div>
            <div class="w-full h-1 bg-[#243044]">
              <div class="h-full bg-primary transition-all duration-500"
                   :style="{ width: `${exchanger.efficiency}%` }"></div>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Temperature Distribution -->
    <Card>
      <h2 class="text-lg font-mono mb-4">Temperature Distribution</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="zone in tempZones" :key="zone.id"
             class="p-4 bg-[#1a2233]">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-400">{{ zone.name }}</span>
            <span class="text-sm font-mono" :class="zone.status === 'Normal' ? 'text-primary' : 'text-error'">
              {{ zone.temperature }}°C
            </span>
          </div>
          <div class="w-full h-1 bg-[#243044]">
            <div class="h-full transition-all duration-500"
                 :class="zone.status === 'Normal' ? 'bg-primary' : 'bg-error'"
                 :style="{ width: `${(zone.temperature / 400) * 100}%` }"></div>
          </div>
          <div class="mt-2 text-xs text-gray-500">
            Target: {{ zone.target }}°C (±{{ zone.tolerance }}°C)
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Card from '@/components/ui/Card.vue'

const coreTemp = ref(293.5)
const coolingStatus = ref('NORMAL')

const coolingLoops = ref([
  {
    id: 1,
    name: 'Primary Loop A',
    status: 'ACTIVE',
    flowRate: 1250,
    temperature: 285,
    efficiency: 98
  },
  {
    id: 2,
    name: 'Primary Loop B',
    status: 'ACTIVE',
    flowRate: 1200,
    temperature: 288,
    efficiency: 95
  }
])

const heatExchangers = ref([
  {
    id: 1,
    name: 'Main Heat Exchanger',
    efficiency: 96,
    inputTemp: 310,
    outputTemp: 285
  },
  {
    id: 2,
    name: 'Secondary Exchanger',
    efficiency: 94,
    inputTemp: 295,
    outputTemp: 275
  }
])

const tempZones = ref([
  {
    id: 1,
    name: 'Core Zone 1',
    temperature: 295,
    target: 300,
    tolerance: 5,
    status: 'Normal'
  },
  {
    id: 2,
    name: 'Core Zone 2',
    temperature: 298,
    target: 300,
    tolerance: 5,
    status: 'Normal'
  },
  {
    id: 3,
    name: 'Core Zone 3',
    temperature: 292,
    target: 300,
    tolerance: 5,
    status: 'Normal'
  },
  {
    id: 4,
    name: 'Core Zone 4',
    temperature: 305,
    target: 300,
    tolerance: 5,
    status: 'Warning'
  }
])

// Update temperatures periodically
setInterval(() => {
  coreTemp.value += (Math.random() - 0.5) * 2
  tempZones.value = tempZones.value.map(zone => ({
    ...zone,
    temperature: zone.temperature + (Math.random() - 0.5) * 2,
    status: Math.abs(zone.temperature - zone.target) <= zone.tolerance ? 'Normal' : 'Warning'
  }))
}, 2000)
</script> 