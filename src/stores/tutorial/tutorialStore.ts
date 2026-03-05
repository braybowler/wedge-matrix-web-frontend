import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useUserStore } from '@/stores/user/userStore.ts'
import { useAxios } from '@/composables/axios/axios.ts'
import type { User } from '@/types/user'

const TUTORIAL_DISMISSED_KEY = 'wedge_matrix_tutorial_dismissed'

export const useTutorialStore = defineStore('tutorial', () => {
  const { patch } = useAxios()
  const tutorialStep = ref<number | null>(null)

  const showModal = ref(sessionStorage.getItem(TUTORIAL_DISMISSED_KEY) !== 'true')

  watch(showModal, (value) => {
    if (!value) {
      sessionStorage.setItem(TUTORIAL_DISMISSED_KEY, 'true')
    }
  })

  const modalVisible = computed(() => {
    const userStore = useUserStore()
    return showModal.value && userStore.user?.has_dismissed_tutorial === false
  })

  function startTutorial() {
    tutorialStep.value = 1
  }

  function nextStep() {
    if (tutorialStep.value !== null) {
      tutorialStep.value++
    }
  }

  function previousStep() {
    if (tutorialStep.value !== null && tutorialStep.value > 1) {
      tutorialStep.value--
    }
  }

  function endTutorial() {
    tutorialStep.value = null
  }

  function dismissModal() {
    showModal.value = false
  }

  async function dismissModalPermanently() {
    const userStore = useUserStore()

    const response = await patch<{ data: User }>('/user', { has_dismissed_tutorial: true })
    if (!response.error && response.data) {
      userStore.setUser(response.data.data)
      showModal.value = false
    }
  }

  async function finishTutorial() {
    const userStore = useUserStore()

    const response = await patch<{ data: User }>('/user', { has_dismissed_tutorial: true })
    if (!response.error && response.data) {
      userStore.setUser(response.data.data)
      endTutorial()
    }
  }

  return {
    tutorialStep,
    modalVisible,
    startTutorial,
    nextStep,
    previousStep,
    endTutorial,
    dismissModal,
    dismissModalPermanently,
    finishTutorial,
  }
})
