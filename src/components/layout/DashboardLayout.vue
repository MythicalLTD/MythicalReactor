<template>
  <div class="flex h-screen bg-[#080b11]">
    <EmergencyOverlay />
    <!-- Sidebar -->
    <div class="w-80 bg-[#0a0d12] border-r border-[#1a2233] flex flex-col">
      <div class="p-6 border-b border-[#1a2233] flex items-center space-x-3 glow-primary">
        <div class="relative">
          <Radiation class="w-8 h-8 text-primary" />
          <div class="absolute -top-1 -right-1 w-3 h-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </div>
        </div>
        <div>
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-primary font-mono">РВПК-1000</h1>
            <div class="ml-2 px-2 py-0.5 bg-primary/10 text-xs text-primary">ACTIVE</div>
          </div>
          <div class="flex items-center space-x-2 mt-1">
            <span class="text-xs text-gray-500">Reactor Unit №3</span>
            <span class="w-1 h-1 rounded-full bg-primary"></span>
            <span class="text-xs text-gray-500">PWR Control v2.1</span>
          </div>
        </div>
      </div>
      
      <!-- Critical Parameters -->
      <div class="p-4 border-b border-[#1a2233]">
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-[#0d1117] p-3 border border-[#1a2233]">
            <div class="text-xs text-gray-500 mb-1">Core Temperature</div>
            <div class="text-2xl font-mono text-primary">{{ store.temperature.toFixed(1) }}°C</div>
            <div class="text-xs text-gray-400">Nominal Range: 280-320°C</div>
          </div>
          <div class="bg-[#0d1117] p-3 border border-[#1a2233]">
            <div class="text-xs text-gray-500 mb-1">Reactor Power</div>
            <div class="text-2xl font-mono text-primary">{{ store.powerOutput.toFixed(1) }}%</div>
            <div class="text-xs text-gray-400">Thermal: 3200 MWt</div>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 overflow-y-auto">
        <div class="space-y-1">
          <router-link v-for="route in routes" :key="route.path"
            :to="route.path"
            class="flex items-center px-4 py-3 text-gray-400 hover:bg-[#1a2233] transition-colors group relative"
            :class="{ 'bg-[#1a2233] text-primary glow-primary': $route.path === route.path }">
            <component :is="route.icon" class="w-5 h-5 mr-3" />
            {{ route.name }}
            <div v-if="route.alert" 
                 class="ml-auto px-2 py-1 text-xs rounded-full bg-error/20 text-error animate-pulse">
              {{ route.alert }}
            </div>
            <div class="absolute left-0 w-1 h-full rounded-r bg-primary opacity-0 transition-opacity"
                 :class="{ 'opacity-100': $route.path === route.path }">
            </div>
          </router-link>
        </div>
      </nav>

      <!-- System Status -->
      <div class="p-4 border-t border-[#1a2233] space-y-4 bg-[#0d1117]">
        <div class="text-xs text-gray-500 uppercase font-mono">System Status</div>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <Activity class="w-4 h-4" :class="systemStatus.color" />
              <span class="text-sm font-mono">REACTOR STATUS</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="w-2 h-2 rounded-full" :class="systemStatus.dotColor"></span>
              <span class="text-sm font-mono" :class="systemStatus.color">{{ systemStatus.status }}</span>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <Cpu class="w-4 h-4 text-blue-400" />
              <span class="text-sm font-mono">CORE LOAD</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-20 h-1.5 bg-[#1a2233] rounded-full overflow-hidden">
                <div class="h-full bg-blue-400 transition-all duration-500"
                     :style="{ width: `${store.efficiency}%` }"></div>
              </div>
              <span class="text-sm font-mono text-blue-400">{{ store.efficiency }}%</span>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <Timer class="w-4 h-4 text-green-400" />
              <span class="text-sm font-mono">UPTIME</span>
            </div>
            <span class="text-sm font-mono text-green-400">
              {{ store.uptime.days }}d {{ store.uptime.hours }}h {{ store.uptime.minutes }}m
            </span>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <Thermometer class="w-4 h-4 text-secondary" />
              <span class="text-sm font-mono">COOLANT TEMP</span>
            </div>
            <span class="text-sm font-mono text-secondary">{{ store.coolantTemp.toFixed(1) }}°C</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden bg-[#0c1016]">
      <!-- Top Bar -->
      <header class="h-16 bg-[#0a0d12] border-b border-[#1a2233] flex items-center justify-between px-6">
        <div class="flex items-center space-x-6">
          <div class="flex items-center space-x-2">
            <div class="relative">
              <span class="w-3 h-3 rounded-full bg-primary inline-block"></span>
              <span class="animate-ping absolute top-0 left-0 w-3 h-3 rounded-full bg-primary opacity-75"></span>
            </div>
            <span class="text-sm text-primary font-mono">LIVE DATA</span>
          </div>
          <div class="h-6 w-px bg-[#1a2233]"></div>
          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-400 font-mono">
              <span class="text-gray-500">UTC:</span> {{ currentUTC }}
            </div>
            <div class="text-sm text-gray-400 font-mono">
              <span class="text-gray-500">LOCAL:</span> {{ currentTime }}
            </div>
          </div>
        </div>

        <div class="flex items-center space-x-6">
          <!-- Alerts -->
          <div v-if="hasWarnings" class="flex items-center space-x-2 px-3 py-1.5 bg-error/10 rounded-full">
            <AlertCircle class="w-4 h-4 text-error animate-pulse" />
            <span class="text-sm text-error font-mono">2 ACTIVE ALERTS</span>
          </div>

          <!-- Quick Actions -->
          <div class="flex items-center space-x-2">
            <button class="p-2 bg-[#1a2233] hover:bg-[#243044] transition-colors">
              <Bell class="w-5 h-5 text-gray-400" />
            </button>
            <button class="p-2 bg-[#1a2233] hover:bg-[#243044] transition-colors">
              <MessageSquare class="w-5 h-5 text-gray-400" />
            </button>
            <div class="w-px h-6 bg-[#1a2233]"></div>
            <button class="flex items-center space-x-2 px-3 py-2 bg-[#1a2233] hover:bg-[#243044] transition-colors">
              <User2 class="w-5 h-5 text-gray-400" />
              <span class="text-sm text-gray-400">Operator</span>
            </button>
          </div>

          <!-- Emergency Shutdown -->
          <div v-if="store.isScramActive" 
               class="flex items-center space-x-2 px-3 py-1.5 bg-error/10 rounded-full animate-pulse">
            <AlertTriangle class="w-4 h-4 text-error" />
            <span class="text-sm text-error font-mono">EMERGENCY SHUTDOWN IN PROGRESS</span>
          </div>
        </div>
      </header>

      <!-- Content Area -->
      <main class="flex-1 overflow-auto grid-bg">
        <router-view></router-view>
      </main>

      <!-- Footer Status Bar -->
      <footer class="h-8 bg-[#0a0d12] border-t border-[#1a2233] px-4 flex items-center justify-between">
        <div class="flex items-center space-x-4 text-xs text-gray-500">
          <span>Build: 2024.03.1</span>
          <span>Protocol: RBMK-P</span>
          <span>Sensors: OK</span>
        </div>
        <div class="flex items-center space-x-4 text-xs">
          <span class="text-primary">● Recording</span>
          <span class="text-blue-400">● Monitoring</span>
          <span class="text-green-400">● Connected</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useReactorStore } from '@/stores/reactor'
import { 
  Activity, AlertCircle, Bell, Cpu, MessageSquare,
  Radiation, Timer, User2, 
  LayoutDashboard, Gauge, AlertTriangle,
  Settings, History, FileText, 
  BarChart3, Shield, Thermometer
} from 'lucide-vue-next'
import EmergencyOverlay from '../EmergencyOverlay.vue'

const router = useRouter()
const route = useRoute()
const store = useReactorStore()
const currentTime = ref(new Date().toLocaleTimeString())
const currentUTC = ref(new Date().toUTCString().split(' ')[4])

const routes = [
  { path: '/', name: 'Overview', icon: LayoutDashboard },
  { path: '/controls', name: 'Control Room', icon: Gauge },
  { path: '/alarms', name: 'Alarms & Alerts', icon: AlertTriangle, alert: '2' },
  { path: '/monitoring', name: 'Core Monitoring', icon: BarChart3 },
  { path: '/safety', name: 'Safety Systems', icon: Shield },
  { path: '/thermal', name: 'Thermal Control', icon: Thermometer },
  { path: '/history', name: 'History', icon: History },
  { path: '/reports', name: 'Reports', icon: FileText },
  { path: '/reactor', name: 'Reactor View', icon: History },
]

const systemStatus = computed(() => {
  if (store.reactorStatus === 'Critical') {
    return { 
      status: 'CRITICAL', 
      color: 'text-error',
      dotColor: 'bg-error animate-pulse'
    }
  }
  if (store.reactorStatus === 'Warning') {
    return { 
      status: 'WARNING', 
      color: 'text-secondary',
      dotColor: 'bg-secondary animate-pulse'
    }
  }
  return { 
    status: 'NOMINAL', 
    color: 'text-primary',
    dotColor: 'bg-primary'
  }
})

const hasWarnings = computed(() => store.reactorStatus !== 'Normal')

onMounted(() => {
  setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString()
    currentUTC.value = new Date().toUTCString().split(' ')[4]
  }, 1000)

  setInterval(() => {
    store.updateParameters()
  }, 1000)
})
</script>

<style>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #0a0d12;
}

::-webkit-scrollbar-thumb {
  background: #1a2233;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #243044;
}

/* Grid background */
.grid-bg {
  background-image: 
    radial-gradient(circle at 1px 1px, rgba(26, 34, 51, 0.3) 1px, transparent 1px);
  background-size: 32px 32px;
}
</style> 