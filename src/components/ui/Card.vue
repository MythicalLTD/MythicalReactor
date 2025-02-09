<template>
  <div :class="[
    'card relative overflow-hidden',
    variant === 'primary' ? 'border-primary/20' : '',
    variant === 'warning' ? 'border-secondary/20' : '',
    variant === 'danger' ? 'border-error/20' : '',
    variant === 'default' ? 'border-[#1a2233]' : '',
    className
  ]">
    <!-- Status Indicator -->
    <div v-if="status" class="absolute top-3 right-3 flex items-center space-x-2">
      <span class="text-xs uppercase" :class="statusColor">{{ status }}</span>
      <span class="w-2 h-2 rounded-full animate-pulse" :class="statusColor"></span>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 bg-primary rounded-full animate-ping"></div>
        <div class="w-2 h-2 bg-primary rounded-full animate-ping" style="animation-delay: 0.2s"></div>
        <div class="w-2 h-2 bg-primary rounded-full animate-ping" style="animation-delay: 0.4s"></div>
      </div>
    </div>

    <div class="p-4">
      <!-- Header -->
      <div v-if="$slots.header || title" class="mb-4 flex items-center justify-between">
        <slot name="header">
          <h3 class="text-lg font-bold font-mono">{{ title }}</h3>
        </slot>
      </div>

      <!-- Content -->
      <slot></slot>

      <!-- Footer -->
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
defineProps({
  title: String,
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'warning', 'danger'].includes(value)
  },
  status: String,
  loading: Boolean,
  className: String
})

const statusColor = computed(() => ({
  'text-primary bg-primary/10': props.variant === 'primary',
  'text-secondary bg-secondary/10': props.variant === 'warning',
  'text-error bg-error/10': props.variant === 'danger',
  'text-gray-400 bg-gray-500/10': props.variant === 'default'
}))
</script>

<style scoped>
.card {
  @apply bg-[#0d1117] border ;
  background: linear-gradient(135deg, #0d1117 0%, #0a0d12 100%);
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
}
</style>