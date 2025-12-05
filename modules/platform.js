const PlatformDetector = {
  detectPlatform() {
    const hostname = window.location.hostname;
    if (hostname.includes('chatgpt.com') || hostname.includes('chat.openai.com')) {
      return 'chatgpt';
    } else if (hostname.includes('claude.ai')) {
      return 'claude';
    }
    return 'unknown';
  },
  
  updateSidebarTheme(sidebar) {
    return;
  },
  
  initialize() {
    const platform = this.detectPlatform();
    AppState.setPlatform(platform);
    return platform;
  }
};
