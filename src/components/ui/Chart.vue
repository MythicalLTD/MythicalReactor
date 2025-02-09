<template>
  <Card :title="title" :variant="variant" :loading="loading" :className="className">
    <Line
      :data="chartData"
      :options="chartOptions"
      class="min-h-[200px]"
    />
  </Card>
</template>

<script setup>
import { Line } from 'vue-chartjs'
import { computed } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
  Filler
} from 'chart.js'
import Card from './Card.vue'

// Register Chart.js components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
  Filler
)

const props = defineProps({
  title: String,
  data: {
    type: Object,
    required: true
  },
  variant: {
    type: String,
    default: 'default'
  },
  loading: Boolean,
  className: String
})

// Chart configuration
const chartOptions = {
  responsive: false,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(26, 34, 51, 0.3)',
        borderColor: 'rgba(26, 34, 51, 0.3)'
      },
      ticks: {
        color: '#4B5563'
      }
    },
    x: {
      grid: {
        color: 'rgba(26, 34, 51, 0.3)',
        borderColor: 'rgba(26, 34, 51, 0.3)'
      },
      ticks: {
        color: '#4B5563'
      }
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: '#1a2233',
      titleColor: '#e0e0e0',
      bodyColor: '#e0e0e0',
      borderColor: '#243044',
      borderWidth: 1,
      padding: 10,
      displayColors: false
    }
  },
  interaction: {
    intersect: false,
    mode: 'index'
  },
  elements: {
    line: {
      tension: 0.4
    },
    point: {
      radius: 0
    }
  }
}

const chartData = computed(() => ({
  labels: props.data.labels,
  datasets: [{
    label: props.data.label,
    data: props.data.values,
    borderColor: getLineColor(props.variant),
    backgroundColor: getBackgroundColor(props.variant),
    fill: true
  }]
}))

function getLineColor(variant) {
  switch (variant) {
    case 'primary': return '#00ff00'
    case 'warning': return '#ff9800'
    case 'danger': return '#ff4757'
    default: return '#3b82f6'
  }
}

function getBackgroundColor(variant) {
  switch (variant) {
    case 'primary': return 'rgba(0, 255, 0, 0.1)'
    case 'warning': return 'rgba(255, 152, 0, 0.1)'
    case 'danger': return 'rgba(255, 71, 87, 0.1)'
    default: return 'rgba(59, 130, 246, 0.1)'
  }
}
</script> 