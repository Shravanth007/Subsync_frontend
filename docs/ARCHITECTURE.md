# SubSync Frontend Architecture

## Overview
SubSync is a Chrome extension that allows users to ask questions about ChatGPT/Claude conversations in a sidebar without disrupting the main chat. The frontend supports dual-mode operation: direct API calls (when user provides API key) or backend proxy mode.

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
│   ├── api.js            # API client (direct or backend proxy)
│   ├── scraper.js        # Conversation scraper for context extraction
│   ├── monitoring.js     # Background monitoring (disabled)
│   ├── syncButton.js     # Floating sync button logic
│   └── ui.js             # Sidebar UI & message rendering
│
├── popup/                 # Extension popup interface
│   ├── popup.html        # Popup UI with settings panel
│   ├── popup.js          # Popup logic & backend health check
│   ├── settings.html     # (Unused) Separate settings page
│   └── settings.js       # (Unused) Settings page logic
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
    ├── ARCHITECTURE.md   # This file
    └── knowledge.txt     # Additional project knowledge
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
Config.initialize() - loads API key if exists
    ↓
ConversationScraper.getLastNMessages(3) - get follow-up context
    ↓
APIClient.sendChatMessage()
    ├─ If API_KEY exists: Direct API call (OpenRouter → MegaLLM fallback)
    └─ If no API_KEY: Backend proxy (https://subsync-backend.vercel.app)
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
**Dual-Mode Operation:**
- **Direct Mode**: When user provides API key, calls OpenRouter or MegaLLM directly from frontend
- **Backend Mode**: When no API key, proxies through Vercel backend
- **Automatic Fallback**: OpenRouter → MegaLLM → Error

### Configuration (modules/config.js)
**Sources (priority order):**
1. apiConfig.js (default: backend URL)
2. chrome.storage.sync (user-saved API keys)
3. Runtime updates via CONFIG_UPDATED messages

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

### User Settings (Popup)
- API Key: Optional OpenRouter/MegaLLM key for direct mode
- Model Name: Optional model selection override
- Backend Status: Shows Active/Inactive badge

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
1. Add method in `modules/api.js`: `callNewProviderDirectly()`
2. Add fallback logic in `sendChatMessageDirect()`
3. Update popup settings if needed

### Modify Message Display
Edit `modules/ui.js`:
- `escapeHtml()` for markdown parsing
- `renderMessages()` for message layout
- Update `styles/messages.css` for styling

### Change Theme
Edit `styles/sidebar.css`:
- Update CSS variables at top
- Modify `.subsync-force-dark-theme` section

## Troubleshooting

### Backend Shows Inactive
- Check CORS settings on backend
- Verify backend URL in apiConfig.js
- Check browser console for errors

### Messages Not Formatting
- Check `escapeHtml()` in ui.js
- Verify markdown CSS in messages.css
- Ensure proper escaping order (escape → markdown → render)

### Scraper Not Working
- Platform UI may have changed
- Update selectors in scraper.js
- Check console for "No messages scraped" warning

### API Key Not Working
- Verify key is valid on OpenRouter/MegaLLM
- Check key is trimmed (no spaces)
- Ensure host_permissions in manifest.json include API domains



