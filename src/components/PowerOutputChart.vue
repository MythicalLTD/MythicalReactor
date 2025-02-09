<template>
    <Card>
        <h2 class="text-2xl font-bold mb-4">Power Output</h2>
        <Line :data="chartData" :options="chartOptions" />
    </Card>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useReactorStore } from '../stores/reactor'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale } from 'chart.js'
import Card from './ui/Card.vue'

ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale)

const store = useReactorStore()

const chartData = computed(() => ({
    labels: Array.from({ length: store.powerHistory.length }, (_, i) => i + 1),
    datasets: [
        {
            label: 'Power Output (%)',
            data: store.powerHistory,
            borderColor: '#00ff00',
            backgroundColor: 'rgba(0, 255, 0, 0.2)',
            fill: true,
        },
    ],
}))

const chartOptions = {
    responsive: false,
    maintainAspectRatio: false,
    scales: {
        y: {
            beginAtZero: true,
            max: 100,
        },
    },
}

onMounted(() => {
    watch(() => store.powerHistory, () => {
        chartData.value.datasets[0].data = [...store.powerHistory]
    }, { deep: true })
})
</script>