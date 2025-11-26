const express = require('express');
const db = require('../database');
const { encrypt } = require('../utils/encryption');
const { generateRedemptionCode, generateQRCode, getRedemptionUrl } = require('../utils/qrcode-generator');

const router = express.Router();

/**
 * Create a new bot configuration
 */
router.post('/create', async (req, res) => {
    try {
        const {
            name,
            personality,
            tone,
            knowledge_base,
            llm_provider,
            llm_model,
            api_key,
            price,
            userId
        } = req.body;

        // Validate required fields
        if (!name || !personality || !knowledge_base || !llm_provider || !price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Encrypt API key if provided
        const encryptedApiKey = api_key ? encrypt(api_key) : null;

        // Generate egg design based on personality
        const eggDesign = JSON.stringify({
            color: personality.color || '#6366f1',
            pattern: personality.pattern || 'dots',
            glow: llm_provider
        });

        // Generate unique redemption code
        const redemptionCode = generateRedemptionCode();

        // Insert bot into database
        const result = db.prepare(`
      INSERT INTO bots (
        user_id, name, personality, tone, knowledge_base,
        llm_provider, llm_model, encrypted_api_key,
        egg_design, redemption_code, price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
            userId || null,
            name,
            JSON.stringify(personality),
            tone || 'neutral',
            knowledge_base,
            llm_provider,
            llm_model || null,
            encryptedApiKey,
            eggDesign,
            redemptionCode,
            price
        );

        const botId = result.lastInsertRowid;

        // Generate QR code
        const qrCodeDataUrl = await generateQRCode(redemptionCode);
        const redemptionUrl = getRedemptionUrl(redemptionCode);

        res.json({
            botId,
            redemptionCode,
            redemptionUrl,
            qrCode: qrCodeDataUrl,
            message: 'Bot created successfully!'
        });
    } catch (error) {
        console.error('Bot creation error:', error);
        res.status(500).json({ error: 'Failed to create bot' });
    }
});

/**
 * Redeem a bot using redemption code
 */
router.post('/redeem', (req, res) => {
    try {
        const { code, userId } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Redemption code required' });
        }

        // Find bot by redemption code
        const bot = db.prepare('SELECT * FROM bots WHERE redemption_code = ?').get(code);

        if (!bot) {
            return res.status(404).json({ error: 'Invalid redemption code' });
        }

        // Mark as redeemed and associate with user
        if (!bot.redeemed && userId) {
            db.prepare('UPDATE bots SET redeemed = 1, user_id = ? WHERE id = ?')
                .run(userId, bot.id);
            bot.redeemed = 1;
            bot.user_id = userId;
        }

        // Parse JSON fields
        bot.personality = JSON.parse(bot.personality);
        bot.egg_design = JSON.parse(bot.egg_design);

        // Remove sensitive data
        delete bot.encrypted_api_key;

        res.json({ bot });
    } catch (error) {
        console.error('Redemption error:', error);
        res.status(500).json({ error: 'Failed to redeem bot' });
    }
});

/**
 * Get bot by ID
 */
router.get('/:id', (req, res) => {
    try {
        const bot = db.prepare('SELECT * FROM bots WHERE id = ?').get(req.params.id);

        if (!bot) {
            return res.status(404).json({ error: 'Bot not found' });
        }

        // Parse JSON fields
        bot.personality = JSON.parse(bot.personality);
        bot.egg_design = JSON.parse(bot.egg_design);

        // Remove sensitive data
        delete bot.encrypted_api_key;

        res.json({ bot });
    } catch (error) {
        console.error('Get bot error:', error);
        res.status(500).json({ error: 'Failed to get bot' });
    }
});

/**
 * Get all bots for a user
 */
router.get('/user/:userId', (req, res) => {
    try {
        const bots = db.prepare('SELECT * FROM bots WHERE user_id = ? ORDER BY created_at DESC')
            .all(req.params.userId);

        // Parse JSON fields and remove sensitive data
        const processedBots = bots.map(bot => {
            bot.personality = JSON.parse(bot.personality);
            bot.egg_design = JSON.parse(bot.egg_design);
            delete bot.encrypted_api_key;
            return bot;
        });

        res.json({ bots: processedBots });
    } catch (error) {
        console.error('Get user bots error:', error);
        res.status(500).json({ error: 'Failed to get bots' });
    }
});

module.exports = router;
