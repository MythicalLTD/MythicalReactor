import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useReactorStore = defineStore('reactor', () => {
    // Core parameters
    const powerOutput = ref(80)
    const temperature = ref(293.5)
    const pressure = ref(15.2)
    const reactorStatus = ref('Normal')
    const startTime = ref(new Date())
    
    // Coolant parameters
    const coolantFlow = ref(1250)
    const coolantTemp = ref(285)
    const coolantPressure = ref(12.8)
    
    // Neutron flux data
    const neutronFlux = ref(Array(20).fill(0).map(() => 80 + Math.random() * 10))
    
    // Add rodGroups to the store
    const rodGroups = ref(Array(16).fill(0).map(() => ({
        position: 50,
        manual: false,
        status: 'nominal'
    })))
    
    // Computed values
    const efficiency = computed(() => (powerOutput.value * 0.95).toFixed(1))
    const uptime = computed(() => {
        const diff = new Date() - startTime.value
        const days = Math.floor(diff / (24 * 3600000))
        const hours = Math.floor((diff % (24 * 3600000)) / 3600000)
        const minutes = Math.floor((diff % 3600000) / 60000)
        const seconds = Math.floor((diff % 60000) / 1000)
        return {
            days,
            hours,
            minutes,
            seconds,
            formatted: `${days}d ${hours}h ${minutes}m ${seconds}s`
        }
    })

    // Simulated data updates
    function updateParameters() {
        // Power fluctuations
        powerOutput.value += (Math.random() - 0.5) * 2
        powerOutput.value = Math.max(0, Math.min(100, powerOutput.value))

        // Temperature variations
        temperature.value += (Math.random() - 0.5) * 0.5
        temperature.value = Math.max(280, Math.min(320, temperature.value))

        // Pressure changes
        pressure.value += (Math.random() - 0.5) * 0.1
        pressure.value = Math.max(14, Math.min(16, pressure.value))

        // Coolant parameters
        coolantFlow.value += (Math.random() - 0.5) * 10
        coolantFlow.value = Math.max(1000, Math.min(1500, coolantFlow.value))
        
        coolantTemp.value += (Math.random() - 0.5) * 0.3
        coolantTemp.value = Math.max(280, Math.min(290, coolantTemp.value))
        
        coolantPressure.value += (Math.random() - 0.5) * 0.05
        coolantPressure.value = Math.max(12, Math.min(13.5, coolantPressure.value))

        // Neutron flux updates
        neutronFlux.value = [
            ...neutronFlux.value.slice(1),
            powerOutput.value + (Math.random() - 0.5) * 5
        ]

        // Update reactor status based on parameters
        updateReactorStatus()
    }

    function updateReactorStatus() {
        if (temperature.value > 310 || pressure.value > 15.8) {
            reactorStatus.value = 'Critical'
        } else if (temperature.value > 300 || pressure.value > 15.5) {
            reactorStatus.value = 'Warning'
        } else {
            reactorStatus.value = 'Normal'
        }
    }

    // Reset function for emergency situations
    function resetReactor() {
        powerOutput.value = 0
        temperature.value = 280
        pressure.value = 14.5
        coolantFlow.value = 1250
        coolantTemp.value = 285
        coolantPressure.value = 12.8
        reactorStatus.value = 'Normal'
        startTime.value = new Date()
    }

    // New state properties
    const isScramActive = ref(false)
    const scramTimestamp = ref(null)

    // New actions
    function initiateScram() {
        isScramActive.value = true
        scramTimestamp.value = new Date()
        reactorStatus.value = 'EMERGENCY SHUTDOWN'
        
        // Rapidly decrease values
        const scramInterval = setInterval(() => {
            powerOutput.value = Math.max(0, powerOutput.value * 0.8)
            temperature.value = Math.max(280, temperature.value - 5)
            pressure.value = Math.max(14, pressure.value - 0.2)
            efficiency.value = Math.max(0, efficiency.value * 0.8)
            coolantFlow.value = Math.min(2000, coolantFlow.value * 1.2)
            
            if (powerOutput.value < 0.1) {
                clearInterval(scramInterval)
                powerOutput.value = 0
                reactorStatus.value = 'SHUTDOWN COMPLETE'
            }
        }, 500)
    }

    return {
        powerOutput,
        temperature,
        pressure,
        reactorStatus,
        coolantFlow,
        coolantTemp,
        coolantPressure,
        neutronFlux,
        efficiency,
        uptime,
        updateParameters,
        resetReactor,
        rodGroups,
        isScramActive,
        scramTimestamp,
        initiateScram
    }
})