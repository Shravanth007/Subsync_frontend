const AppState = {
  syncButtonContainer: null,
  sidebar: null,
  selectedText: '',
  
  sessionId: '',
  chatMessages: [],
  currentContext: '',
  currentPlatform: '',
  
  lastLoggedConversation: '',
  logInterval: null,
  
  initializeSession() {
    this.sessionId = this.generateSessionId();
  },
  
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
  
  startNewConversation() {
    this.chatMessages = [];
    this.sessionId = this.generateSessionId();
  },
  
  addMessage(role, content, timestamp = null) {
    this.chatMessages.push({
      role,
      content,
      timestamp: timestamp || new Date().toISOString()
    });
  },
  
  clearMessages() {
    this.chatMessages = [];
  },
  
  getMessagesForAPI(excludeLast = false) {
    return excludeLast ? this.chatMessages.slice(0, -1) : this.chatMessages;
  },
  
  updateContext(context) {
    this.currentContext = context;
  },
  
  setSelectedText(text) {
    this.selectedText = text;
  },
  
  clearSelectedText() {
    this.selectedText = '';
  },
  
  setPlatform(platform) {
    this.currentPlatform = platform;
  },
  
  cleanupMonitoring() {
    if (this.logInterval) {
      clearInterval(this.logInterval);
      this.logInterval = null;
    }
  }
};

AppState.initializeSession();
