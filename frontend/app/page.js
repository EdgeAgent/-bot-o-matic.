'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createBot, simulatePayment } from '../utils/api';
import styles from './VendingMachine.module.css';

const PERSONALITY_ARCHETYPES = [
    { name: 'Executive', emoji: '👔', color: '#4f46e5', pattern: 'solid' },
    { name: 'Analyst', emoji: '📊', color: '#0ea5e9', pattern: 'grid' },
    { name: 'Support', emoji: '🎧', color: '#10b981', pattern: 'dots' },
    { name: 'Creative', emoji: '🎨', color: '#f59e0b', pattern: 'waves' },
    { name: 'Coder', emoji: '💻', color: '#6366f1', pattern: 'binary' },
    { name: 'Sales', emoji: '🤝', color: '#ef4444', pattern: 'lines' },
];

const LLM_PROVIDERS = [
    { id: 'botomatic', name: 'Bot-O-Matic (Default)', price: 500, desc: 'Powered by our service' },
    { id: 'openai', name: 'OpenAI', price: 1000, desc: 'Use your own API key', requiresKey: true },
    { id: 'gemini', name: 'Google Gemini', price: 1000, desc: 'Use your own API key', requiresKey: true },
    { id: 'anthropic', name: 'Anthropic Claude', price: 1000, desc: 'Use your own API key', requiresKey: true },
];

export default function VendingMachine() {
    const [step, setStep] = useState(1);
    const [config, setConfig] = useState({
        name: '',
        personality: PERSONALITY_ARCHETYPES[0],
        tone: 50, // 0-100 slider (formal to casual)
        knowledgeBase: '',
        systemPrompt: '', // New field for advanced mode
        logoUrl: '', // New field for branding
        headerColor: '#4f46e5', // New field for branding
        llmProvider: 'botomatic',
        apiKey: '',
        llmModel: '',
    });
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showEggAnimation, setShowEggAnimation] = useState(false);

    const selectedProvider = LLM_PROVIDERS.find(p => p.id === config.llmProvider);
    const totalPrice = selectedProvider?.price || 500;

    const handleCreateBot = async () => {
        setLoading(true);
        setShowEggAnimation(true);

        try {
            // Simulate payment first
            const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

            if (isDemoMode) {
                await simulatePayment();
            }

            // Create bot
            const toneText = config.tone < 33 ? 'formal' : config.tone > 66 ? 'casual' : 'neutral';

            const botData = {
                name: config.name || `${config.personality.name} Agent`,
                personality: {
                    archetype: config.personality.name,
                    color: config.personality.color,
                    pattern: config.personality.pattern,
                },
                tone: toneText,
                knowledge_base: config.knowledgeBase,
                system_prompt: config.systemPrompt || null, // Pass system prompt
                logo_url: config.logoUrl || null,
                header_color: config.headerColor || null,
                llm_provider: config.llmProvider,
                llm_model: config.llmModel || null,
                api_key: config.apiKey || null,
                price: totalPrice,
            };

            const response = await createBot(botData);

            // Wait for animation
            await new Promise(resolve => setTimeout(resolve, 3000));

            setResult(response.data);
            setStep(4);
        } catch (error) {
            console.error('Failed to create bot:', error);
            alert('Failed to create bot. Please try again.');
        } finally {
            setLoading(false);
            setShowEggAnimation(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.machine}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.logo}>⚡ AI AGENT STUDIO</h1>
                    <p className={styles.tagline}>Forge Your Enterprise Intelligence</p>
                </div>

                {/* Egg Animation Overlay */}
                <AnimatePresence>
                    {showEggAnimation && (
                        <motion.div
                            className={styles.overlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <EggFormationAnimation personality={config.personality} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <div className={styles.content}>
                    {step === 1 && (
                        <Step1Customization
                            config={config}
                            setConfig={setConfig}
                            showAdvanced={showAdvanced}
                            setShowAdvanced={setShowAdvanced}
                            onNext={() => setStep(2)}
                        />
                    )}

                    {step === 2 && (
                        <Step2APISelection
                            config={config}
                            setConfig={setConfig}
                            onNext={() => setStep(3)}
                            onBack={() => setStep(1)}
                        />
                    )}

                    {step === 3 && (
                        <Step3Review
                            config={config}
                            totalPrice={totalPrice}
                            onPurchase={handleCreateBot}
                            onBack={() => setStep(2)}
                            loading={loading}
                        />
                    )}

                    {step === 4 && result && (
                        <Step4Success result={result} />
                    )}
                </div>
            </div>
        </div>
    );
}

// Step 1: Customization
function Step1Customization({ config, setConfig, showAdvanced, setShowAdvanced, onNext }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.step}
        >
            <h2>Step 1: Configure Agent</h2>

            {/* Personality Selection */}
            <div className={styles.section}>
                <label>Personality Archetype</label>
                <div className={styles.personalityGrid}>
                    {PERSONALITY_ARCHETYPES.map((p) => (
                        <motion.button
                            key={p.name}
                            className={`${styles.personalityCard} ${config.personality.name === p.name ? styles.selected : ''
                                }`}
                            onClick={() => setConfig({ ...config, personality: p })}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{ borderColor: p.color }}
                        >
                            <span className={styles.emoji}>{p.emoji}</span>
                            <span className={styles.label}>{p.name}</span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Tone Slider */}
            <div className={styles.section}>
                <label>Tone: {config.tone < 33 ? 'Formal' : config.tone > 66 ? 'Casual' : 'Balanced'}</label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.tone}
                    onChange={(e) => setConfig({ ...config, tone: parseInt(e.target.value) })}
                    className={styles.slider}
                />
                <div className={styles.sliderLabels}>
                    <span>Formal</span>
                    <span>Casual</span>
                </div>
            </div>

            {/* Knowledge Base */}
            <div className={styles.section}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label>Knowledge Base</label>
                    <button
                        className="btn-outline"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                        onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                        {showAdvanced ? 'Simple Mode' : 'Advanced Mode'}
                    </button>
                </div>

                {!showAdvanced ? (
                    <>
                        <textarea
                            placeholder="e.g., Expert on SaaS sales metrics and closing strategies..."
                            value={config.knowledgeBase}
                            onChange={(e) => setConfig({ ...config, knowledgeBase: e.target.value })}
                            className={styles.textarea}
                            rows={4}
                        />
                        <small className={styles.hint}>Describe what your agent should know about</small>
                    </>
                ) : (
                    <>
                        <textarea
                            placeholder="You are a helpful AI assistant..."
                            value={config.systemPrompt}
                            onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                            className={styles.textarea}
                            rows={8}
                            style={{ fontFamily: 'monospace' }}
                        />
                        <small className={styles.hint}>Directly edit the System Prompt (overrides auto-generation)</small>

                        <div style={{ marginTop: '1rem' }}>
                            <label>Custom Logo URL (Optional)</label>
                            <input
                                type="text"
                                placeholder="https://example.com/logo.png"
                                value={config.logoUrl}
                                onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                                className={styles.input}
                            />
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                            <label>Header Color</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="color"
                                    value={config.headerColor}
                                    onChange={(e) => setConfig({ ...config, headerColor: e.target.value })}
                                    style={{ width: '50px', padding: '0', height: '40px' }}
                                />
                                <input
                                    type="text"
                                    value={config.headerColor}
                                    onChange={(e) => setConfig({ ...config, headerColor: e.target.value })}
                                    className={styles.input}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Bot Name */}
            <div className={styles.section}>
                <label>Bot Name (Optional)</label>
                <input
                    type="text"
                    placeholder={`${config.personality.name} Bot`}
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    className={styles.input}
                />
            </div>

            <button
                className="btn-neon"
                onClick={onNext}
                disabled={!config.knowledgeBase && !config.systemPrompt}
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
            >
                Next: Select Intelligence →
            </button>
        </motion.div>
    );
}

// Step 2: API Selection
function Step2APISelection({ config, setConfig, onNext, onBack }) {
    const selectedProvider = LLM_PROVIDERS.find(p => p.id === config.llmProvider);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.step}
        >
            <h2>Step 2: Choose LLM Provider</h2>

            <div className={styles.providersGrid}>
                {LLM_PROVIDERS.map((provider) => (
                    <motion.button
                        key={provider.id}
                        className={`${styles.providerCard} ${config.llmProvider === provider.id ? styles.selected : ''
                            }`}
                        onClick={() => setConfig({ ...config, llmProvider: provider.id, apiKey: '' })}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <h3>{provider.name}</h3>
                        <p>{provider.desc}</p>
                        <div className={styles.price}>
                            ${(provider.price / 100).toFixed(2)}
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* API Key Input */}
            {selectedProvider?.requiresKey && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={styles.section}
                >
                    <label>API Key</label>
                    <input
                        type="password"
                        placeholder={`Enter your ${selectedProvider.name} API key`}
                        value={config.apiKey}
                        onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                        className={styles.input}
                    />
                    <small className={styles.hint}>
                        🔒 Your API key is encrypted and stored securely
                    </small>

                    {config.llmProvider === 'openai' && (
                        <div className={styles.section}>
                            <label>Model (Optional)</label>
                            <select
                                value={config.llmModel}
                                onChange={(e) => setConfig({ ...config, llmModel: e.target.value })}
                                className={styles.input}
                            >
                                <option value="">Default (gpt-4o-mini)</option>
                                <option value="gpt-4o-mini">GPT-4o Mini</option>
                                <option value="gpt-4o">GPT-4o</option>
                                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                            </select>
                        </div>
                    )}
                </motion.div>
            )}

            <div className={styles.buttonGroup}>
                <button className="btn-outline" onClick={onBack} style={{ flex: 1 }}>
                    ← Back
                </button>
                <button
                    className="btn-neon"
                    onClick={onNext}
                    disabled={selectedProvider?.requiresKey && !config.apiKey}
                    style={{ flex: 2 }}
                >
                    Next: Review & Pay →
                </button>
            </div>
        </motion.div>
    );
}

// Step 3: Review
function Step3Review({ config, totalPrice, onPurchase, onBack, loading }) {
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.step}
        >
            <h2>Step 3: Review & Purchase</h2>

            <div className="glass-card">
                <h3 style={{ marginBottom: '1rem' }}>Your Bot Configuration</h3>

                <div className={styles.reviewItem}>
                    <strong>Name:</strong> {config.name || `${config.personality.name} Bot`}
                </div>
                <div className={styles.reviewItem}>
                    <strong>Personality:</strong> {config.personality.emoji} {config.personality.name}
                </div>
                <div className={styles.reviewItem}>
                    <strong>Tone:</strong> {config.tone < 33 ? 'Formal' : config.tone > 66 ? 'Casual' : 'Balanced'}
                </div>
                <div className={styles.reviewItem}>
                    <strong>Knowledge:</strong> {config.knowledgeBase}
                </div>
                <div className={styles.reviewItem}>
                    <strong>Provider:</strong> {LLM_PROVIDERS.find(p => p.id === config.llmProvider)?.name}
                </div>

                <div className={styles.totalPrice}>
                    <strong>Total:</strong> ${(totalPrice / 100).toFixed(2)}
                </div>
            </div>

            {isDemoMode && (
                <div className={styles.demoNotice}>
                    🎮 Demo Mode: Payment will be simulated
                </div>
            )}

            <div className={styles.buttonGroup}>
                <button className="btn-outline" onClick={onBack} disabled={loading} style={{ flex: 1 }}>
                    ← Back
                </button>
                <button
                    className="btn-neon"
                    onClick={onPurchase}
                    disabled={loading}
                    style={{ flex: 2 }}
                >
                    {loading ? 'Creating Your Bot...' : isDemoMode ? 'Simulate Payment' : 'Proceed to Checkout'}
                </button>
            </div>
        </motion.div>
    );
}

// Step 4: Success
function Step4Success({ result }) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(result.redemptionUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={styles.step}
        >
            <div className={styles.success}>
                <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                    className={styles.successIcon}
                >
                    🎉
                </motion.div>
                <h2>Bot Created Successfully!</h2>
                <p>Scan the QR code or use the link below to claim your bot</p>

                <div className={styles.qrCode}>
                    <img src={result.qrCode} alt="QR Code" />
                </div>

                <div className={styles.redemptionCode}>
                    <strong>Redemption Code:</strong> {result.redemptionCode}
                </div>

                <div className={styles.urlSection}>
                    <input
                        type="text"
                        value={result.redemptionUrl}
                        readOnly
                        className={styles.input}
                    />
                    <button className="btn-outline" onClick={copyToClipboard}>
                        {copied ? '✓ Copied!' : 'Copy Link'}
                    </button>
                </div>

                <a href={result.redemptionUrl} className="btn-neon" style={{ display: 'block', textAlign: 'center', marginTop: '1rem' }}>
                    Open My Bot →
                </a>

                <button
                    className="btn-outline"
                    onClick={() => window.location.reload()}
                    style={{ marginTop: '1rem', width: '100%' }}
                >
                    Create Another Bot
                </button>
            </div>
        </motion.div>
    );
}

// Egg Formation Animation (Refactored to Neural Synthesis)
function EggFormationAnimation({ personality }) {
    return (
        <div className={styles.eggAnimation}>
            <motion.div
                className={styles.ingredients}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className={styles.ingredient} style={{ fontSize: '4rem' }}>{personality.emoji}</div>
            </motion.div>

            <motion.div
                className={styles.egg}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                style={{
                    background: `radial-gradient(circle, ${personality.color}, transparent)`,
                    boxShadow: `0 0 100px ${personality.color}`,
                    borderRadius: '50%',
                    width: '200px',
                    height: '200px',
                    filter: 'blur(10px)',
                }}
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: `2px solid ${personality.color}`,
                        borderRadius: '50%',
                        borderTopColor: 'transparent',
                        borderBottomColor: 'transparent',
                    }}
                />
            </motion.div>

            <motion.p
                className={styles.animationText}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                style={{ marginTop: '2rem', fontSize: '1.2rem', letterSpacing: '0.1em' }}
            >
                INITIALIZING NEURAL CORE...
            </motion.p>
        </div>
    );
}
