# SubSync Frontend Architecture

## Overview
SubSync is a Chrome extension that allows users to ask questions about ChatGPT/Claude conversations in a sidebar without disrupting the main chat. The frontend supports flexible API configuration: users can provide their own API keys (OpenAI, Anthropic/Claude, Gemini, OpenRouter, MegaLLM) or use the hosted backend proxy.

## Project Structure

```
frontend/
├── content.js              # Main orchestrator & event handlers
├── background.js           # Service worker for Chrome extension
├── apiConfig.js           # Default configuration (backend URL, API keys)
├── manifest.json          # Chrome extension manifest
│
├── modules/               # Core business logic modules
│   ├── state.js          # Global state management & session handling
│   ├── config.js         # Configuration loader & API key manager
│   ├── platform.js       # Platform detection (ChatGPT/Claude)
│   ├── storage.js        # LocalStorage operations & history
│   ├── api.js            # API client with multi-provider support
│   ├── scraper.js        # Conversation scraper for context extraction
│   ├── monitoring.js     # Background monitoring
│   ├── syncButton.js     # Floating sync button logic
│   └── ui.js             # Sidebar UI & message rendering
│
├── popup/                 # Extension popup interface
│   ├── popup.html        # Popup UI with collapsible API configuration panel
│   ├── popup.js          # Popup logic & backend health check
│   ├── settings.html     # Standalone settings page
│   └── settings.js       # Settings page logic
│
├── styles/               # CSS stylesheets
│   ├── sidebar.css       # Dark theme sidebar styles
│   ├── messages.css      # Message bubbles & markdown formatting
│   ├── input.css         # Input field styles
│   ├── button.css        # Sync button styles
│   └── popup.css         # Popup interface styles
│
├── icons/                # Extension icons (16, 48, 128px)
│
└── docs/                 # Documentation
    └── ARCHITECTURE.md   # This file
```

## Core Module Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CONTENT.JS                            │
│               Main Entry Point & Orchestrator            │
└────────────┬───────────────────────────────────────────┘
             │
             ├──► config.js          (Configuration & API keys)
             │    └─ Loads from apiConfig.js & chrome.storage
             │    └─ Determines direct API vs backend mode
             │
             ├──► state.js           (State Management)
             │    └─ Session ID, chat messages, context
             │    └─ Selected text tracking
             │
             ├──► platform.js        (Platform Detection)
             │    └─ Detects ChatGPT or Claude
             │    └─ Theme detection for sidebar
             │
             ├──► storage.js         (Persistence Layer)
             │    └─ LocalStorage for 24hr conversation history
             │    └─ Auto-cleanup of expired data
             │
             ├──► api.js             (API Client)
             │    ├─ Direct mode: OpenRouter/MegaLLM APIs
             │    └─ Backend mode: Vercel backend proxy
             │
             ├──► scraper.js         (Context Extraction)
             │    └─ Scrapes main conversation for context
             │    └─ Extracts last 2-3 messages for follow-ups
             │
             ├──► syncButton.js      (Floating Button)
             │    └─ Shows/hides sync button on text selection
             │    └─ Positions near "Ask ChatGPT" button
             │
             └──► ui.js              (UI Components)
                  └─ Creates sidebar with chat interface
                  └─ Renders messages with markdown support
                  └─ Handles user input & send actions
```

## Data Flow

### 1. Text Selection Flow
```
User selects text on page
    ↓
content.js detects mouseup event
    ↓
AppState.setSelectedText(text)
    ↓
SyncButton.show() - displays floating button
```

### 2. Sidebar Open Flow
```
User clicks sync button
    ↓
UIComponents.openSidebar()
    ↓
ConversationScraper.scrapeConversation()
    ↓
AppState.updateContext(scraped_context)
    ↓
StorageManager.loadHistory() - loads previous messages
    ↓
UIComponents.renderMessages()
```

### 3. Message Send Flow
```
User types message & clicks send
    ↓
Config.initialize() - loads API key, model, backend URL from storage
    ↓
ConversationScraper.getLastNMessages(3) - get follow-up context
    ↓
APIClient.sendChatMessage(message, context, sessionId, history)
    ↓
Is Config.API_KEY present?
    ├─ YES → Direct API Mode
    │   ↓
    │   APIClient.sendChatMessageDirect()
    │   ↓
    │   APIClient.detectProvider(apiKey) - detects provider by key prefix
    │   ↓
    │   Switch to appropriate API method:
    │   ├─ callOpenAI() → https://api.openai.com/v1/chat/completions
    │   ├─ callAnthropic() → https://api.anthropic.com/v1/messages
    │   ├─ callGemini() → https://generativelanguage.googleapis.com/v1/models/.../generateContent
    │   ├─ callOpenRouterDirectly() → https://openrouter.ai/api/v1/chat/completions
    │   └─ callMegaLLMDirectly() → https://ai.megallm.io/v1/chat/completions
    │   ↓
    │   Return response directly to UI
    │
    └─ NO → Backend Proxy Mode
        ↓
        Send POST to Config.BACKEND_URL/chat with:
        {
          user_message: string,
          context: string,
          session_id: string,
          conversation_history: Message[]
        }
        ↓
        Backend tries providers in order (gpt-4o-mini → gpt-5-mini → MegaLLM)
        ↓
        Return response to UI
    ↓
Response received
    ↓
AppState.addMessage('assistant', response)
    ↓
StorageManager.saveConversationHistory()
    ↓
UIComponents.renderMessages() - with markdown formatting
```

## Key Components Explained

### API Client (modules/api.js)
**Multi-Provider Support with Intelligent Routing:**

The extension supports 5 AI providers with automatic provider detection:

1. **OpenAI** (API key prefix: `sk-` or `org-`)
   - Direct API: https://api.openai.com/v1/chat/completions
   - Default model: `gpt-4o-mini`
   - Authorization: Bearer token

2. **Anthropic/Claude** (API key prefix: `sk-ant-`)
   - Direct API: https://api.anthropic.com/v1/messages
   - Default model: `claude-3-5-sonnet-20241022`
   - Authorization: x-api-key header
   - Converts message format for Claude compatibility

3. **Google Gemini** (API key prefix: `AIzaSy`)
   - Direct API: https://generativelanguage.googleapis.com/v1/models/{model}:generateContent
   - Default model: `gemini-2.5-flash`
   - Authorization: API key in URL parameter
   - Converts message format (system messages prepended to user messages)

4. **OpenRouter** (API key prefix: `sk-or-`)
   - Direct API: https://openrouter.ai/api/v1/chat/completions
   - Default model: `openai/gpt-4o-mini-2024-07-18`
   - Authorization: Bearer token
   - Supports 100+ models via unified interface

5. **MegaLLM** (no specific prefix, fallback provider)
   - Direct API: https://ai.megallm.io/v1/chat/completions
   - Default model: `openai-gpt-oss-20b`
   - Authorization: Bearer token

**Operating Modes:**
- **Direct Mode**: When user provides API key, automatically detects provider by key prefix and calls appropriate API
- **Backend Proxy Mode**: When no API key provided, routes through hosted backend (https://subsync-backend.vercel.app)
- **No Fallback Between Providers**: Each provider is independent; if one fails, extension reports error (backend has its own fallback chain)

### Configuration (modules/config.js)
**Configuration Loading Priority:**
1. `apiConfig.js` - Default hardcoded configuration (backend URL only)
2. `chrome.storage.sync` - User-saved settings from popup
   - `apiKey` - User's API key (encrypted by Chrome)
   - `modelName` - User's preferred model name
   - `backendUrl` - Custom backend URL (default: https://subsync-backend.vercel.app)
3. Runtime updates via `CONFIG_UPDATED` messages

**Key Features:**
- Lazy initialization: Config loads on first access
- Live reload: Changes from popup immediately update active extension
- Secure storage: API keys stored in Chrome's encrypted sync storage
- Header generation: Automatically creates appropriate headers for backend/direct API calls

### Scraper (modules/scraper.js)
**Context Extraction:**
- Scrapes entire main conversation for context
- Extracts last 2-3 messages for follow-up awareness
- Platform-specific selectors for ChatGPT vs Claude

### UI Components (modules/ui.js)
**Markdown Support:**
- `**bold**` → **bold text**
- `*italic*` → *italic text*
- `` `code` `` → `inline code`
- Prevents XSS via escapeHtml function

### Storage (modules/storage.js)
**Features:**
- 24-hour conversation history
- Auto-cleanup of expired data
- Session-based storage keys

## Configuration

### User API Configuration (via Popup)

Users can configure their own API access in two ways:

**Option 1: Use Popup Settings Panel (Recommended)**
1. Click extension icon
2. Click "API Configuration" to expand settings panel
3. Enter API key and optionally model name
4. Click "Save Configuration"

**Option 2: Use Standalone Settings Page**
1. Right-click extension icon → Options
2. Configure backend URL and API key
3. Save settings

**Supported API Key Formats:**
- OpenAI: `sk-...` or `org-...`
- Anthropic/Claude: `sk-ant-...`
- Google Gemini: `AIzaSy...`
- OpenRouter: `sk-or-...`
- MegaLLM: Any other format (treated as MegaLLM key)

**Model Name Examples:**
- OpenAI: `gpt-4o-mini`, `gpt-4-turbo`, `gpt-3.5-turbo`
- Anthropic: `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229`
- Gemini: `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-2.5-pro`
- OpenRouter: `openai/gpt-4o-mini-2024-07-18`, `anthropic/claude-3.5-sonnet`
- MegaLLM: `openai-gpt-oss-20b`

**Backend URL Configuration:**
- Default: `https://subsync-backend.vercel.app`
- Users can configure custom backend URL if self-hosting
- Backend is private and requires proper CORS configuration

### How API Selection Works

```
User sends message
    ↓
Config.initialize() loads settings
    ↓
Is API_KEY present?
    ├─ YES → Direct API Mode
    │   ↓
    │   Detect provider by key prefix
    │   ├─ sk- or org- → OpenAI
    │   ├─ sk-ant- → Anthropic
    │   ├─ AIzaSy → Gemini
    │   ├─ sk-or- → OpenRouter
    │   └─ other → OpenRouter (fallback)
    │   ↓
    │   Call provider's API directly
    │   ↓
    │   Return response
    │
    └─ NO → Backend Proxy Mode
        ↓
        Send request to Config.BACKEND_URL/chat
        ↓
        Backend handles provider fallback chain:
        OpenRouter (gpt-4o-mini) → OpenRouter (gpt-5-mini) → MegaLLM
        ↓
        Return response
```

## Supported Platforms
- ChatGPT (chat.openai.com, chatgpt.com)
- Claude (claude.ai)

## Development Guidelines

### Adding New Features
1. **New Module**: Create in `modules/` folder
2. **Update manifest.json**: Add to content_scripts.js array
3. **Import Order**: Follow dependency hierarchy
4. **State Management**: Use AppState for shared data
5. **API Changes**: Update both direct & backend modes

### Modifying Scrapers
- Platform-specific logic in `scraper.js`
- Test on both ChatGPT and Claude
- Update selectors if UI changes

### Styling Changes
- Use CSS variables for consistency
- Dark theme enforced via `sidebar.css`
- Keep markdown styling in `messages.css`

### Security Notes
- API keys stored in encrypted chrome.storage.sync
- XSS prevention via escapeHtml before markdown parsing
- HTTPS-only API communications
- No sensitive data logging

## Module Dependencies

```
state.js (no dependencies - foundation layer)
    ↓
platform.js, storage.js, monitoring.js (depend on state)
    ↓
config.js (independent - loads from storage)
    ↓
api.js (depends on config)
    ↓
scraper.js (depends on state & platform)
    ↓
syncButton.js, ui.js (depend on state, api, scraper, storage)
    ↓
content.js (orchestrates all modules)
```

## Common Tasks

### Add New API Provider
1. Add detection logic in `modules/api.js` → `detectProvider()` method
2. Create new method: `callNewProvider(messages, model)` with proper API format
3. Add case in `sendChatMessageDirect()` switch statement
4. Add host permission in `manifest.json`
5. Update popup help text in `popup/popup.html`
6. Update this documentation

### Modify Message Display
Edit `modules/ui.js`:
- `escapeHtml()` for markdown parsing
- `renderMessages()` for message layout
- Update `styles/messages.css` for styling

### Change Theme
Edit `styles/sidebar.css`:
- Update CSS variables at top
- Modify `.subsync-force-dark-theme` section

## Security & Privacy

### API Key Storage
- Keys stored in `chrome.storage.sync` (encrypted by Chrome)
- Never logged or exposed in console
- Transmitted only via HTTPS
- Not shared with backend when using direct API mode

### Backend Privacy
- Backend is hosted privately on Vercel
- Only receives requests when user doesn't provide API key
- Does not store conversation history
- Rate limited to prevent abuse

### Extension Permissions
- `storage`: For saving API keys and conversation history
- `activeTab`: For reading selected text on ChatGPT/Claude pages
- Host permissions: Only for ChatGPT, Claude, and API domains
- No broad permissions or unnecessary access

### Data Storage
- Conversations stored locally in browser (24hr expiration)
- Session IDs generated client-side
- No data sent to external services except AI providers
- LocalStorage is origin-isolated (per-domain)

## Troubleshooting

### Backend Shows Inactive
- Check backend URL in settings (default: https://subsync-backend.vercel.app)
- Verify internet connection
- Backend may be deploying/restarting (temporary)
- Check browser console for CORS errors

### Messages Not Formatting
- Check `escapeHtml()` in ui.js
- Verify markdown CSS in messages.css
- Ensure proper escaping order (escape → markdown → render)

### Scraper Not Working
- Platform UI may have changed
- Update selectors in scraper.js
- Check console for "No messages scraped" warning
- Verify you're on supported platform (ChatGPT or Claude)

### API Key Not Working (Direct Mode)
**For OpenAI:**
- Verify key format: `sk-...` or `org-...`
- Check key is active at https://platform.openai.com
- Ensure sufficient credits/quota

**For Anthropic/Claude:**
- Verify key format: `sk-ant-...`
- Check key at https://console.anthropic.com
- Model name format: `claude-3-5-sonnet-20241022`

**For Gemini:**
- Verify key format: `AIzaSy...`
- Check key at https://makersuite.google.com/app/apikey
- Enable Gemini API in Google Cloud Console

**For OpenRouter:**
- Verify key format: `sk-or-...`
- Check key and credits at https://openrouter.ai/keys
- Model format: `provider/model-name` (e.g., `openai/gpt-4o-mini`)

**For MegaLLM:**
- Get key at https://ai.megallm.io
- Check API documentation for model names

**General Debugging:**
- Check browser console for error messages
- Verify API key has no leading/trailing spaces
- Confirm host_permissions in manifest.json include API domains
- Try backend proxy mode (remove API key) to verify extension works

### Extension Not Loading
- Check Chrome extension page (chrome://extensions/)
- Verify all files are present in extension directory
- Check for JavaScript errors in background service worker
- Reload extension after making changes

## Distribution & Sharing

### Frontend-Only Distribution
The frontend can be safely shared as a standalone Chrome extension:
- No hardcoded API keys (users provide their own)
- Backend URL is configurable
- All sensitive data stored locally in browser
- No telemetry or analytics

### Installation Instructions for Users
1. Download and extract frontend folder
2. Open Chrome → Extensions (chrome://extensions/)
3. Enable "Developer mode"
4. Click "Load unpacked" → select frontend folder
5. Pin extension to toolbar
6. Configure API key in extension popup (optional)

### Self-Hosting Backend (Optional)
Users who want to avoid providing API keys can:
1. Clone backend repository
2. Deploy to Vercel/Railway/other host
3. Set environment variables for API keys
4. Configure custom backend URL in extension settings

## Version History

**v5.0.0** (Current)
- Multi-provider API support (OpenAI, Anthropic, Gemini, OpenRouter, MegaLLM)
- Automatic provider detection by API key prefix
- Improved popup UI with collapsible settings
- Better error messages and help text
- Backend URL now configurable from settings
- Bug fixes in config loading

## Known Limitations

1. **No Multi-Provider Fallback in Direct Mode**: If user's API key fails, extension doesn't try other providers (only backend mode has fallback chain)
2. **Platform-Specific Scrapers**: Must maintain separate scraping logic for ChatGPT and Claude
3. **24-Hour History Limit**: Conversations older than 24 hours are auto-deleted
4. **No Cross-Device Sync**: History is per-browser (though API keys sync via Chrome)
5. **Markdown Support Basic**: Only supports common markdown, not full spec





