const SyncButton = {
  createButtonContainer() {
    const container = document.createElement('div');
    container.id = 'subsync-button-container';
    
    if (AppState.currentPlatform === 'claude') {
      container.className = 'claude-style';
    } else {
      container.className = 'chatgpt-style fixed select-none';
    }
    
    container.style.cssText = 'z-index: 99999; display: none;';
    
    if (AppState.currentPlatform === 'claude') {
      const button = document.createElement('button');
      button.className = 'subsync-claude-button';
      
      button.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 3.5C6.41 3.5 3.5 6.41 3.5 10C3.5 13.59 6.41 16.5 10 16.5C13.59 16.5 16.5 13.59 16.5 10C16.5 6.41 13.59 3.5 10 3.5ZM9 14L5 10L6.41 8.59L9 11.17L13.59 6.58L15 8L9 14Z"/>
        </svg>
        <span>Sync</span>
      `;
      
      button.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (AppState.selectedText) {
          UIComponents.openSidebar();
          this.hide();
        }
      };
      
      container.appendChild(button);
    } else {
      const wrapper = document.createElement('div');
      wrapper.className = 'shadow-long flex overflow-hidden rounded-xl';
      wrapper.style.cssText = 'margin-left: 8px;';
      
      const button = document.createElement('button');
      button.className = 'btn relative btn-secondary shadow-long flex rounded-xl border-none active:opacity-1';
      
      button.innerHTML = `
        <div class="flex items-center justify-center">
          <span class="flex items-center gap-1.5 select-none">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon">
              <path d="M10 3.5C6.41 3.5 3.5 6.41 3.5 10C3.5 13.59 6.41 16.5 10 16.5C13.59 16.5 16.5 13.59 16.5 10C16.5 6.41 13.59 3.5 10 3.5ZM9 14L5 10L6.41 8.59L9 11.17L13.59 6.58L15 8L9 14Z"/>
            </svg>
            <span class="whitespace-nowrap select-none max-md:sr-only">Sync</span>
          </span>
        </div>
      `;
      
      button.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (AppState.selectedText) {
          UIComponents.openSidebar();
          this.hide();
        }
      };
      
      wrapper.appendChild(button);
      container.appendChild(wrapper);
    }
    
    document.body.appendChild(container);
    
    AppState.syncButtonContainer = container;
    return container;
  },
  
  positionNextToGPTButton(gptContainer) {
    if (!AppState.syncButtonContainer || !gptContainer) {
      return;
    }
    
    const rect = gptContainer.getBoundingClientRect();
    const buttonWidth = gptContainer.offsetWidth;
    
    const top = rect.top + window.scrollY;
    const left = rect.left + window.scrollX + buttonWidth + 8;
    
    AppState.syncButtonContainer.style.top = `${top}px`;
    AppState.syncButtonContainer.style.left = `${left}px`;
    AppState.syncButtonContainer.style.display = 'block';
  },
  
  positionAtSelection() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    if (AppState.syncButtonContainer) {
      AppState.syncButtonContainer.style.display = 'flex';
      AppState.syncButtonContainer.style.position = 'fixed';
      AppState.syncButtonContainer.style.top = `${rect.top - 50}px`;
      AppState.syncButtonContainer.style.left = `${rect.left + (rect.width / 2) - 40}px`;
      AppState.syncButtonContainer.style.zIndex = '99999';
    }
  },
  
  show() {
    if (AppState.currentPlatform === 'chatgpt') {
      this.showForChatGPT();
    } else if (AppState.currentPlatform === 'claude') {
      this.showForClaude();
    }
  },
  
  showForChatGPT() {
    let attempts = 0;
    const tryShow = setInterval(() => {
      attempts++;
      
      const allContainers = document.querySelectorAll('.fixed.select-none');
      
      for (const gptContainer of allContainers) {
        const buttonText = gptContainer.textContent || '';
        
        if (buttonText.includes('Ask ChatGPT')) {
          if (!AppState.syncButtonContainer) {
            this.createButtonContainer();
          }
          this.positionNextToGPTButton(gptContainer);
          clearInterval(tryShow);
          return;
        }
      }
      
      if (attempts > 20) {
        clearInterval(tryShow);
      }
    }, 150);
  },
  
  showForClaude() {
    if (!AppState.syncButtonContainer) {
      this.createButtonContainer();
    }
    this.positionAtSelection();
  },
  
  hide() {
    if (AppState.syncButtonContainer) {
      AppState.syncButtonContainer.style.display = 'none';
    }
    AppState.clearSelectedText();
  }
};
