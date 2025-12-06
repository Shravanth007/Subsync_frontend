const APIClient = {
  detectProvider(apiKey) {
    if (!apiKey) return null;
    
    if (apiKey.startsWith('sk-') || apiKey.startsWith('org-')) {
      return 'openai';
    } else if (apiKey.startsWith('sk-ant-')) {
      return 'anthropic';
    } else if (apiKey.startsWith('AIzaSy')) {
      return 'gemini';
    } else if (apiKey.startsWith('sk-or-')) {
      return 'openrouter';
    }
    return 'openrouter';
  },

  async callOpenAI(messages, model) {
    const apiKey = Config.API_KEY;
    const modelToUse = model || Config.MODEL_NAME || 'gpt-4o-mini';
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    return result.choices[0].message.content;
  },

  async callAnthropic(messages, model) {
    const apiKey = Config.API_KEY;
    const modelToUse = model || Config.MODEL_NAME || 'claude-3-5-sonnet-20241022';
    
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: modelToUse,
        max_tokens: 4096,
        system: systemMessage ? systemMessage.content : undefined,
        messages: conversationMessages
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    return result.content[0].text;
  },

  async callGemini(messages, model) {
    const apiKey = Config.API_KEY;
    const modelToUse = model || Config.MODEL_NAME || 'gemini-2.5-flash';
    
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');
    
    if (systemMessage && conversationMessages.length > 0) {
      conversationMessages[0].content = systemMessage.content + '\n\n' + conversationMessages[0].content;
    }
    
    const contents = conversationMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    
    const requestBody = {
      contents: contents
    };
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${modelToUse}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    return result.candidates[0].content.parts[0].text;
  },

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

    const provider = this.detectProvider(Config.API_KEY);
    let assistantMessage = null;

    try {
      switch (provider) {
        case 'openai':
          assistantMessage = await this.callOpenAI(messages);
          break;
        case 'anthropic':
          assistantMessage = await this.callAnthropic(messages);
          break;
        case 'gemini':
          assistantMessage = await this.callGemini(messages);
          break;
        case 'openrouter':
        default:
          assistantMessage = await this.callOpenRouterDirectly(messages);
          break;
      }
    } catch (error) {
      throw new Error(`API call failed: ${error.message}`);
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
      return null;
    }
  }
};
