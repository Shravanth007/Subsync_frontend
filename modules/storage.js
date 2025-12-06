const StorageManager = {
  STORAGE_PREFIX: 'subsync_chat_',
  EXPIRATION_HOURS: 24,
  
  loadConversationHistory() {
    try {
      const key = `${this.STORAGE_PREFIX}${AppState.sessionId}`;
      const saved = localStorage.getItem(key);
      
      if (saved) {
        const data = JSON.parse(saved);
        const savedTime = new Date(data.timestamp);
        const now = new Date();
        const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
        
        if (hoursDiff < this.EXPIRATION_HOURS) {
          AppState.chatMessages = data.messages || [];
          return true;
        } else {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
    }
    return false;
  },
  
  saveConversationHistory() {
    try {
      const key = `${this.STORAGE_PREFIX}${AppState.sessionId}`;
      const data = {
        messages: AppState.chatMessages,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
    }
  },
  
  cleanupOldConversations() {
    try {
      const keys = Object.keys(localStorage);
      const now = new Date();
      let cleanedCount = 0;
      
      keys.forEach(key => {
        if (key.startsWith(this.STORAGE_PREFIX)) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            const savedTime = new Date(data.timestamp);
            const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
            
            if (hoursDiff >= this.EXPIRATION_HOURS) {
              localStorage.removeItem(key);
              cleanedCount++;
            }
          } catch (e) {
            localStorage.removeItem(key);
            cleanedCount++;
          }
        }
      });
    } catch (e) {
    }
  },
  
  initialize() {
    this.cleanupOldConversations();
  }
};
