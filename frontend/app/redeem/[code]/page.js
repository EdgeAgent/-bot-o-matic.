'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { redeemBot, sendMessage, getChatHistory } from '../../../utils/api';
import styles from './Redeem.module.css';

export default function RedeemPage() {
    const params = useParams();
    const code = params.code;

    const [bot, setBot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hatched, setHatched] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef(null);

    // Redeem bot
    useEffect(() => {
        if (code) {
            redeemBot(code, null)
                .then((response) => {
                    setBot(response.data.bot);
                    setLoading(false);

                    // Load chat history if exists
                    loadChatHistory(response.data.bot.id);
                })
                .catch((err) => {
                    setError(err.response?.data?.error || 'Failed to load bot');
                    setLoading(false);
                });
        }
    }, [code]);

    const loadChatHistory = async (botId) => {
        try {
            const response = await getChatHistory(botId, null);
            if (response.data.messages && response.data.messages.length > 0) {
                setMessages(response.data.messages);
                setHatched(true); // Auto-hatch if already chatted
            }
        } catch (err) {
            console.error('Failed to load chat history:', err);
        }
    };

    const handleHatch = () => {
        setHatched(true);

        // Send welcome message from bot
        const welcomeMessage = {
            role: 'assistant',
            content: `Hello! I'm ${bot.name}, your ${bot.personality.archetype} AI assistant. ${bot.knowledge_base}. How can I help you today?`,
            timestamp: new Date().toISOString(),
        };

        setMessages([welcomeMessage]);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!inputMessage.trim() || sending) return;

        const userMsg = {
            role: 'user',
            content: inputMessage,
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInputMessage('');
        setSending(true);

        try {
            const response = await sendMessage(bot.id, inputMessage, null);

            const botMsg = {
                role: 'assistant',
                content: response.data.message,
                timestamp: new Date().toISOString(),
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            console.error('Failed to send message:', err);

            const errorMsg = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toISOString(),
            };

            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setSending(false);
        }
    };

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading your bot...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <h2>❌ {error}</h2>
                    <a href="/" className="btn-outline">Go Back</a>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {!hatched ? (
                <EggView bot={bot} onHatch={handleHatch} />
            ) : (
                <ChatView
                    bot={bot}
                    messages={messages}
                    inputMessage={inputMessage}
                    setInputMessage={setInputMessage}
                    handleSendMessage={handleSendMessage}
                    sending={sending}
                    messagesEndRef={messagesEndRef}
                />
            )}
        </div>
    );
}

// Egg View Component
function EggView({ bot, onHatch }) {
    const [cracking, setCracking] = useState(false);

    const handleClick = () => {
        setCracking(true);
        setTimeout(() => {
            onHatch();
        }, 1500);
    };

    return (
        <motion.div
            className={styles.eggView}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <h1 className={styles.title}>Your Bot is Ready!</h1>
            <p className={styles.subtitle}>Tap the egg to hatch it</p>

            <motion.div
                className={styles.eggContainer}
                onClick={handleClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <AnimatePresence>
                    {!cracking ? (
                        <motion.div
                            key="egg"
                            className={styles.egg}
                            style={{
                                background: `linear-gradient(135deg, ${bot.egg_design.color}, ${bot.egg_design.color}88)`,
                                boxShadow: `0 0 50px ${bot.egg_design.color}`,
                            }}
                            animate={{
                                rotate: [0, -5, 5, -5, 0],
                                scale: [1, 1.02, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatType: 'mirror',
                            }}
                            exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
                        >
                            <div className={styles.eggPattern}></div>
                            <motion.div
                                className={styles.eggGlow}
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="cracking"
                            className={styles.cracking}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <motion.div
                                className={styles.crack}
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1 }}
                            />
                            <div className={styles.shine}></div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <div className={styles.botInfo}>
                <h2>{bot.name}</h2>
                <p className={styles.personality}>
                    {bot.personality.archetype} · {bot.tone}
                </p>
                <p className={styles.knowledge}>{bot.knowledge_base}</p>
            </div>
        </motion.div>
    );
}

// Chat View Component
function ChatView({ bot, messages, inputMessage, setInputMessage, handleSendMessage, sending, messagesEndRef }) {
    return (
        <div className={styles.chatView}>
            {/* Header */}
            <div className={styles.chatHeader}>
                <div className={styles.botAvatar} style={{ background: bot.egg_design.color }}>
                    {bot.name.charAt(0)}
                </div>
                <div className={styles.botHeaderInfo}>
                    <h2>{bot.name}</h2>
                    <p>{bot.personality.archetype}</p>
                </div>
            </div>

            {/* Messages */}
            <div className={styles.messagesContainer}>
                <AnimatePresence>
                    {messages.map((msg, index) => (
                        <motion.div
                            key={index}
                            className={`${styles.message} ${styles[msg.role]}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            {msg.role === 'assistant' && (
                                <div className={styles.avatar} style={{ background: bot.egg_design.color }}>
                                    {bot.name.charAt(0)}
                                </div>
                            )}
                            <div className={styles.messageContent}>
                                <p>{msg.content}</p>
                                <span className={styles.timestamp}>
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {sending && (
                    <div className={`${styles.message} ${styles.assistant}`}>
                        <div className={styles.avatar} style={{ background: bot.egg_design.color }}>
                            {bot.name.charAt(0)}
                        </div>
                        <div className={styles.messageContent}>
                            <div className={styles.typing}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form className={styles.inputForm} onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={`Message ${bot.name}...`}
                    className={styles.input}
                    disabled={sending}
                />
                <button
                    type="submit"
                    className="btn-neon"
                    disabled={!inputMessage.trim() || sending}
                >
                    Send
                </button>
            </form>
        </div>
    );
}
