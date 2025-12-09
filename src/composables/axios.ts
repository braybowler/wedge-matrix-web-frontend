import axios from 'axios';
import { useLoadingStore } from '@/stores/loading/loadingStore.ts'
import { storeToRefs } from 'pinia'

export function useAxios() {
  const loadingStore = useLoadingStore()
  const { isLoading } = storeToRefs(loadingStore)

  const wedgeMatrixBasePath = import.meta.env.VITE_API_URL;

  const get = async () => {
    try {
      isLoading.value = true;
      const response = await axios.get(wedgeMatrixBasePath + '/up')
      console.log(response)
      isLoading.value = false;
    } catch (error) {
      console.error(error)
      isLoading.value = false;
    }
  }

  return {
    get
  }
}
