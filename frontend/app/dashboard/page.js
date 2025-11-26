'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getUserBots } from '../../utils/api';
import styles from './Dashboard.module.css';

export default function Dashboard() {
    const [bots, setBots] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // For demo, we'll show message to use redemption codes
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>My Bot Collection</h1>
                <a href="/" className="btn-neon">Create New Bot</a>
            </div>

            <div className={styles.content}>
                {bots.length === 0 ? (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>🤖</div>
                        <h2>No Bots Yet</h2>
                        <p>Create your first custom AI chatbot to get started!</p>
                        <a href="/" className="btn-neon">Create Your First Bot</a>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {bots.map((bot) => (
                            <BotCard key={bot.id} bot={bot} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function BotCard({ bot }) {
    return (
        <motion.div
            className={styles.botCard}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
        >
            <div
                className={styles.egg}
                style={{
                    background: `linear-gradient(135deg, ${bot.egg_design.color}, ${bot.egg_design.color}88)`,
                }}
            >
                <div className={styles.eggGlow} />
            </div>

            <div className={styles.botInfo}>
                <h3>{bot.name}</h3>
                <p className={styles.personality}>{bot.personality.archetype}</p>
                <p className={styles.knowledge}>{bot.knowledge_base}</p>
            </div>

            <a href={`/redeem/${bot.redemption_code}`} className="btn-outline">
                Open Chat
            </a>
        </motion.div>
    );
}
