<template>
  <button
    :class="[
      'px-4 py-2 rounded-md font-semibold transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      {
        'bg-primary text-background hover:bg-primary/90 focus:ring-primary/50': variant === 'primary',
        'bg-secondary text-background hover:bg-secondary/90 focus:ring-secondary/50': variant === 'secondary',
        'bg-error text-background hover:bg-error/90 focus:ring-error/50 animate-danger-flash': variant === 'danger',
        'opacity-50 cursor-not-allowed': disabled
      }
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <div :class="{ 'animate-shake': variant === 'danger' }">
      <slot></slot>
    </div>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger'].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['click'])
</script>

<style>
@keyframes danger-flash {
  0%, 100% { background-color: rgb(239, 68, 68); }
  50% { background-color: rgb(185, 28, 28); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
}

.animate-danger-flash {
  animation: danger-flash 1s infinite;
}

.animate-shake {
  animation: shake 0.5s infinite;
}

/* Add new emergency animation */
@keyframes emergency-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  50% { box-shadow: 0 0 20px 10px rgba(239, 68, 68, 0.2); }
}

.emergency-button {
  animation: emergency-pulse 2s infinite;
}
</style>