const APIClient = {
  async callOpenRouterDirectly(messages, model) {
    const apiKey = Config.API_KEY;
    const modelToUse = model || Config.MODEL_NAME || 'openai/gpt-4o-mini-2024-07-18';
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.href,
        'X-Title': 'SubSync Extension'
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: messages
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    return result.choices[0].message.content;
  },

  async callMegaLLMDirectly(messages, model) {
    const apiKey = Config.API_KEY;
    const modelToUse = model || Config.MODEL_NAME || 'openai-gpt-oss-20b';
    
    const response = await fetch('https://ai.megallm.io/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: messages
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MegaLLM API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    return result.choices[0].message.content;
  },

  async sendChatMessageDirect(userMessage, context, conversationHistory) {
    const messages = [
      {
        role: 'system',
        content: `You are a helpful assistant. The user is asking a question about this conversation context:\n\n${context}\n\nAnswer their questions based on this context.`
      }
    ];
    
    for (const msg of conversationHistory) {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }
    
    messages.push({
      role: 'user',
      content: userMessage
    });

    let assistantMessage = null;
    let lastError = null;

    try {
      assistantMessage = await this.callOpenRouterDirectly(messages);
    } catch (error) {
      lastError = error.message;
      console.warn('SubSync: OpenRouter failed, trying MegaLLM:', lastError);
      
      try {
        assistantMessage = await this.callMegaLLMDirectly(messages);
      } catch (megaError) {
        lastError = megaError.message;
        console.error('SubSync: All direct API calls failed:', lastError);
        throw new Error(`All API providers failed: ${lastError}`);
      }
    }

    return {
      response: assistantMessage,
      timestamp: new Date().toISOString()
    };
  },

  async sendChatMessage(userMessage, context, sessionId, conversationHistory) {
    if (Config.API_KEY && Config.API_KEY.trim()) {
      return await this.sendChatMessageDirect(userMessage, context, conversationHistory);
    }
    const response = await fetch(`${Config.BACKEND_URL}/chat`, {
      method: 'POST',
      headers: Config.getHeaders(),
      body: JSON.stringify({
        user_message: userMessage,
        context: context,
        session_id: sessionId,
        conversation_history: conversationHistory
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },
  
  async syncSelection(sessionId) {
    try {
      const response = await fetch(`${Config.BACKEND_URL}/sync`, {
        method: 'POST',
        headers: Config.getHeaders(),
        body: JSON.stringify({
          session_id: sessionId
        })
      });
      
      return await response.json();
    } catch (error) {
      console.debug('SubSync: Could not sync selection:', error.message);
      return null;
    }
  }
};
