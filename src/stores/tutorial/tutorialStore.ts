import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTutorialStore = defineStore('tutorial', () => {
  const tutorialStep = ref<number | null>(null)

  function startTutorial() {
    tutorialStep.value = 1
  }

  function nextStep() {
    if (tutorialStep.value !== null) {
      tutorialStep.value++
    }
  }

  function endTutorial() {
    tutorialStep.value = null
  }

  return {
    tutorialStep,
    startTutorial,
    nextStep,
    endTutorial,
  }
})
