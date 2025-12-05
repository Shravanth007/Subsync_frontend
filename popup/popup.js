document.addEventListener('DOMContentLoaded', async () => {
  const settingsToggle = document.getElementById('settingsToggle');
  const settingsPanel = document.getElementById('settingsPanel');
  const saveSettingsBtn = document.getElementById('saveSettings');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const modelNameInput = document.getElementById('modelNameInput');
  const statusBadge = document.getElementById('statusBadge');
  const statusText = document.getElementById('statusText');

  async function checkBackendStatus() {
    try {
      const backendUrl = 'https://subsync-backend.vercel.app';
      const response = await fetch(`${backendUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      
      if (response.ok) {
        statusBadge.classList.add('active');
        statusText.textContent = 'Active';
      } else {
        statusBadge.classList.remove('active');
        statusText.textContent = 'Inactive';
      }
    } catch (error) {
      statusBadge.classList.remove('active');
      statusText.textContent = 'Inactive';
    }
  }

  checkBackendStatus();

  chrome.storage.sync.get(['apiKey', 'modelName'], (result) => {
    if (result.apiKey) {
      apiKeyInput.value = result.apiKey;
    }
    if (result.modelName) {
      modelNameInput.value = result.modelName;
    }
  });

  settingsToggle.addEventListener('click', () => {
    const isOpen = settingsPanel.classList.toggle('open');
    settingsToggle.classList.toggle('open', isOpen);
  });

  saveSettingsBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    const modelName = modelNameInput.value.trim();
    
    chrome.storage.sync.set({
      apiKey: apiKey || '',
      modelName: modelName || ''
    }, () => {
      chrome.runtime.sendMessage({
        type: 'CONFIG_UPDATED',
        apiKey: apiKey || '',
        modelName: modelName || ''
      });
      
      const originalText = saveSettingsBtn.textContent;
      saveSettingsBtn.textContent = '✓ Saved!';
      saveSettingsBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      
      setTimeout(() => {
        saveSettingsBtn.textContent = originalText;
        saveSettingsBtn.style.background = '';
      }, 2000);
    });
  });
});
