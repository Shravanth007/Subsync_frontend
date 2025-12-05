document.addEventListener('DOMContentLoaded', () => {
  const backendUrlInput = document.getElementById('backendUrl');
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('saveBtn');
  const statusMessage = document.getElementById('statusMessage');

  chrome.storage.sync.get(['backendUrl', 'apiKey'], (result) => {
    if (result.backendUrl) {
      backendUrlInput.value = result.backendUrl;
    }
    if (result.apiKey) {
      apiKeyInput.value = result.apiKey;
    }
  });

  saveBtn.addEventListener('click', () => {
    const backendUrl = backendUrlInput.value.trim() || 'https://subsync-backend.vercel.app';
    const apiKey = apiKeyInput.value.trim();

    chrome.storage.sync.set({ backendUrl, apiKey }, () => {
      statusMessage.textContent = 'Settings saved successfully!';
      statusMessage.className = 'status-message status-success';
      statusMessage.style.display = 'block';

      setTimeout(() => {
        statusMessage.style.display = 'none';
      }, 3000);
    });
  });
});
