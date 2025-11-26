const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../database');

const router = express.Router();

/**
 * Create Stripe checkout session
 */
router.post('/create-checkout', async (req, res) => {
    try {
        const { botConfig, price } = req.body;

        if (!botConfig || !price) {
            return res.status(400).json({ error: 'Bot configuration and price required' });
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `AI Chatbot: ${botConfig.name}`,
                            description: `${botConfig.personality.archetype} - ${botConfig.knowledge_base}`,
                        },
                        unit_amount: price, // price in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
            metadata: {
                botConfig: JSON.stringify(botConfig)
            }
        });

        res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

/**
 * Handle Stripe webhook events
 */
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        // Create bot from metadata
        const botConfig = JSON.parse(session.metadata.botConfig);

        // TODO: Create bot using botConfig
        // This would call the same logic as POST /api/bots/create

        console.log('Payment successful for bot:', botConfig.name);
    }

    res.json({ received: true });
});

/**
 * Simulate payment (for demo mode)
 */
router.post('/simulate', (req, res) => {
    try {
        // Just return success - actual bot creation happens in separate endpoint
        res.json({
            success: true,
            message: 'Payment simulated successfully'
        });
    } catch (error) {
        console.error('Simulate payment error:', error);
        res.status(500).json({ error: 'Failed to simulate payment' });
    }
});

module.exports = router;
