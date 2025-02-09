import { defineStore } from 'pinia'
import { ref, onMounted } from 'vue'

export const useDarkModeStore = defineStore('darkMode', () => {
    const isDarkMode = ref(true)

    function toggleDarkMode() {
        isDarkMode.value = !isDarkMode.value
        updateDarkMode()
    }

    function updateDarkMode() {
        if (isDarkMode.value) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

    onMounted(() => {
        updateDarkMode()
    })

    return { isDarkMode, toggleDarkMode }
})