const ConversationScraper = {
  scrapeConversation() {
    const messages = [];
    
    if (AppState.currentPlatform === 'chatgpt') {
      return this.scrapeChatGPT();
    } else if (AppState.currentPlatform === 'claude') {
      return this.scrapeClaude();
    }
    
    return 'No conversation found.';
  },
  
  scrapeChatGPT() {
    const messages = [];
    const conversationElements = document.querySelectorAll('[data-message-author-role]');
    
    conversationElements.forEach((element) => {
      const role = element.getAttribute('data-message-author-role');
      const contentElement = element.querySelector('.markdown, .whitespace-pre-wrap');
      
      if (contentElement) {
        const content = contentElement.innerText || contentElement.textContent;
        if (content && content.trim()) {
          messages.push({
            role: role,
            content: content.trim()
          });
        }
      }
    });
    
    return this.formatMessages(messages);
  },
  
  scrapeClaude() {
    const messages = [];
    
    const conversationArea = document.querySelector('main') || 
                            document.querySelector('[role="main"]') || 
                            document.body;
    
    const potentialMessages = [];
    
    conversationArea.querySelectorAll('div').forEach((div) => {
      const hasDirectText = Array.from(div.childNodes).some(node => 
        node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 20
      );
      
      const hasParagraphs = div.querySelectorAll(':scope > p, :scope > div > p').length > 0;
      
      const fullText = div.textContent?.trim() || '';
      
      if ((hasDirectText || hasParagraphs) && 
          fullText.length > 30 &&
          !div.querySelector('button') &&
          !div.querySelector('input') &&
          !div.querySelector('textarea') &&
          !div.querySelector('nav') &&
          !fullText.match(/^(Copy|Retry|New chat|Settings)/)) {
        
        let depth = 0;
        let parent = div.parentElement;
        while (parent && parent !== conversationArea) {
          depth++;
          parent = parent.parentElement;
        }
        
        potentialMessages.push({
          element: div,
          text: fullText,
          depth: depth,
          hasP: hasParagraphs
        });
      }
    });
    
    potentialMessages.sort((a, b) => a.depth - b.depth);
    
    const uniqueMessages = [];
    potentialMessages.forEach(msg => {
      const isDuplicate = uniqueMessages.some(existing => 
        existing.element.contains(msg.element) || 
        (existing.text === msg.text && existing.element !== msg.element)
      );
      
      if (!isDuplicate) {
        uniqueMessages.push(msg);
      }
    });
    
    uniqueMessages.forEach((msg, index) => {
      const text = msg.text;
      
      if (text && text.length > 30) {
        const role = index % 2 === 0 ? 'user' : 'assistant';
        
        messages.push({
          role: role,
          content: text
        });
      }
    });
    
    if (messages.length === 0) {
      return this.scrapeClaude_Fallback(conversationArea);
    }
    
    return this.formatMessages(messages);
  },
  
  scrapeClaude_Fallback(conversationArea) {
    const messages = [];
    const textBlocks = [];
    
    conversationArea.querySelectorAll('p, div[class*="whitespace"]').forEach(el => {
      const text = el.textContent?.trim();
      if (text && text.length > 30 && !text.match(/^(Copy|Retry|New chat)/)) {
        textBlocks.push(text);
      }
    });
    
    const seen = new Set();
    textBlocks.forEach((text, index) => {
      if (!seen.has(text)) {
        seen.add(text);
        messages.push({
          role: index % 2 === 0 ? 'user' : 'assistant',
          content: text
        });
      }
    });
    
    return this.formatMessages(messages);
  },
  
  formatMessages(messages) {
    let contextStr = '';
    messages.forEach(msg => {
      contextStr += `${msg.role.toUpperCase()}: ${msg.content}\n\n`;
    });
    
    return contextStr || 'No conversation found.';
  },

  getLastNMessages(n = 3) {
    const messages = [];
    
    if (AppState.currentPlatform === 'chatgpt') {
      const conversationElements = document.querySelectorAll('[data-message-author-role]');
      const totalMessages = conversationElements.length;
      const startIndex = Math.max(0, totalMessages - n);
      
      for (let i = startIndex; i < totalMessages; i++) {
        const element = conversationElements[i];
        const role = element.getAttribute('data-message-author-role');
        const contentElement = element.querySelector('.markdown, .whitespace-pre-wrap');
        
        if (contentElement) {
          const content = contentElement.innerText || contentElement.textContent;
          if (content && content.trim()) {
            messages.push({
              role: role === 'user' ? 'user' : 'assistant',
              content: content.trim()
            });
          }
        }
      }
    } else if (AppState.currentPlatform === 'claude') {
      const conversationArea = document.querySelector('main') || 
                              document.querySelector('[role="main"]') || 
                              document.body;
      
      const potentialMessages = [];
      
      conversationArea.querySelectorAll('div').forEach((div) => {
        const hasDirectText = Array.from(div.childNodes).some(node => 
          node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 20
        );
        
        const hasParagraphs = div.querySelectorAll(':scope > p, :scope > div > p').length > 0;
        const fullText = div.textContent?.trim() || '';
        
        if ((hasDirectText || hasParagraphs) && 
            fullText.length > 30 &&
            !div.querySelector('button') &&
            !div.querySelector('input') &&
            !div.querySelector('textarea') &&
            !div.querySelector('nav') &&
            !fullText.match(/^(Copy|Retry|New chat|Settings)/)) {
          
          let depth = 0;
          let parent = div.parentElement;
          while (parent && parent !== conversationArea) {
            depth++;
            parent = parent.parentElement;
          }
          
          potentialMessages.push({
            text: fullText,
            depth: depth
          });
        }
      });
      
      potentialMessages.sort((a, b) => a.depth - b.depth);
      
      const uniqueMessages = [];
      const seen = new Set();
      
      potentialMessages.forEach(msg => {
        if (!seen.has(msg.text)) {
          seen.add(msg.text);
          uniqueMessages.push(msg);
        }
      });
      
      const startIndex = Math.max(0, uniqueMessages.length - n);
      for (let i = startIndex; i < uniqueMessages.length; i++) {
        messages.push({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: uniqueMessages[i].text
        });
      }
    }
    
    return messages;
  }
};
