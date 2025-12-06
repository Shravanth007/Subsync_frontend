const UIComponents = {
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    let html = div.innerHTML;
    
    html = html.replace(/^### (.+)$/gm, '<h3 class="subsync-h3">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="subsync-h2">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 class="subsync-h1">$1</h1>');
    
    html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="subsync-list-item" data-num="$1">$2</li>');
    
    html = html.replace(/^- (.+)$/gm, '<li class="subsync-bullet-item">$1</li>');
    
    html = html.replace(/\*\*\*([^\*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^\*\n]+)\*/g, '<em>$1</em>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    html = html.replace(/(<li class="subsync-list-item"[^>]*>.+?<\/li>\s*)+/g, '<ol class="subsync-ordered-list">$&</ol>');
    html = html.replace(/(<li class="subsync-bullet-item">.+?<\/li>\s*)+/g, '<ul class="subsync-bullet-list">$&</ul>');
    
    html = html.replace(/\n/g, '<br>');
    
    return html;
  },

  async checkBackendStatus() {
    try {
      const backendUrl = 'https://subsync-backend.vercel.app';
      const response = await fetch(`${backendUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  createSidebar() {
    if (AppState.sidebar) return AppState.sidebar;

    const welcomeMessages = [
      "always listening, always ready—what's on your mind?",
      "synced up and standing by. fire away!",
      "ready when you are—drop a thought!",
      "synced and sharp—what do we explore?",
      "here in the background—ask away!",
      "context secured—what's next?",
      "always in sync—say the word!"
    ];
    
    const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

    const sidebarDiv = document.createElement('div');
    sidebarDiv.id = 'subsync-sidebar';
    sidebarDiv.innerHTML = `
      <div class="subsync-sidebar-header">
        <div class="subsync-header-left">
          <div class="subsync-header-title">
            <span class="subsync-title-text">SubSync</span>
            <span class="subsync-title-separator"></span>
            <span class="subsync-title-subtitle">AI Assistant</span>
          </div>
        </div>
        <div class="subsync-header-actions">
          <button id="subsync-new-chat-header" class="subsync-icon-btn" title="New conversation">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
          </button>
          <button class="subsync-sidebar-close subsync-icon-btn" title="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="subsync-chat-container" id="subsync-chat-messages">
        <div class="subsync-empty-state">
          <div class="subsync-welcome-text">${randomMessage}</div>
        </div>
      </div>

      <div class="subsync-input-container">
        <div class="subsync-input-wrapper">
          <div class="subsync-input-group">
            <textarea 
              id="subsync-input" 
              class="subsync-input" 
              placeholder="Ask a question..."
              rows="1"
            ></textarea>
            <button id="subsync-send" class="subsync-send-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(sidebarDiv);
    AppState.sidebar = sidebarDiv;

    PlatformDetector.updateSidebarTheme(sidebarDiv);

    this.attachSidebarListeners(sidebarDiv);

    return sidebarDiv;
  },

  async updateBackendStatus() {
    const statusDot = document.querySelector('.subsync-backend-dot');
    const statusText = document.querySelector('.subsync-backend-text');
    
    if (!statusDot || !statusText) return;
    
    const isOnline = await this.checkBackendStatus();
    
    if (isOnline) {
      statusDot.classList.add('online');
      statusDot.classList.remove('offline');
      statusText.textContent = 'Backend Live';
    } else {
      statusDot.classList.add('offline');
      statusDot.classList.remove('online');
      statusText.textContent = 'Backend Offline';
    }
  },

  attachSidebarListeners(sidebar) {
    const closeBtn = sidebar.querySelector('.subsync-sidebar-close');
    const sendBtn = sidebar.querySelector('#subsync-send');
    const newChatHeaderBtn = sidebar.querySelector('#subsync-new-chat-header');
    const input = sidebar.querySelector('#subsync-input');

    closeBtn.addEventListener('click', () => this.closeSidebar());
    sendBtn.addEventListener('click', () => this.sendMessage());
    if (newChatHeaderBtn) {
      newChatHeaderBtn.addEventListener('click', () => this.handleNewConversation());
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
  },

  renderMessages() {
    const container = document.getElementById('subsync-chat-messages');
    if (!container) return;

    if (AppState.chatMessages.length === 0) {
      const welcomeMessages = [
        "always listening, always ready—what's on your mind?",
        "synced up and standing by. fire away!",
        "ready when you are—drop a thought!",
        "synced and sharp—what do we explore?",
        "here in the background—ask away!",
        "context secured—what's next?",
        "always in sync—say the word!"
      ];
      
      const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      
      container.innerHTML = `
        <div class="subsync-empty-state">
          <div class="subsync-welcome-text">${randomMessage}</div>
        </div>
      `;
      return;
    }

    container.innerHTML = '';

    if (AppState.selectedText) {
      const badge = document.createElement('div');
      badge.className = 'subsync-context-badge';
      badge.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
          <path d="M4 4h12v2H4V4zm0 5h12v2H4V9zm0 5h8v2H4v-2z"/>
        </svg>
        Context: "${AppState.selectedText.substring(0, 50)}${AppState.selectedText.length > 50 ? '...' : ''}"
      `;
      container.appendChild(badge);
    }

    AppState.chatMessages.forEach(msg => {
      const messageDiv = document.createElement('div');
      messageDiv.className = `subsync-message subsync-message-${msg.role}`;

      messageDiv.innerHTML = `
        <span class="subsync-message-label">${msg.role === 'user' ? 'You' : 'Assistant'}</span>
        <div class="subsync-message-bubble">${this.escapeHtml(msg.content)}</div>
      `;

      container.appendChild(messageDiv);
    });

    container.scrollTop = container.scrollHeight;
  },

  async sendMessage() {
    const input = document.getElementById('subsync-input');
    const sendBtn = document.getElementById('subsync-send');
    const message = input.value.trim();

    if (!message) return;

    input.disabled = true;
    sendBtn.disabled = true;

    AppState.addMessage('user', message);
    this.renderMessages();

    input.value = '';
    input.style.height = 'auto';

    this.showLoadingMessage();

    try {
      await Config.initialize();
      
      const recentMessages = ConversationScraper.getLastNMessages(3);
      const conversationHistory = AppState.getMessagesForAPI(true);
      const fullHistory = [...recentMessages, ...conversationHistory];
      
      const response = await APIClient.sendChatMessage(
        message,
        AppState.currentContext,
        AppState.sessionId,
        fullHistory
      );

      this.removeLoadingMessage();

      AppState.addMessage('assistant', response.response, response.timestamp);
      this.renderMessages();

      StorageManager.saveConversationHistory();

    } catch (error) {
      this.removeLoadingMessage();

      const errorMessage = Config.API_KEY 
        ? 'Sorry, I encountered an error with the API. Please check your API key and model settings.'
        : 'Sorry, I encountered an error. Please make sure the backend is running and try again.';

      AppState.addMessage('assistant', errorMessage);

      this.renderMessages();
    }

    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
  },

  showLoadingMessage() {
    const container = document.getElementById('subsync-chat-messages');
    if (!container) return;

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'subsync-message subsync-message-assistant subsync-loading-message';
    loadingDiv.innerHTML = `
      <span class="subsync-message-label">Assistant</span>
      <div class="subsync-message-bubble">
        <div class="subsync-loading">
          <div class="subsync-loading-dot"></div>
          <div class="subsync-loading-dot"></div>
          <div class="subsync-loading-dot"></div>
        </div>
      </div>
    `;
    container.appendChild(loadingDiv);
    container.scrollTop = container.scrollHeight;
  },

  removeLoadingMessage() {
    const loadingMsg = document.querySelector('.subsync-loading-message');
    if (loadingMsg) {
      loadingMsg.remove();
    }
  },

  handleNewConversation() {
    AppState.startNewConversation();
    StorageManager.saveConversationHistory();
    this.renderMessages();

    AppState.updateContext(ConversationScraper.scrapeConversation());
  },

  openSidebar() {
    if (!AppState.sidebar) {
      this.createSidebar();
    }

    PlatformDetector.updateSidebarTheme(AppState.sidebar);

    AppState.updateContext(ConversationScraper.scrapeConversation());

    StorageManager.loadConversationHistory();
    this.renderMessages();

    setTimeout(() => {
      AppState.sidebar.classList.add('open');
    }, 10);

    setTimeout(() => {
      const input = document.getElementById('subsync-input');
      if (input) input.focus();
    }, 350);
  },

  closeSidebar() {
    if (AppState.sidebar) {
      AppState.sidebar.classList.remove('open');
    }
  }
};
