import { ref } from "vue";

export function useRoomImageSettings(roomStore, authStore, snackbar) {
  const settingsRoomId = ref(null);
  const settingsRoomImageFile = ref(null);
  const settingsRoomImagePreview = ref(null);
  const settingsLoading = ref(false);

  function getSelectedSettingsImageFile() {
    return Array.isArray(settingsRoomImageFile.value)
      ? settingsRoomImageFile.value[0]
      : settingsRoomImageFile.value;
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function loadSelectedRoomImage() {
    const room = roomStore.rooms.find((item) => item.id === settingsRoomId.value);
    settingsRoomImagePreview.value = room?.image || null;
    settingsRoomImageFile.value = null;
  }

  async function previewSettingsRoomImage() {
    const file = getSelectedSettingsImageFile();
    settingsRoomImagePreview.value = file ? await readFileAsDataUrl(file) : null;
  }

  async function saveRoomImage() {
    if (!settingsRoomId.value || !settingsRoomImagePreview.value) return;

    settingsLoading.value = true;

    try {
      await roomStore.updateRoom(settingsRoomId.value, {
        image: settingsRoomImagePreview.value,
        imageUpdatedBy: authStore.user.email,
        imageUpdatedAt: new Date()
      });

      snackbar.value = {
        show: true,
        message: "Room image saved",
        color: "success"
      };
    } catch (error) {
      snackbar.value = {
        show: true,
        message: "Error saving room image",
        color: "error"
      };
    } finally {
      settingsLoading.value = false;
    }
  }

  async function removeRoomImage() {
    if (!settingsRoomId.value) return;

    settingsLoading.value = true;

    try {
      await roomStore.updateRoom(settingsRoomId.value, {
        image: null,
        imageUpdatedBy: authStore.user.email,
        imageUpdatedAt: new Date()
      });

      settingsRoomImagePreview.value = null;
      settingsRoomImageFile.value = null;

      snackbar.value = {
        show: true,
        message: "Room image removed",
        color: "success"
      };
    } catch (error) {
      snackbar.value = {
        show: true,
        message: "Error removing room image",
        color: "error"
      };
    } finally {
      settingsLoading.value = false;
    }
  }

  return {
    settingsRoomId,
    settingsRoomImageFile,
    settingsRoomImagePreview,
    settingsLoading,
    loadSelectedRoomImage,
    previewSettingsRoomImage,
    saveRoomImage,
    removeRoomImage
  };
}
