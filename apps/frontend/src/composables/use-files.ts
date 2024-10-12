import { defineStore } from 'pinia'
import { ref } from 'vue'

interface File {
  name: string
  source: string
}

export const useFiles = defineStore('use-files', () => {
  const files = ref<File[]>([])
  const activeTab = ref<string>('tab-index.js')

  async function fetchFiles() {
    try {
      const response = await fetch('/api/files')
      files.value = await response.json()
    } catch (error) {
      console.error(error)
    }
  }

  async function sendFiles() {
    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(files.value),
      })
      const data = await response.json()
      if (data.error) {
        // Use a method like renderError
      } else {
        // Use a method like renderOutput
      }
    } catch (error) {
      console.error(error)
    }
  }

  return {
    files,
    activeTab,
    fetchFiles,
    sendFiles,
  }
})
