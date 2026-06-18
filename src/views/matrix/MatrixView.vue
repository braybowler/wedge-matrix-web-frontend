<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import WedgeMatrix from '@/components/matrix/WedgeMatrix.vue'
import TutorialModal from '@/components/tutorial/TutorialModal.vue'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { useTutorialStore } from '@/stores/tutorial/tutorialStore.ts'

const router = useRouter()
const matrixConfigurationStore = useMatrixConfigurationStore()
const tutorialStore = useTutorialStore()

onBeforeUnmount(async () => {
  await matrixConfigurationStore.synchronizeValues()
})

function handleLearnMore() {
  tutorialStore.dismissModal()
  tutorialStore.startTutorial()
  router.push('/configure')
}
</script>

<template>
  <main class="wider-page-content">
    <WedgeMatrix @finish-tutorial="tutorialStore.finishTutorial" />
    <TutorialModal
      :visible="tutorialStore.modalVisible"
      @dismiss="tutorialStore.dismissModal"
      @dismiss-permanently="tutorialStore.dismissModalPermanently"
      @learn-more="handleLearnMore"
    />
  </main>
</template>
