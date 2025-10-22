# 🎨 Drawing from Memory

Ein Multiplayer-Online-Partyspiel, bei dem Spieler Begriffe aus dem Gedächtnis zeichnen und sich gegenseitig bewerten.

## 🎮 Spielprinzip

1. **Lobby erstellen/beitreten**: Spieler erstellen Räume mit 6-stelligen Codes oder treten bestehenden bei
2. **Begriffe eingeben**: Jeder Spieler gibt einen Begriff ein, der gezeichnet werden soll
3. **Zeichnen**: In zufälliger Reihenfolge werden die Begriffe gezeichnet (30-120 Sekunden pro Runde)
4. **Abstimmen**: Nach jeder Runde bewerten die Spieler die beste Zeichnung
5. **Punktevergabe**: Punkte basierend auf den Abstimmungen, Sieger wird am Ende gekürt

## ✨ Features

### 🎯 Kernfunktionalitäten
- **Multiplayer-Support**: 2-8 Spieler pro Raum
- **Echtzeit-Kommunikation**: WebSocket-basierte Live-Updates
- **Canvas-Zeichenbereich**: Vollständige Zeichenwerkzeuge mit Touch-Support
- **Lobby-System**: Raumcodes und Spieler-Management
- **Chat-System**: Echtzeit-Kommunikation zwischen Spielern

### 🎨 Zeichenfunktionen
- **Verschiedene Werkzeuge**: Pinsel, Radierer
- **Farbpalette**: 10 vordefinierte Farben
- **Pinselgrößen**: 5 verschiedene Größen
- **Undo/Redo**: Vollständige Verlauf-Funktionalität
- **Touch-Support**: Optimiert für Mobile-Geräte

### 🏆 Spielmodi
- **Klassischer Modus**: Standard-Spielablauf
- **Anpassbare Einstellungen**: Zeichenzeit, Spieleranzahl
- **Live-Punktetafel**: Echtzeit-Rankings
- **Ergebnis-Animationen**: Spektakuläre Sieger-Präsentation

## 🚀 Installation & Setup

### Voraussetzungen
- Node.js 18+
- PostgreSQL (für Produktion)
- Redis (optional, für Session-Management)

### Lokale Entwicklung

1. **Repository klonen**
```bash
git clone <repository-url>
cd drawing-from-memory
```

2. **Dependencies installieren**
```bash
npm install
cd client
npm install
cd ..
```

3. **Umgebungsvariablen konfigurieren**
```bash
cp env.example .env
# .env Datei bearbeiten mit deinen Datenbank-Credentials
```

4. **Datenbank einrichten**
```bash
# PostgreSQL Datenbank erstellen
createdb drawing_from_memory

# Tabellen erstellen (wird automatisch beim ersten Start erstellt)
```

5. **Entwicklungsserver starten**
```bash
# Backend und Frontend gleichzeitig
npm run dev

# Oder separat:
npm run server  # Backend auf Port 5000
npm run client  # Frontend auf Port 3000
```

### Produktion (Render.com)

1. **Repository zu Render.com verbinden**
2. **Umgebungsvariablen setzen**:
   - `NODE_ENV=production`
   - `DATABASE_URL=postgresql://...` (Render PostgreSQL)
   - `REDIS_URL=redis://...` (optional)

3. **Deployment starten**
   - Render erkennt automatisch die `render.yaml` Konfiguration
   - Build und Start erfolgen automatisch

## 🛠️ Technologie-Stack

### Backend
- **Node.js** mit Express.js
- **Socket.io** für WebSocket-Kommunikation
- **PostgreSQL** für Datenpersistierung
- **Redis** für Session-Management (optional)
- **Helmet** für Sicherheit

### Frontend
- **React 18** mit TypeScript
- **Framer Motion** für Animationen
- **Canvas API** für Zeichenfunktionalität
- **Socket.io Client** für Echtzeit-Kommunikation

### Hosting
- **Render.com** für Backend und Frontend
- **PostgreSQL** als Datenbank
- **Redis** für Caching (optional)

## 📱 Responsive Design

Das Spiel ist vollständig responsive und funktioniert optimal auf:
- **Desktop** (Chrome, Firefox, Safari, Edge)
- **Tablet** (iPad, Android Tablets)
- **Mobile** (iPhone, Android Smartphones)

## 🎮 Spielregeln

1. **Mindestens 2 Spieler** erforderlich
2. **Jeder Spieler gibt ein Wort ein** (keine Duplikate)
3. **Zufällige Reihenfolge** der Wörter
4. **Zeichenzeit**: 30-120 Sekunden (einstellbar)
5. **Abstimmung**: Jeder Spieler stimmt für die beste Zeichnung
6. **Punktevergabe**: 1 Punkt pro Stimme
7. **Sieger**: Spieler mit den meisten Punkten

## 🔧 Konfiguration

### Lobby-Einstellungen
- **Zeichenzeit**: 30-120 Sekunden
- **Spieleranzahl**: 2-8 Spieler
- **Raumcode**: 6-stelliger alphanumerischer Code

### Zeichenwerkzeuge
- **Pinselgrößen**: 2px, 5px, 10px, 15px, 20px
- **Farben**: 10 vordefinierte Farben
- **Werkzeuge**: Pinsel, Radierer
- **Verlauf**: Unbegrenzte Undo/Redo-Funktion

## 🐛 Bekannte Probleme

- Canvas-Performance kann auf älteren Geräten eingeschränkt sein
- Touch-Events funktionieren am besten auf neueren Browsern
- WebSocket-Verbindung kann bei instabiler Internetverbindung abbrechen

## 🤝 Beitragen

1. Fork das Repository
2. Feature-Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Änderungen committen (`git commit -m 'Add some AmazingFeature'`)
4. Branch pushen (`git push origin feature/AmazingFeature`)
5. Pull Request erstellen

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe `LICENSE` Datei für Details.

## 🎉 Credits

- **Design**: Moderne UI mit Framer Motion Animationen
- **Icons**: Emoji-basierte Icons für bessere Kompatibilität
- **Fonts**: Inter Font für optimale Lesbarkeit
- **Farben**: Gradient-basierte Farbpalette

## 📞 Support

Bei Problemen oder Fragen:
1. GitHub Issues erstellen
2. Dokumentation durchsuchen
3. Community-Chat (falls verfügbar)

---

**Viel Spaß beim Zeichnen! 🎨✨**
