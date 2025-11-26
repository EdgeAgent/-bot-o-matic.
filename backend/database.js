const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'data', 'botomatic.db');
const dbDir = path.dirname(dbPath);

// Create data directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log('Initializing database at:', dbPath);
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const createTables = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      personality TEXT NOT NULL,
      tone TEXT DEFAULT 'neutral',
      knowledge_base TEXT NOT NULL,
      system_prompt TEXT,
      logo_url TEXT,
      header_color TEXT,
      llm_provider TEXT NOT NULL,
      llm_model TEXT,
      encrypted_api_key TEXT,
      egg_design TEXT NOT NULL,
      redemption_code TEXT UNIQUE NOT NULL,
      redeemed BOOLEAN DEFAULT 0,
      price INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bot_id INTEGER NOT NULL,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_bots_redemption_code ON bots(redemption_code);
    CREATE INDEX IF NOT EXISTS idx_bots_user_id ON bots(user_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_bot_id ON conversations(bot_id);
    CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
  `);

  // Migration: Add columns if they don't exist
  try {
    db.exec('ALTER TABLE bots ADD COLUMN system_prompt TEXT');
  } catch (e) { }

  try {
    db.exec('ALTER TABLE bots ADD COLUMN logo_url TEXT');
    console.log('✅ Added logo_url column');
  } catch (e) { }

  try {
    db.exec('ALTER TABLE bots ADD COLUMN header_color TEXT');
    console.log('✅ Added header_color column');
  } catch (e) { }

  console.log('✅ Database tables initialized');
};

createTables();

module.exports = db;
