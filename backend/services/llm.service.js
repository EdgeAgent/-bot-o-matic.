const axios = require('axios');
const { decrypt } = require('../utils/encryption');

/**
 * LLM Service - Orchestrates multiple LLM providers
 */
class LLMService {
    constructor() {
        this.defaultProvider = process.env.DEFAULT_LLM_PROVIDER || 'openai';
        this.defaultKeys = {
            openai: process.env.DEFAULT_OPENAI_API_KEY,
            gemini: process.env.DEFAULT_GEMINI_API_KEY,
            anthropic: process.env.DEFAULT_ANTHROPIC_API_KEY
        };
    }

    /**
     * Generate a response from the LLM
     * @param {Object} bot - Bot configuration
     * @param {Array} messages - Conversation history
     * @param {string} userMessage - New user message
     * @returns {Promise<string>} - LLM response
     */
    async generateResponse(bot, messages, userMessage) {
        const provider = bot.llm_provider || this.defaultProvider;

        // Get API key (decrypt user's key or use default)
        let apiKey;
        if (bot.encrypted_api_key) {
            apiKey = decrypt(bot.encrypted_api_key);
        } else {
            apiKey = this.defaultKeys[provider];
        }

        if (!apiKey) {
            throw new Error(`No API key available for provider: ${provider}`);
        }

        // Build system prompt from bot configuration
        const systemPrompt = bot.system_prompt || this.buildSystemPrompt(bot);

        // Format conversation history
        const formattedMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: userMessage }
        ];

        // Call appropriate provider
        switch (provider) {
            case 'openai':
                return await this.callOpenAI(apiKey, formattedMessages, bot.llm_model);
            case 'gemini':
                return await this.callGemini(apiKey, formattedMessages, bot.llm_model);
            case 'anthropic':
                return await this.callAnthropic(apiKey, formattedMessages, bot.llm_model);
            default:
                throw new Error(`Unsupported LLM provider: ${provider}`);
        }
    }

    /**
     * Build system prompt from bot personality and knowledge base
     * @param {Object} bot - Bot configuration
     * @returns {string} - System prompt
     */
    buildSystemPrompt(bot) {
        const personality = JSON.parse(bot.personality);
        const tone = bot.tone || 'neutral';

        let prompt = `You are ${bot.name}, an AI assistant with the following characteristics:\n\n`;

        // Add personality
        prompt += `Personality: ${personality.archetype || 'Helpful'}\n`;
        prompt += `Tone: ${tone}\n\n`;

        // Add knowledge base
        prompt += `Your area of expertise: ${bot.knowledge_base}\n\n`;

        // Add behavior guidelines
        prompt += `Guidelines:\n`;
        prompt += `- Stay in character with your personality\n`;
        prompt += `- Focus on your area of expertise\n`;
        prompt += `- Be conversational and engaging\n`;
        prompt += `- If asked about topics outside your expertise, politely acknowledge limitations but try to help\n`;

        return prompt;
    }

    /**
     * Call OpenAI API
     */
    async callOpenAI(apiKey, messages, model = 'gpt-4o-mini') {
        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: model,
                    messages: messages,
                    max_tokens: 500,
                    temperature: 0.7
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('OpenAI API Error:', error.response?.data || error.message);
            throw new Error('Failed to generate response from OpenAI');
        }
    }

    /**
     * Call Google Gemini API
     */
    async callGemini(apiKey, messages, model = 'gemini-2.0-flash-exp') {
        try {
            // Convert messages to Gemini format
            const systemMsg = messages.find(m => m.role === 'system');
            const conversationMsgs = messages.filter(m => m.role !== 'system');

            // Gemini uses different format - combine system with first user message
            const formattedMessages = conversationMsgs.map((msg, idx) => {
                if (idx === 0 && msg.role === 'user' && systemMsg) {
                    return {
                        role: 'user',
                        parts: [{ text: `${systemMsg.content}\n\nUser: ${msg.content}` }]
                    };
                }
                return {
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                };
            });

            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
                {
                    contents: formattedMessages,
                    generationConfig: {
                        maxOutputTokens: 500,
                        temperature: 0.7
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Gemini API Error:', error.response?.data || error.message);
            throw new Error('Failed to generate response from Gemini');
        }
    }

    /**
     * Call Anthropic Claude API
     */
    async callAnthropic(apiKey, messages, model = 'claude-3-haiku-20240307') {
        try {
            // Anthropic separates system message
            const systemMsg = messages.find(m => m.role === 'system');
            const conversationMsgs = messages.filter(m => m.role !== 'system');

            const response = await axios.post(
                'https://api.anthropic.com/v1/messages',
                {
                    model: model,
                    max_tokens: 500,
                    system: systemMsg?.content || '',
                    messages: conversationMsgs
                },
                {
                    headers: {
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.content[0].text;
        } catch (error) {
            console.error('Anthropic API Error:', error.response?.data || error.message);
            throw new Error('Failed to generate response from Anthropic');
        }
    }
}

module.exports = new LLMService();
