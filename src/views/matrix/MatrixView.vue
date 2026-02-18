<script setup lang="ts">
import { useRouter } from 'vue-router'
import WedgeMatrix from '@/components/matrix/WedgeMatrix.vue'
import TutorialModal from '@/components/tutorial/TutorialModal.vue'
import { useTutorialStore } from '@/stores/tutorial/tutorialStore.ts'

const router = useRouter()
const tutorialStore = useTutorialStore()

function handleLearnMore() {
  tutorialStore.dismissModal()
  tutorialStore.startTutorial()
  router.push('/configure')
}
</script>

<template>
  <main>
    <WedgeMatrix @finish-tutorial="tutorialStore.finishTutorial" />
    <TutorialModal
      :visible="tutorialStore.modalVisible"
      @dismiss="tutorialStore.dismissModal"
      @dismiss-permanently="tutorialStore.dismissModalPermanently"
      @learn-more="handleLearnMore"
    />
  </main>
</template>
