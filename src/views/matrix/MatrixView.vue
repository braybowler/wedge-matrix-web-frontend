<script lang="ts">
import { ref, watch } from 'vue'

const TUTORIAL_DISMISSED_KEY = 'wedge_matrix_tutorial_dismissed'

const showTutorialModal = ref(sessionStorage.getItem(TUTORIAL_DISMISSED_KEY) !== 'true')

watch(showTutorialModal, (value) => {
  if (!value) {
    sessionStorage.setItem(TUTORIAL_DISMISSED_KEY, 'true')
  }
})
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import WedgeMatrix from '@/components/matrix/WedgeMatrix.vue'
import TutorialModal from '@/components/matrix/TutorialModal.vue'
import { useUserStore } from '@/stores/user/userStore.ts'
import { useTutorialStore } from '@/stores/tutorial/tutorialStore.ts'
import { useAxios } from '@/composables/axios/axios.ts'
import { storeToRefs } from 'pinia'
import type { User } from '@/types/user'

const router = useRouter()
const userStore = useUserStore()
const tutorialStore = useTutorialStore()
const { user } = storeToRefs(userStore)
const { patch } = useAxios()

const tutorialVisible = computed(
  () => showTutorialModal.value && user.value?.has_dismissed_tutorial === false,
)

function dismissTutorial() {
  showTutorialModal.value = false
}

async function dismissTutorialPermanently() {
  const response = await patch<{ user: User }>('/user', { has_dismissed_tutorial: true })
  if (!response.error && response.data) {
    user.value = response.data.user
  }
  showTutorialModal.value = false
}

function handleLearnMore() {
  showTutorialModal.value = false
  tutorialStore.startTutorial()
  router.push('/configure')
}
</script>

<template>
  <main>
    <WedgeMatrix />
    <TutorialModal
      :visible="tutorialVisible"
      @dismiss="dismissTutorial"
      @dismiss-permanently="dismissTutorialPermanently"
      @learn-more="handleLearnMore"
    />
  </main>
</template>
