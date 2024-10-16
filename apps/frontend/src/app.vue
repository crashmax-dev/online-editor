<template>
  <div class="window">
    <div class="title-bar">
      <div class="title-bar-text">
        Visual Studio Code
      </div>
    </div>
    <div class="window-body">
      <menu role="tablist">
        <button
          v-for="file of filesStore.files"
          :key="file.name"
          :aria-controls="`tab-${file.name}`"
          :aria-selected="filesStore.activeTab === `tab-${file.name}`"
          role="tab"
          @click="onTabClick(file.name)"
        >
          {{ file.name }}
        </button>
      </menu>
      <template v-for="file of filesStore.files" :key="`tab-${file.name}`">
        <article v-if="filesStore.activeTab === `tab-${file.name}`" :id="`tab-${file.name}`" role="tabpanel">
          <textarea
            v-model="file.source"
            style="width: 100%; height: 40dvh; resize: vertical; font-size: 16px;"
          />
        </article>
      </template>
      <section class="field-row" style="justify-content: flex-end">
        <button @click="filesStore.sendFiles">
          Save
        </button>
      </section>
    </div>
  </div>
  <div class="window">
    <!-- Output and status bar logic here -->
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useFiles } from './composables/use-files'

const filesStore = useFiles()

onMounted(() => {
  filesStore.fetchFiles()
})

function onTabClick(fileName: string) {
  filesStore.activeTab = `tab-${fileName}`
}
</script>
