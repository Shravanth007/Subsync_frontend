# SubSync - Ask Questions Without Disrupting Your Chat

SubSync is a Chrome extension that syncs with your ChatGPT or Claude conversations, allowing you to ask follow-up questions in a sidebar without interrupting your main chat flow.

## ✨ Features

- 🔄 **Real-time Sync**: Automatically captures conversation context from ChatGPT and Claude
- 💬 **Sidebar Chat**: Ask questions in a separate sidebar without affecting your main conversation
- 🎯 **Text Selection**: Select any text to get contextual responses
- 🔑 **Multi-Provider Support**: Use OpenAI, Anthropic/Claude, Google Gemini, OpenRouter, or MegaLLM APIs
- 🌐 **Backend Fallback**: Works without API keys using hosted backend
- 🎨 **Dark Theme**: Beautiful dark interface that matches ChatGPT/Claude
- 📝 **Markdown Support**: Properly formatted responses with **bold**, *italic*, and `code` rendering
- 💾 **Auto-save**: Conversations are automatically saved for 24 hours

## 🖼️ Screenshots

### ChatGPT Integration
<img width="1670" height="922" alt="image" src="https://github.com/user-attachments/assets/3c50862c-5ad8-419b-9629-b8b879bef885" />

*SubSync sidebar seamlessly integrates with ChatGPT, allowing you to ask questions about the conversation without disrupting the main chat.*

### Claude Integration
<img width="1862" height="915" alt="image" src="https://github.com/user-attachments/assets/25770693-e429-4216-b5ee-2ac09493bcd2" />

*Works perfectly with Claude AI as well, maintaining the same intuitive experience across platforms.*

### Extension Settings
<img width="572" height="1005" alt="image" src="https://github.com/user-attachments/assets/3f61f511-8dad-4202-965c-5f149f6cd018" />

*Configure your API keys, check backend status, and manage settings from the extension popup. The "Active" badge shows your backend connection status.*

### Conversation view
<img width="448" height="930" alt="image" src="https://github.com/user-attachments/assets/ab120dc6-f808-4adb-9789-8926d1a4e4ea" />  <img width="451" height="934" alt="image" src="https://github.com/user-attachments/assets/7412c0a2-d845-47dc-966b-18be6fe76184" />



## 🚀 Installation

1. **Download** the extension
   - Download the ZIP file and extract it to a folder

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top-right corner)
   - Click **"Load unpacked"**
   - Select the extracted SubSync folder

3. **Start Using**
   - Navigate to [ChatGPT](https://chatgpt.com) or [Claude](https://claude.ai)
   - Reload the page
   - Select any text to see the sync button appear
   - 📌 **Don't forget to pin the extension** for easy access!

## ⚙️ Configuration

### Option 1: Use Your Own API Keys (Recommended)

SubSync supports multiple AI providers. Click the extension icon, open **API Configuration**, and enter your API key:

**Supported Providers:**
- **OpenAI** - Get key at [platform.openai.com](https://platform.openai.com)
  - Format: `sk-...` or `org-...`
  - Models: `gpt-4o-mini`, `gpt-4-turbo`, `gpt-3.5-turbo`
  
- **Anthropic/Claude** - Get key at [console.anthropic.com](https://console.anthropic.com)
  - Format: `sk-ant-...`
  - Models: `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229`
  
- **Google Gemini** - Get key at [makersuite.google.com](https://makersuite.google.com/app/apikey)
  - Format: `AIzaSy...`
  - Models: `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-2.5-pro`
  
- **OpenRouter** - Get key at [openrouter.ai](https://openrouter.ai/keys)
  - Format: `sk-or-...`
  - Models: `openai/gpt-4o-mini-2024-07-18`, `anthropic/claude-3.5-sonnet`
  
- **MegaLLM** - Get key at [ai.megallm.io](https://ai.megallm.io)
  - Models: `openai-gpt-oss-20b`

**Benefits**: Direct API calls, lower latency, full privacy, your own quota

### Option 2: Use Hosted Backend (No API Key Required)
- Leave API key empty in the extension
- Backend automatically handles API calls with fallback chain
- Check the **Active/Inactive** status badge in the popup
- **Note**: Backend is hosted and may have usage limits

### Option 3: Self-Host Backend
- Clone the backend repository
- Deploy to Vercel/Railway/other service
- Set your API keys as environment variables
- Configure custom backend URL in extension settings

## 🛠️ Tech Stack

### Frontend (This Repository)
- Vanilla JavaScript (modular architecture)
- Chrome Extension Manifest V3
- CSS3 with dark theme
- Multi-provider API integration

### Backend (Optional)
- Python FastAPI
- Multi-tier fallback system
- Deployed on Vercel

## 📚 Documentation

For developers and contributors:
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Complete technical documentation
  - Multi-provider API architecture
  - Project structure and module organization
  - Data flow diagrams
  - Development guidelines
  - Troubleshooting guide

## 🌐 Supported Platforms

- ✅ ChatGPT (chat.openai.com, chatgpt.com)
- ✅ Claude (claude.ai)

## 🔒 Privacy & Security

- API keys stored securely in Chrome's encrypted sync storage
- Direct API mode: Your keys never touch our servers
- Backend mode: No conversation history stored
- Local 24-hour conversation cache only
- XSS protection on all user inputs
- HTTPS-only API communications
- Open-source and transparent code

## 💡 How It Works

1. **Select text** in your ChatGPT/Claude conversation
2. **Click the sync button** that appears
3. **Ask questions** in the sidebar
4. Get responses with **full conversation context** including the last 2-3 messages for better follow-ups

## 🤝 Contributing

Contributions are welcome! Please check the [ARCHITECTURE.md](docs/ARCHITECTURE.md) file for:
- Project structure
- Module dependencies
- Development guidelines
- Common tasks and troubleshooting

## 🐛 Issues & Support

If you encounter any issues or have suggestions:
- Check the troubleshooting section in [ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Open an issue on GitHub
- Make sure your page is reloaded after installation

## 🎯 Quick Tips

- 📌 **Pin the extension** for quick access to settings
- 🔄 **Reload ChatGPT/Claude** after installing the extension
- ⚡ **Direct API mode** is faster than backend mode
- 💾 **Conversations auto-save** - no manual save needed
- ⌨️ **Press ESC** to close the sidebar
- 🔑 **API keys auto-detect** provider - no need to specify

## ❓ FAQ

**Q: Which API provider should I use?**
A: Any provider works! OpenAI and Anthropic are most reliable. OpenRouter gives access to many models. The extension automatically detects provider from your API key format.

**Q: Do I need to pay for API access?**
A: Not necessarily! You can use the hosted backend for free (with limits), or use your own API keys for unlimited usage.

**Q: Is my conversation data safe?**
A: Yes! With direct API mode, data only goes to your chosen AI provider. With backend mode, no conversation history is stored.

**Q: Can I use this offline?**
A: No, SubSync requires internet connection to communicate with AI providers.

**Q: Why isn't the sync button appearing?**
A: Make sure you're on a supported platform (ChatGPT or Claude) and the page is fully loaded. Try reloading the page.

---

Made with ❤️ for better AI conversations
