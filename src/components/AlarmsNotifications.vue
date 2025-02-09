<template>
    <div class="card alarms-notifications">
        <h2>Alarms and Notifications</h2>
        <div v-for="(alert, index) in alerts" :key="index" class="alert" :class="alert.type">
            <span class="mdi" :class="alert.icon"></span>
            <strong>{{ alert.title }}:</strong> {{ alert.message }}
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const alerts = ref([
    {
        type: 'warning',
        icon: 'mdi-alert',
        title: 'Warning',
        message: 'Scheduled maintenance for Pump #3 is due in 48 hours.'
    },
    {
        type: 'info',
        icon: 'mdi-information',
        title: 'Info',
        message: 'Next shift change in 2 hours.'
    }
])
</script>

<style scoped>
.card {
    background-color: #16213e;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
    font-size: 1.2em;
    margin-bottom: 15px;
    color: #00ff00;
}

.alert {
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
}

.alert .mdi {
    margin-right: 10px;
    font-size: 1.2em;
}

.warning {
    background-color: #ffeaa7;
    color: #d35400;
}

.info {
    background-color: #74b9ff;
    color: #2980b9;
}
</style>