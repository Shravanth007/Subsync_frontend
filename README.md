# SubSync - Ask Questions Without Disrupting Your Chat

SubSync is a Chrome extension that syncs with your ChatGPT or Claude conversations, allowing you to ask follow-up questions in a sidebar without interrupting your main chat flow.

## ✨ Features

- 🔄 **Real-time Sync**: Automatically captures conversation context from ChatGPT and Claude
- 💬 **Sidebar Chat**: Ask questions in a separate sidebar without affecting your main conversation
- 🎯 **Text Selection**: Select any text to get contextual responses
- 🔑 **Flexible API Mode**: Use your own API keys (OpenRouter, MegaLLM) or connect to a backend
- 🎨 **Dark Theme**: Beautiful dark interface that matches ChatGPT/Claude
- 📝 **Markdown Support**: Properly formatted responses with **bold**, *italic*, and `code` rendering
- 💾 **Auto-save**: Conversations are automatically saved for 24 hours

## 🖼️ Screenshots

### ChatGPT Integration
<img width="1671" height="924" alt="Screenshot 2025-12-05 160927" src="https://github.com/user-attachments/assets/37e4e40d-f1bd-43f6-bcdb-515b7fd2ff2c" />

*SubSync sidebar seamlessly integrates with ChatGPT, allowing you to ask questions about the conversation without disrupting the main chat.*

### Claude Integration
<img width="1912" height="930" alt="Screenshot 2025-12-05 160824" src="https://github.com/user-attachments/assets/060a5e41-00ac-49d8-8bea-c9fad640f83e" />

*Works perfectly with Claude AI as well, maintaining the same intuitive experience across platforms.*

### Extension Settings
<img width="457" height="740" alt="Screenshot 2025-12-05 160942" src="https://github.com/user-attachments/assets/6048fe17-b027-48f1-960d-e3b415d39c00" />

*Configure your API keys, check backend status, and manage settings from the extension popup. The "Active" badge shows your backend connection status.*

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
- Click the SubSync extension icon
- Open **API Configuration** panel
- Add your **OpenRouter** or **MegaLLM** API key
- Optionally specify a model name
- Click **Save Configuration**

**Benefits**: Direct API calls, no backend needed, full control

### Option 2: Use Backend Service
- Leave API key empty in the extension
- Backend will automatically handle API calls
- Check the **Active/Inactive** status badge in the popup

## 🛠️ Tech Stack

### Frontend (This Repository)
- Vanilla JavaScript (modular architecture)
- Chrome Extension Manifest V3
- CSS3 with dark theme

### Backend (Optional)
- Python FastAPI
- OpenRouter & MegaLLM API integration
- Deployed on Vercel

## 📚 Documentation

For developers and contributors:
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Complete technical documentation
  - Project structure and module organization
  - Data flow diagrams
  - Development guidelines
  - Troubleshooting guide

## 🌐 Supported Platforms

- ✅ ChatGPT (chat.openai.com, chatgpt.com)
- ✅ Claude (claude.ai)

## 🔒 Privacy & Security

- API keys are stored securely in Chrome's encrypted storage
- No data is collected or sent to third parties
- Conversations are stored locally for 24 hours only
- XSS protection on all user inputs
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

---

Made with ❤️ for better AI conversations
