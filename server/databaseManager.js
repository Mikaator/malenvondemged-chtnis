const { Pool } = require('pg');
const redis = require('redis');

class DatabaseManager {
  constructor() {
    this.pool = null;
    this.redisClient = null;
    this.initializeDatabases();
  }

  async initializeDatabases() {
    // PostgreSQL connection
    if (process.env.DATABASE_URL) {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      
      // Create tables on startup
      await this.createTables();
    } else {
      console.log('No DATABASE_URL provided, running without database');
    }

    // Redis connection (optional)
    if (process.env.REDIS_URL) {
      this.redisClient = redis.createClient({
        url: process.env.REDIS_URL
      });
      
      this.redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });
      
      try {
        await this.redisClient.connect();
        console.log('Connected to Redis');
      } catch (error) {
        console.log('Redis connection failed, continuing without Redis:', error.message);
        this.redisClient = null;
      }
    } else {
      console.log('No REDIS_URL provided, running without Redis');
    }
  }

  async saveGameSession(gameData) {
    if (!this.pool) return null;

    try {
      const query = `
        INSERT INTO game_sessions (id, room_code, players, settings, game_state, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          players = $3,
          settings = $4,
          game_state = $5,
          updated_at = $6
      `;
      
      const values = [
        gameData.id,
        gameData.roomCode,
        JSON.stringify(gameData.players),
        JSON.stringify(gameData.settings),
        gameData.gameState,
        new Date()
      ];

      await this.pool.query(query, values);
      return true;
    } catch (error) {
      console.error('Error saving game session:', error);
      return false;
    }
  }

  async getGameSession(roomCode) {
    if (!this.pool) return null;

    try {
      const query = 'SELECT * FROM game_sessions WHERE room_code = $1';
      const result = await this.pool.query(query, [roomCode]);
      
      if (result.rows.length === 0) return null;
      
      const session = result.rows[0];
      return {
        id: session.id,
        roomCode: session.room_code,
        players: JSON.parse(session.players),
        settings: JSON.parse(session.settings),
        gameState: session.game_state,
        createdAt: session.created_at
      };
    } catch (error) {
      console.error('Error getting game session:', error);
      return null;
    }
  }

  async savePlayerStats(playerId, stats) {
    if (!this.pool) return null;

    try {
      const query = `
        INSERT INTO player_stats (player_id, games_played, total_score, best_score, created_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (player_id) DO UPDATE SET
          games_played = player_stats.games_played + $2,
          total_score = player_stats.total_score + $3,
          best_score = GREATEST(player_stats.best_score, $4),
          updated_at = $5
      `;
      
      const values = [
        playerId,
        stats.gamesPlayed || 1,
        stats.totalScore || 0,
        stats.bestScore || 0,
        new Date()
      ];

      await this.pool.query(query, values);
      return true;
    } catch (error) {
      console.error('Error saving player stats:', error);
      return false;
    }
  }

  async getPlayerStats(playerId) {
    if (!this.pool) return null;

    try {
      const query = 'SELECT * FROM player_stats WHERE player_id = $1';
      const result = await this.pool.query(query, [playerId]);
      
      if (result.rows.length === 0) return null;
      
      return result.rows[0];
    } catch (error) {
      console.error('Error getting player stats:', error);
      return null;
    }
  }

  async cacheLobbyData(roomCode, data, ttl = 3600) {
    if (!this.redisClient) return false;

    try {
      await this.redisClient.setEx(`lobby:${roomCode}`, ttl, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error caching lobby data:', error);
      return false;
    }
  }

  async getCachedLobbyData(roomCode) {
    if (!this.redisClient) return null;

    try {
      const data = await this.redisClient.get(`lobby:${roomCode}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting cached lobby data:', error);
      return null;
    }
  }

  async createTables() {
    if (!this.pool) return false;

    try {
      // Game sessions table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS game_sessions (
          id VARCHAR(255) PRIMARY KEY,
          room_code VARCHAR(10) UNIQUE NOT NULL,
          players JSONB NOT NULL,
          settings JSONB NOT NULL,
          game_state VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Player stats table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS player_stats (
          player_id VARCHAR(255) PRIMARY KEY,
          games_played INTEGER DEFAULT 0,
          total_score INTEGER DEFAULT 0,
          best_score INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      return true;
    } catch (error) {
      console.error('Error creating tables:', error);
      return false;
    }
  }
}

module.exports = DatabaseManager;
