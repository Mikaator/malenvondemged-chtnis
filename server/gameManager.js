const { v4: uuidv4 } = require('uuid');

class GameManager {
  constructor() {
    this.lobbies = new Map();
    this.playerSockets = new Map();
  }

  generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async createLobby(socket, playerName, settings = {}) {
    const roomCode = this.generateRoomCode();
    const playerId = uuidv4();
    
    const lobby = {
      roomCode,
      players: new Map(),
      settings: {
        drawingTime: settings.drawingTime || 60,
        maxPlayers: settings.maxPlayers || 8,
        ...settings
      },
      gameState: 'waiting', // waiting, word-submission, drawing, voting, results
      currentRound: 0,
      words: [],
      drawings: [],
      votes: new Map(),
      chat: []
    };

    // Add creator as first player
    lobby.players.set(playerId, {
      id: playerId,
      name: playerName,
      socketId: socket.id,
      ready: false,
      word: null,
      score: 0
    });

    this.lobbies.set(roomCode, lobby);
    this.playerSockets.set(socket.id, { roomCode, playerId });

    socket.join(roomCode);

    return {
      roomCode,
      playerId,
      lobby: this.getLobbyData(lobby)
    };
  }

  async joinLobby(socket, roomCode, playerName) {
    const lobby = this.lobbies.get(roomCode);
    if (!lobby) {
      throw new Error('Raum nicht gefunden');
    }

    if (lobby.players.size >= lobby.settings.maxPlayers) {
      throw new Error('Raum ist voll');
    }

    if (lobby.gameState !== 'waiting') {
      throw new Error('Spiel läuft bereits');
    }

    const playerId = uuidv4();
    lobby.players.set(playerId, {
      id: playerId,
      name: playerName,
      socketId: socket.id,
      ready: false,
      word: null,
      score: 0
    });

    this.playerSockets.set(socket.id, { roomCode, playerId });
    socket.join(roomCode);

    return {
      roomCode,
      playerId,
      lobby: this.getLobbyData(lobby)
    };
  }

  async submitWord(socket, word) {
    const playerData = this.playerSockets.get(socket.id);
    if (!playerData) {
      throw new Error('Spieler nicht gefunden');
    }

    const lobby = this.lobbies.get(playerData.roomCode);
    if (!lobby) {
      throw new Error('Raum nicht gefunden');
    }

    if (lobby.gameState !== 'word-submission') {
      throw new Error('Wort-Eingabe nicht möglich');
    }

    const player = lobby.players.get(playerData.playerId);
    if (!player) {
      throw new Error('Spieler nicht gefunden');
    }

    // Check for duplicates
    const existingWords = Array.from(lobby.players.values())
      .map(p => p.word)
      .filter(w => w && w.toLowerCase() === word.toLowerCase());
    
    if (existingWords.length > 0) {
      throw new Error('Wort bereits vorhanden');
    }

    player.word = word;
    lobby.words.push(word);

    return {
      roomCode: playerData.roomCode,
      lobby: this.getLobbyData(lobby)
    };
  }

  async startGame(socket) {
    const playerData = this.playerSockets.get(socket.id);
    if (!playerData) {
      throw new Error('Spieler nicht gefunden');
    }

    const lobby = this.lobbies.get(playerData.roomCode);
    if (!lobby) {
      throw new Error('Raum nicht gefunden');
    }

    if (lobby.players.size < 2) {
      throw new Error('Mindestens 2 Spieler erforderlich');
    }

    // Check if all players have submitted words
    const allWordsSubmitted = Array.from(lobby.players.values())
      .every(player => player.word);

    if (!allWordsSubmitted) {
      throw new Error('Nicht alle Spieler haben ein Wort eingegeben');
    }

    // Shuffle words for random order
    lobby.words = this.shuffleArray([...lobby.words]);
    lobby.gameState = 'drawing';
    lobby.currentRound = 0;

    return {
      roomCode: playerData.roomCode,
      currentWord: lobby.words[0],
      round: 1,
      totalRounds: lobby.words.length,
      drawingTime: lobby.settings.drawingTime,
      lobby: this.getLobbyData(lobby)
    };
  }

  async submitDrawing(socket, drawingData) {
    const playerData = this.playerSockets.get(socket.id);
    if (!playerData) {
      throw new Error('Spieler nicht gefunden');
    }

    const lobby = this.lobbies.get(playerData.roomCode);
    if (!lobby) {
      throw new Error('Raum nicht gefunden');
    }

    if (lobby.gameState !== 'drawing') {
      throw new Error('Zeichnen nicht möglich');
    }

    const drawing = {
      id: uuidv4(),
      playerId: playerData.playerId,
      playerName: lobby.players.get(playerData.playerId).name,
      drawingData,
      word: lobby.words[lobby.currentRound],
      round: lobby.currentRound + 1,
      votes: 0
    };

    lobby.drawings.push(drawing);

    // Check if all players have submitted drawings
    const currentRoundDrawings = lobby.drawings.filter(d => d.round === lobby.currentRound + 1);
    if (currentRoundDrawings.length === lobby.players.size) {
      lobby.gameState = 'voting';
      lobby.votes.set(lobby.currentRound, new Map());
    }

    return {
      roomCode: playerData.roomCode,
      drawing,
      allDrawingsSubmitted: currentRoundDrawings.length === lobby.players.size,
      lobby: this.getLobbyData(lobby)
    };
  }

  async voteDrawing(socket, drawingId, vote) {
    const playerData = this.playerSockets.get(socket.id);
    if (!playerData) {
      throw new Error('Spieler nicht gefunden');
    }

    const lobby = this.lobbies.get(playerData.roomCode);
    if (!lobby) {
      throw new Error('Raum nicht gefunden');
    }

    if (lobby.gameState !== 'voting') {
      throw new Error('Abstimmen nicht möglich');
    }

    const roundVotes = lobby.votes.get(lobby.currentRound);
    if (!roundVotes) {
      throw new Error('Runde nicht gefunden');
    }

    // Check if player already voted
    if (roundVotes.has(playerData.playerId)) {
      throw new Error('Bereits abgestimmt');
    }

    roundVotes.set(playerData.playerId, drawingId);

    // Update drawing vote count
    const drawing = lobby.drawings.find(d => d.id === drawingId);
    if (drawing) {
      drawing.votes++;
    }

    // Check if all players have voted
    if (roundVotes.size === lobby.players.size) {
      // Calculate scores
      this.calculateRoundScores(lobby);
      
      // Move to next round or end game
      lobby.currentRound++;
      if (lobby.currentRound >= lobby.words.length) {
        lobby.gameState = 'results';
      } else {
        lobby.gameState = 'drawing';
      }
    }

    return {
      roomCode: playerData.roomCode,
      allVotesSubmitted: roundVotes.size === lobby.players.size,
      lobby: this.getLobbyData(lobby)
    };
  }

  calculateRoundScores(lobby) {
    const roundDrawings = lobby.drawings.filter(d => d.round === lobby.currentRound + 1);
    const roundVotes = lobby.votes.get(lobby.currentRound);
    
    if (!roundVotes) return;

    // Count votes for each drawing
    const voteCounts = new Map();
    for (const [playerId, drawingId] of roundVotes) {
      voteCounts.set(drawingId, (voteCounts.get(drawingId) || 0) + 1);
    }

    // Award points
    for (const [drawingId, votes] of voteCounts) {
      const drawing = roundDrawings.find(d => d.id === drawingId);
      if (drawing) {
        const player = lobby.players.get(drawing.playerId);
        if (player) {
          player.score += votes;
        }
      }
    }
  }

  async sendChatMessage(socket, message) {
    const playerData = this.playerSockets.get(socket.id);
    if (!playerData) {
      throw new Error('Spieler nicht gefunden');
    }

    const lobby = this.lobbies.get(playerData.roomCode);
    if (!lobby) {
      throw new Error('Raum nicht gefunden');
    }

    const player = lobby.players.get(playerData.playerId);
    if (!player) {
      throw new Error('Spieler nicht gefunden');
    }

    const chatMessage = {
      id: uuidv4(),
      playerId: playerData.playerId,
      playerName: player.name,
      message,
      timestamp: new Date().toISOString()
    };

    lobby.chat.push(chatMessage);

    return {
      roomCode: playerData.roomCode,
      message: chatMessage
    };
  }

  handleDisconnect(socket) {
    const playerData = this.playerSockets.get(socket.id);
    if (!playerData) return;

    const lobby = this.lobbies.get(playerData.roomCode);
    if (!lobby) return;

    const player = lobby.players.get(playerData.playerId);
    if (!player) return;

    // Remove player from lobby
    lobby.players.delete(playerData.playerId);
    this.playerSockets.delete(socket.id);

    // If lobby is empty, delete it
    if (lobby.players.size === 0) {
      this.lobbies.delete(playerData.roomCode);
    }
  }

  getLobbyData(lobby) {
    return {
      roomCode: lobby.roomCode,
      players: Array.from(lobby.players.values()),
      settings: lobby.settings,
      gameState: lobby.gameState,
      currentRound: lobby.currentRound,
      words: lobby.words,
      drawings: lobby.drawings,
      chat: lobby.chat.slice(-50) // Last 50 messages
    };
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

module.exports = GameManager;
