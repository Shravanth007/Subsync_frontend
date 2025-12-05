const Config = {
  BACKEND_URL: 'https://subsync-backend.vercel.app',
  API_KEY: '',
  MODEL_NAME: '',
  _initialized: false,
  
  async initialize() {
    if (this._initialized) return;
    
    if (typeof API_CONFIG !== 'undefined' && API_CONFIG.API_KEY) {
      this.API_KEY = API_CONFIG.API_KEY;
      this.BACKEND_URL = API_CONFIG.BACKEND_URL || this.BACKEND_URL;
      this.MODEL_NAME = API_CONFIG.MODEL_NAME || '';
    }
    
    return new Promise((resolve) => {
      chrome.storage.sync.get(['apiKey', 'modelName'], (result) => {
        this.API_KEY = (result.apiKey || '').trim();
        this.MODEL_NAME = (result.modelName || '').trim();
        this._initialized = true;
        resolve();
      });
    });
  },
  
  async reload() {
    this._initialized = false;
    await this.initialize();
  },
  
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.API_KEY) {
      headers['X-API-Key'] = this.API_KEY;
    }
    
    if (this.MODEL_NAME) {
      headers['X-Model-Name'] = this.MODEL_NAME;
    }
    
    return headers;
  }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CONFIG_UPDATED') {
    Config.API_KEY = (message.apiKey || '').trim();
    Config.MODEL_NAME = (message.modelName || '').trim();
  }
});

Config.initialize();
