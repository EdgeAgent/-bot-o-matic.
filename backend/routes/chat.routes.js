const express = require('express');
const db = require('../database');
const llmService = require('../services/llm.service');

const router = express.Router();

/**
 * Send a message to a bot
 */
router.post('/:botId', async (req, res) => {
    try {
        const { botId } = req.params;
        const { message, userId } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get bot configuration
        const bot = db.prepare('SELECT * FROM bots WHERE id = ?').get(botId);
        if (!bot) {
            return res.status(404).json({ error: 'Bot not found' });
        }

        // Get or create conversation
        let conversation = db.prepare(
            'SELECT * FROM conversations WHERE bot_id = ? AND user_id = ?'
        ).get(botId, userId || null);

        if (!conversation) {
            const result = db.prepare(
                'INSERT INTO conversations (bot_id, user_id) VALUES (?, ?)'
            ).run(botId, userId || null);

            conversation = { id: result.lastInsertRowid };
        }

        // Save user message
        db.prepare(
            'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)'
        ).run(conversation.id, 'user', message);

        // Get conversation history (last 10 messages)
        const history = db.prepare(
            'SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY timestamp DESC LIMIT 10'
        ).all(conversation.id);

        // Reverse to get chronological order
        history.reverse();

        // Generate bot response using LLM service
        const botResponse = await llmService.generateResponse(bot, history, message);

        // Save bot response
        db.prepare(
            'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)'
        ).run(conversation.id, 'assistant', botResponse);

        // Update conversation timestamp
        db.prepare(
            'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).run(conversation.id);

        res.json({
            message: botResponse,
            conversationId: conversation.id
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: error.message || 'Failed to process message' });
    }
});

/**
 * Get conversation history for a bot
 */
router.get('/:botId/history', (req, res) => {
    try {
        const { botId } = req.params;
        const { userId } = req.query;

        // Get conversation
        const conversation = db.prepare(
            'SELECT * FROM conversations WHERE bot_id = ? AND user_id = ?'
        ).get(botId, userId || null);

        if (!conversation) {
            return res.json({ messages: [] });
        }

        // Get messages
        const messages = db.prepare(
            'SELECT role, content, timestamp FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC'
        ).all(conversation.id);

        res.json({ messages });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Failed to get history' });
    }
});

module.exports = router;
