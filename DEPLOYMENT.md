# 🚀 Deployment auf Render.com

Diese Anleitung zeigt dir, wie du das "Drawing from Memory" Spiel auf Render.com hostest.

## 📋 Voraussetzungen

1. **Render.com Account** (kostenlos)
2. **GitHub Repository** mit dem Code
3. **PostgreSQL Datenbank** (kann über Render.com erstellt werden)

## 🔧 Schritt-für-Schritt Anleitung

### 1. Repository zu GitHub pushen

```bash
# Git Repository initialisieren (falls noch nicht geschehen)
git init
git add .
git commit -m "Initial commit: Drawing from Memory game"

# GitHub Repository erstellen und verbinden
git remote add origin https://github.com/dein-username/drawing-from-memory.git
git push -u origin main
```

### 2. PostgreSQL Datenbank auf Render.com erstellen

1. Gehe zu [Render.com Dashboard](https://dashboard.render.com)
2. Klicke auf **"New +"** → **"PostgreSQL"**
3. Wähle **"Free"** Plan
4. Gib einen Namen ein: `drawing-from-memory-db`
5. Klicke **"Create Database"**
6. Notiere dir die **"External Database URL"** (wird später benötigt)

### 3. Web Service auf Render.com erstellen

1. Gehe zu [Render.com Dashboard](https://dashboard.render.com)
2. Klicke auf **"New +"** → **"Web Service"**
3. Verbinde dein GitHub Repository
4. Wähle das Repository aus
5. Konfiguriere folgende Einstellungen:

#### Service Konfiguration:
- **Name**: `drawing-from-memory`
- **Environment**: `Node`
- **Region**: `Frankfurt (EU Central)` (oder deine bevorzugte Region)
- **Branch**: `main`
- **Root Directory**: `/` (leer lassen)
- **Build Command**: `npm install && npm run render-postbuild`
- **Start Command**: `npm start`

#### Environment Variables:
```
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
REDIS_URL=redis://username:password@host:port (optional)
```

**Wichtig**: Ersetze `DATABASE_URL` mit der URL aus Schritt 2!

### 4. Deployment starten

1. Klicke **"Create Web Service"**
2. Render.com startet automatisch den Build-Prozess
3. Warte bis das Deployment abgeschlossen ist (ca. 5-10 Minuten)

### 5. Domain konfigurieren

Nach erfolgreichem Deployment:
1. Gehe zu deinem Web Service
2. Unter **"Settings"** → **"Custom Domains"**
3. Du kannst eine eigene Domain hinzufügen oder die Render.com URL verwenden

## 🔍 Troubleshooting

### Build schlägt fehl
- **Problem**: `npm install` oder `npm run build` fehlgeschlagen
- **Lösung**: Überprüfe die Logs in Render.com Dashboard
- **Häufige Ursachen**: 
  - Falsche Node.js Version (sollte 18+ sein)
  - Fehlende Dependencies
  - Build-Command Fehler

### Datenbank-Verbindung fehlgeschlagen
- **Problem**: `Database connection failed`
- **Lösung**: 
  - Überprüfe `DATABASE_URL` Environment Variable
  - Stelle sicher, dass die PostgreSQL Datenbank läuft
  - Überprüfe SSL-Einstellungen

### WebSocket-Verbindung funktioniert nicht
- **Problem**: Spieler können sich nicht verbinden
- **Lösung**:
  - Überprüfe CORS-Einstellungen
  - Stelle sicher, dass WebSocket-Verbindungen erlaubt sind
  - Überprüfe Firewall-Einstellungen

### Frontend lädt nicht
- **Problem**: Weiße Seite oder 404 Fehler
- **Lösung**:
  - Überprüfe ob `client/build` Ordner existiert
  - Stelle sicher, dass `npm run build` erfolgreich war
  - Überprüfe statische Datei-Serving Konfiguration

## 📊 Monitoring

### Logs anzeigen
1. Gehe zu deinem Web Service auf Render.com
2. Klicke auf **"Logs"** Tab
3. Hier siehst du alle Server-Logs in Echtzeit

### Performance überwachen
- **Metrics**: CPU, Memory, Response Time
- **Uptime**: Verfügbarkeit des Services
- **Errors**: Fehlerrate und Art der Fehler

## 🔄 Updates deployen

Nach Code-Änderungen:
1. Committe deine Änderungen zu GitHub
2. Render.com startet automatisch ein neues Deployment
3. Warte bis das Update abgeschlossen ist

## 💰 Kosten

### Free Tier (ausreichend für Entwicklung/Testing):
- **Web Service**: 750 Stunden/Monat
- **PostgreSQL**: 1 GB Speicher
- **Bandwidth**: 100 GB/Monat

### Paid Plans (für Produktion):
- **Starter**: $7/Monat
- **Standard**: $25/Monat
- **Pro**: $85/Monat

## 🎯 Nächste Schritte

Nach erfolgreichem Deployment:
1. **Teste das Spiel** mit der Render.com URL
2. **Lade Freunde ein** zum Testen
3. **Überwache die Performance** in den ersten Tagen
4. **Konfiguriere eine eigene Domain** (optional)
5. **Setze Monitoring-Alerts** (optional)

## 📞 Support

Bei Problemen:
1. **Render.com Docs**: [render.com/docs](https://render.com/docs)
2. **GitHub Issues**: Erstelle ein Issue im Repository
3. **Community**: Render.com Community Forum

---

**Viel Erfolg beim Deployment! 🚀**
