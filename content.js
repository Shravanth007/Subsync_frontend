function handleSelection() {
  const selection = window.getSelection();
  const text = selection.toString().trim();
  
  if (text.length > 0) {
    AppState.setSelectedText(text);
    
    setTimeout(() => {
      SyncButton.show();
    }, 200);
  } else {
    SyncButton.hide();
  }
}

function handleMouseUp(e) {
  setTimeout(handleSelection, 100);
}

function handleKeyUp(e) {
  if (e.key === 'Escape') {
    SyncButton.hide();
    UIComponents.closeSidebar();
  }
}

function initialize() {
  PlatformDetector.initialize();
  StorageManager.initialize();
  ConversationMonitor.initialize();
  
  document.addEventListener('mouseup', handleMouseUp);
  document.addEventListener('keyup', handleKeyUp);
}

initialize();
