import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useUserStore } from '@/stores/user/userStore.ts'
import { useAxios } from '@/composables/axios/axios.ts'
import { storeToRefs } from 'pinia'
import type { User } from '@/types/user'

const TUTORIAL_DISMISSED_KEY = 'wedge_matrix_tutorial_dismissed'

export const useTutorialStore = defineStore('tutorial', () => {
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

  function endTutorial() {
    tutorialStep.value = null
  }

  function dismissModal() {
    showModal.value = false
  }

  async function dismissModalPermanently() {
    const userStore = useUserStore()
    const { user } = storeToRefs(userStore)
    const { patch } = useAxios()

    const response = await patch<{ user: User }>('/user', { has_dismissed_tutorial: true })
    if (!response.error && response.data) {
      user.value = response.data.user
      showModal.value = false
    }
  }

  async function finishTutorial() {
    const userStore = useUserStore()
    const { user } = storeToRefs(userStore)
    const { patch } = useAxios()

    const response = await patch<{ user: User }>('/user', { has_dismissed_tutorial: true })
    if (!response.error && response.data) {
      user.value = response.data.user
      endTutorial()
    }
  }

  return {
    tutorialStep,
    modalVisible,
    startTutorial,
    nextStep,
    endTutorial,
    dismissModal,
    dismissModalPermanently,
    finishTutorial,
  }
})
