import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import ControlRoom from '@/views/ControlRoom.vue'
import AlarmsView from '@/views/AlarmsView.vue'
import CoreMonitoring from '@/views/CoreMonitoring.vue'
import SafetySystems from '@/views/SafetySystems.vue'
import ThermalControl from '@/views/ThermalControl.vue'
import History from '@/views/History.vue'
import Reports from '@/views/Reports.vue'
import ReactorView from '@/views/ReactorView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Overview',
      component: Dashboard
    },
    {
      path: '/controls',
      name: 'Control Room',
      component: ControlRoom
    },
    {
      path: '/alarms',
      name: 'Alarms & Alerts',
      component: AlarmsView
    },
    {
      path: '/monitoring',
      name: 'Core Monitoring',
      component: CoreMonitoring
    },
    {
      path: '/safety',
      name: 'Safety Systems',
      component: SafetySystems
    },
    {
      path: '/thermal',
      name: 'Thermal Control',
      component: ThermalControl
    },
    {
      path: '/history',
      name: 'History',
      component: History
    },
    {
      path: '/reports',
      name: 'Reports',
      component: Reports
    },
    {
      path: '/reactor',
      name: 'Reactor View',
      component: ReactorView
    }
  ]
})

export default router