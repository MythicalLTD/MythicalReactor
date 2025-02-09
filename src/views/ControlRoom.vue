<template>
  <div class="p-6 space-y-6">
    <!-- Control Panel Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold font-mono text-gray-200">Reactor Control Room</h1>
        <div class="flex items-center space-x-4 mt-1">
          <p class="text-gray-500">Manual Control Interface</p>
          <div class="flex items-center space-x-2 px-3 py-1 bg-[#1a2233]">
            <span class="w-2 h-2 rounded-full animate-pulse" 
                  :class="controlMode === 'AUTO' ? 'bg-primary' : 'bg-secondary'"></span>
            <span class="text-sm font-mono" 
                  :class="controlMode === 'AUTO' ? 'text-primary' : 'text-secondary'">
              {{ controlMode }} MODE
            </span>
          </div>
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <Button variant="danger" @click="scramReactor" class="flex items-center">
          <AlertOctagon class="w-4 h-4 mr-2" />
          SCRAM
        </Button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Control Rod Panel -->
      <div class="lg:col-span-8">
        <Card class="h-full">
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-mono">Control Rod Management</h2>
              <div class="flex items-center space-x-4">
                <Button variant="secondary" @click="controlMode = 'AUTO'" 
                        :disabled="controlMode === 'AUTO'">
                  Auto Mode
                </Button>
                <Button variant="secondary" @click="controlMode = 'MANUAL'"
                        :disabled="controlMode === 'MANUAL'">
                  Manual Mode
                </Button>
              </div>
            </div>
            
            <!-- Rod Groups -->
            <div class="grid grid-cols-6 gap-4">
              <div v-for="(rod, index) in rodGroups" :key="index" 
                   class="space-y-2">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-gray-500">Rod {{ index + 1 }}</span>
                  <div class="flex items-center space-x-2">
                    <span class="font-mono" :class="getRodStatusColor(rod.position)">
                      {{ rod.position.toFixed(1) }}%
                    </span>
                    <button class="px-1 hover:bg-[#243044] rounded"
                            @click="rod.manual = !rod.manual"
                            :class="rod.manual ? 'text-secondary' : 'text-gray-500'">
                      {{ rod.manual ? 'M' : 'A' }}
                    </button>
                  </div>
                </div>
                <div class="relative h-80 bg-[#1a2233] group overflow-hidden">
                  <!-- Rod Housing Background -->
                  <div class="absolute inset-0 bg-gradient-to-b from-[#1a2233] to-[#243044]">
                    <!-- Coolant Flow Animation -->
                    <div class="absolute inset-0 opacity-10">
                      <div class="animate-flow-down h-full w-full bg-gradient-to-b from-transparent via-blue-400 to-transparent"></div>
                    </div>
                  </div>

                  <!-- Rod Body -->
                  <div class="absolute inset-x-0 bottom-0 transition-all duration-500 flex justify-center"
                       :style="{ height: `${rod.position}%` }">
                    <!-- Rod Shaft -->
                    <div class="w-4 h-full bg-gradient-to-r from-[#4a5568] via-[#718096] to-[#4a5568] relative">
                      <!-- Rod Segments -->
                      <div class="absolute inset-0 flex flex-col">
                        <div v-for="n in 8" :key="n" 
                             class="h-1/8 border-b border-[#2d3748] opacity-50"></div>
                      </div>
                      
                      <!-- Rod Glow Effect -->
                      <div class="absolute inset-0 bg-gradient-to-t"
                           :class="getRodGlowColor(rod)"
                           :style="{ opacity: rod.position / 200 }">
                      </div>
                    </div>
                    
                    <!-- Rod Head -->
                    <div class="absolute -top-4 inset-x-0 flex justify-center">
                      <div class="w-6 h-4 bg-[#718096] rounded-t-md 
                                  border-t-2 border-x-2 border-[#4a5568]"></div>
                    </div>
                  </div>

                  <!-- Rod Guide Tubes -->
                  <div class="absolute inset-x-0 h-full">
                    <div class="absolute inset-x-0 h-full border-x border-[#2d3748] mx-auto w-6"></div>
                    <div class="absolute inset-x-0 h-full flex flex-col justify-between py-4">
                      <div v-for="n in 6" :key="n" 
                           class="w-full h-1 bg-gradient-to-r from-transparent via-[#2d3748] to-transparent"></div>
                    </div>
                  </div>

                  <!-- Rod Position Markers -->
                  <div class="absolute inset-y-0 right-0 w-6 flex flex-col justify-between py-2 text-xs font-mono">
                    <span class="text-gray-500">100%</span>
                    <span class="text-gray-500">75%</span>
                    <span class="text-gray-500">50%</span>
                    <span class="text-gray-500">25%</span>
                    <span class="text-gray-500">0%</span>
                  </div>

                  <!-- Control Buttons -->
                  <div class="absolute inset-x-0 top-0 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="w-8 h-8 bg-[#243044] hover:bg-[#2d3b55] text-gray-400"
                            @click="adjustRod(index, 5)"
                            :disabled="controlMode === 'AUTO'">
                      ▲
                    </button>
                  </div>
                  <div class="absolute inset-x-0 bottom-0 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="w-8 h-8 bg-[#243044] hover:bg-[#2d3b55] text-gray-400"
                            @click="adjustRod(index, -5)"
                            :disabled="controlMode === 'AUTO'">
                      ▼
                    </button>
                  </div>

                  <!-- Quick Set Buttons -->
                  <div class="absolute left-0 inset-y-0 w-6 flex flex-col justify-between py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="w-6 h-6 bg-[#243044] hover:bg-[#2d3b55] text-xs text-gray-400"
                            @click="setRodPosition(index, 100)"
                            :disabled="controlMode === 'AUTO'">
                      100
                    </button>
                    <button class="w-6 h-6 bg-[#243044] hover:bg-[#2d3b55] text-xs text-gray-400"
                            @click="setRodPosition(index, 75)"
                            :disabled="controlMode === 'AUTO'">
                      75
                    </button>
                    <button class="w-6 h-6 bg-[#243044] hover:bg-[#2d3b55] text-xs text-gray-400"
                            @click="setRodPosition(index, 50)"
                            :disabled="controlMode === 'AUTO'">
                      50
                    </button>
                    <button class="w-6 h-6 bg-[#243044] hover:bg-[#2d3b55] text-xs text-gray-400"
                            @click="setRodPosition(index, 25)"
                            :disabled="controlMode === 'AUTO'">
                      25
                    </button>
                    <button class="w-6 h-6 bg-[#243044] hover:bg-[#2d3b55] text-xs text-gray-400"
                            @click="setRodPosition(index, 0)"
                            :disabled="controlMode === 'AUTO'">
                      0
                    </button>
                  </div>

                  <!-- Enhanced Rod Sensors -->
                  <div class="absolute left-8 inset-y-0 w-24 flex flex-col justify-between py-2 text-xs font-mono">
                    <div class="flex items-center justify-between">
                      <span class="text-gray-500">Temp:</span>
                      <span :class="getRodTempColor(rod.sensors.temperature)">
                        {{ rod.sensors.temperature }}°C
                      </span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-gray-500">Flow:</span>
                      <span :class="getFlowColor(rod.sensors.coolantFlow)">
                        {{ rod.sensors.coolantFlow }}L/s
                      </span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-gray-500">Vibr:</span>
                      <span :class="getVibrationColor(rod.sensors.vibration)">
                        {{ rod.sensors.vibration }}Hz
                      </span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-gray-500">Wear:</span>
                      <span :class="getWearColor(rod.sensors.wear)">
                        {{ rod.sensors.wear }}%
                      </span>
                    </div>
                  </div>

                  <!-- Manual Override Controls -->
                  <div v-if="rod.manual" class="absolute -right-24 top-0 bg-[#1a2233] p-2 rounded">
                    <div class="space-y-2">
                      <div class="text-xs text-gray-500">Speed</div>
                      <input type="range" 
                             v-model="rod.manualSpeed" 
                             min="0" 
                             max="100" 
                             class="w-20">
                      <div class="text-xs text-center" 
                           :class="getSpeedColor(rod.manualSpeed)">
                        {{ rod.manualSpeed }}%
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Rod Detailed Status -->
                <div class="text-xs space-y-1">
                  <div class="flex justify-between">
                    <span class="text-gray-500">Status:</span>
                    <span :class="getRodHealthColor(rod)">{{ getRodHealthStatus(rod) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Mode:</span>
                    <span :class="rod.manual ? 'text-secondary' : 'text-primary'">
                      {{ rod.manual ? 'MANUAL' : 'AUTO' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Group Controls -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <Button variant="secondary" @click="allRodsUp"
                        :disabled="controlMode === 'AUTO'">
                  All Rods Up
                </Button>
                <Button variant="secondary" @click="allRodsDown"
                        :disabled="controlMode === 'AUTO'">
                  All Rods Down
                </Button>
              </div>
              <Button variant="secondary" @click="resetRods"
                      :disabled="controlMode === 'AUTO'">
                Reset to 50%
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <!-- Status Panel -->
      <div class="lg:col-span-4 space-y-6">
        <Card variant="primary">
          <h2 class="text-lg font-mono mb-4">Reactor Response</h2>
          <div class="space-y-4">
            <div v-for="param in reactorParams" :key="param.label" 
                 class="space-y-2">
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

        <!-- Warnings Panel -->
        <Card variant="warning" v-if="warnings.length > 0">
          <h2 class="text-lg font-mono mb-4">Active Warnings</h2>
          <div class="space-y-2">
            <div v-for="warning in warnings" :key="warning.id"
                 class="p-3 bg-[#1a2233] border-l-4"
                 :class="warning.type === 'critical' ? 'border-error' : 'border-secondary'">
              <div class="flex items-center space-x-2">
                <AlertTriangle class="w-4 h-4" 
                             :class="warning.type === 'critical' ? 'text-error' : 'text-secondary'" />
                <span class="text-sm">{{ warning.message }}</span>
              </div>
            </div>
          </div>
        </Card>

        <!-- Auto Control Panel -->
        <Card class="mt-4">
          <h3 class="text-lg font-mono mb-4">Automatic Control Parameters</h3>
          <div class="grid grid-cols-3 gap-4">
            <div class="space-y-2">
              <label class="text-sm text-gray-500">Target Power</label>
              <div class="flex items-center space-x-2">
                <input type="number" 
                       v-model="autoControl.targetPower"
                       class="w-20 px-2 py-1 bg-[#1a2233] text-primary"
                       :disabled="!isAutoMode">
                <span class="text-sm text-gray-500">%</span>
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm text-gray-500">Rod Speed</label>
              <div class="flex items-center space-x-2">
                <input type="number" 
                       v-model="autoControl.rodSpeed"
                       class="w-20 px-2 py-1 bg-[#1a2233] text-primary"
                       :disabled="!isAutoMode">
                <span class="text-sm text-gray-500">%/s</span>
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm text-gray-500">Tolerance</label>
              <div class="flex items-center space-x-2">
                <input type="number" 
                       v-model="autoControl.tolerance"
                       class="w-20 px-2 py-1 bg-[#1a2233] text-primary"
                       :disabled="!isAutoMode">
                <span class="text-sm text-gray-500">%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { AlertOctagon, AlertTriangle } from 'lucide-vue-next'
import { useReactorStore } from '@/stores/reactor'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'

const store = useReactorStore()
const controlMode = ref('AUTO')

const autoControl = ref({
  targetPower: 80,
  rodSpeed: 5,
  tolerance: 2,
  enabled: true
})

const rodGroups = ref([
  ...Array(18).fill(0).map((_, i) => ({
    position: 50,
    status: 'nominal',
    manual: false,
    manualSpeed: 50,
    sensors: {
      temperature: 285 + (Math.random() - 0.5) * 5,
      coolantFlow: 12.5 + (Math.random() - 0.5),
      vibration: 0.8 + (Math.random() - 0.5) * 0.2,
      wear: 5 + Math.random() * 2
    }
  }))
])

const warnings = ref([])

// Reactor parameters computed from rod positions
const reactorParams = computed(() => {
  const avgPosition = rodGroups.value.reduce((sum, rod) => sum + rod.position, 0) / rodGroups.value.length
  return [
    {
      label: 'Reactivity',
      value: ((100 - avgPosition) * 0.8).toFixed(1),
      unit: '%',
      percentage: (100 - avgPosition) * 0.8,
      valueColor: 'text-primary',
      barColor: 'bg-primary'
    },
    {
      label: 'Power Output',
      value: (store.powerOutput).toFixed(1),
      unit: '%',
      percentage: store.powerOutput,
      valueColor: 'text-blue-400',
      barColor: 'bg-blue-400'
    },
    {
      label: 'Core Temperature',
      value: store.temperature.toFixed(1),
      unit: '°C',
      percentage: (store.temperature / 400) * 100,
      valueColor: 'text-secondary',
      barColor: 'bg-secondary'
    }
  ]
})

// Add this computed property
const isAutoMode = computed(() => controlMode.value === 'AUTO')

// Rod control functions
function adjustRod(index, amount) {
  if (controlMode.value === 'AUTO') return
  const newPosition = rodGroups.value[index].position + amount
  rodGroups.value[index].position = Math.max(0, Math.min(100, newPosition))
  updateWarnings()
}

function setRodPosition(index, position) {
  if (controlMode.value === 'AUTO') return
  rodGroups.value[index].position = position
  updateWarnings()
}

function allRodsUp() {
  if (controlMode.value === 'AUTO') return
  rodGroups.value.forEach(rod => rod.position = 100)
  updateWarnings()
}

function allRodsDown() {
  if (controlMode.value === 'AUTO') return
  rodGroups.value.forEach(rod => rod.position = 0)
  updateWarnings()
}

function resetRods() {
  if (controlMode.value === 'AUTO') return
  rodGroups.value.forEach(rod => rod.position = 50)
  updateWarnings()
}

function scramReactor() {
  controlMode.value = 'MANUAL'
  rodGroups.value.forEach(rod => rod.position = 0)
  updateWarnings()
}

// Helper functions
function getRodStatusColor(position) {
  if (position < 20) return 'text-error'
  if (position > 80) return 'text-secondary'
  return 'text-primary'
}

function getRodStatus(position) {
  if (position < 20) return 'INSERTED'
  if (position > 80) return 'WITHDRAWN'
  return 'NOMINAL'
}

function updateWarnings() {
  warnings.value = []
  const avgPosition = rodGroups.value.reduce((sum, rod) => sum + rod.position, 0) / rodGroups.value.length
  
  if (avgPosition > 90) {
    warnings.value.push({
      id: 1,
      type: 'critical',
      message: 'Critical: Control rods too far withdrawn'
    })
  } else if (avgPosition > 80) {
    warnings.value.push({
      id: 2,
      type: 'warning',
      message: 'Warning: High rod withdrawal position'
    })
  }

  if (avgPosition < 10) {
    warnings.value.push({
      id: 3,
      type: 'critical',
      message: 'Critical: Reactor shutdown imminent'
    })
  }

  // Check for uneven rod positions
  const maxDiff = Math.max(...rodGroups.value.map(rod => rod.position)) - 
                 Math.min(...rodGroups.value.map(rod => rod.position))
  if (maxDiff > 30) {
    warnings.value.push({
      id: 4,
      type: 'warning',
      message: 'Warning: Uneven control rod positions'
    })
  }
}

// New helper functions for sensor colors
function getRodTempColor(temp) {
  if (temp > 300) return 'text-error'
  if (temp > 290) return 'text-secondary'
  return 'text-primary'
}

function getFlowColor(flow) {
  if (flow < 10) return 'text-error'
  if (flow < 11) return 'text-secondary'
  return 'text-primary'
}

function getVibrationColor(vib) {
  if (vib > 1.2) return 'text-error'
  if (vib > 1.0) return 'text-secondary'
  return 'text-primary'
}

function getWearColor(wear) {
  if (wear > 20) return 'text-error'
  if (wear > 10) return 'text-secondary'
  return 'text-primary'
}

function getSpeedColor(speed) {
  if (speed > 80) return 'text-error'
  if (speed > 60) return 'text-secondary'
  return 'text-primary'
}

function getRodHealthStatus(rod) {
  const issues = []
  if (rod.sensors.temperature > 300) issues.push('HIGH TEMP')
  if (rod.sensors.coolantFlow < 10) issues.push('LOW FLOW')
  if (rod.sensors.vibration > 1.2) issues.push('HIGH VIB')
  if (rod.sensors.wear > 20) issues.push('HIGH WEAR')
  return issues.length ? issues.join(', ') : 'NORMAL'
}

function getRodHealthColor(rod) {
  if (rod.sensors.temperature > 300 || 
      rod.sensors.coolantFlow < 10 ||
      rod.sensors.vibration > 1.2 ||
      rod.sensors.wear > 20) return 'text-error'
  if (rod.sensors.temperature > 290 ||
      rod.sensors.coolantFlow < 11 ||
      rod.sensors.vibration > 1.0 ||
      rod.sensors.wear > 10) return 'text-secondary'
  return 'text-primary'
}

// Add new helper function for rod glow effects
function getRodGlowColor(rod) {
  const temp = rod.sensors.temperature
  if (temp > 300) return 'from-red-500/30'
  if (temp > 290) return 'from-yellow-500/20'
  return 'from-blue-500/10'
}

// Automatic control loop
let controlLoop
onMounted(() => {
  controlLoop = setInterval(() => {
    if (controlMode.value === 'AUTO' && autoControl.value.enabled) {
      rodGroups.value.forEach(rod => {
        if (!rod.manual) {
          const currentPower = store.powerOutput
          const diff = autoControl.value.targetPower - currentPower
          if (Math.abs(diff) > autoControl.value.tolerance) {
            const adjustment = Math.sign(diff) * autoControl.value.rodSpeed * 0.1
            rod.position = Math.max(0, Math.min(100, rod.position + adjustment))
          }
        }
      })
    }

    // Update sensor values
    rodGroups.value.forEach(rod => {
      rod.sensors.temperature = 280 + rod.position * 0.2 + (Math.random() - 0.5) * 2
      rod.sensors.coolantFlow = 12 + (Math.random() - 0.5)
      rod.sensors.vibration = 0.8 + (Math.random() - 0.5) * 0.2
      rod.sensors.wear = Math.min(100, rod.sensors.wear + 0.001)
      
      if (rod.manual) {
        const speedFactor = rod.manualSpeed / 100
        rod.position = Math.max(0, Math.min(100, rod.position + speedFactor * 0.5))
      }
    })
    
    updateWarnings()
  }, 100)
})

onUnmounted(() => {
  clearInterval(controlLoop)
})

// Watch for changes and update reactor store
watch(rodGroups, () => {
  const avgPosition = rodGroups.value.reduce((sum, rod) => sum + rod.position, 0) / rodGroups.value.length
  store.powerOutput = avgPosition * 0.8
  store.temperature = 280 + avgPosition
}, { deep: true })
</script>

<style>
@keyframes flowDown {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

.animate-flow-down {
  animation: flowDown 3s linear infinite;
}
</style>