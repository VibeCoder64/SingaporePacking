const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const STATE_FILE = path.join(__dirname, 'state.json');

// Load persisted state on startup
let state = { checked: {}, customs: {} };
if (fs.existsSync(STATE_FILE)) {
  try {
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    console.log('State loaded from disk.');
  } catch (e) {
    console.warn('Could not parse state.json, starting fresh.');
  }
}

function saveState() {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.error('Failed to save state:', e.message);
  }
}

// Serve the planner HTML as the root page
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/health', (req, res) => res.json({ ok: true, clients: wss.clients.size }));

// WebSocket logic
wss.on('connection', (ws) => {
  console.log(`Client connected. Total: ${wss.clients.size}`);

  // Send current state to the newly connected client
  ws.send(JSON.stringify({ type: 'init', checked: state.checked, customs: state.customs }));

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.type === 'update') {
        state.checked = msg.checked || {};
        state.customs = msg.customs || {};
        saveState();

        // Broadcast to every OTHER connected client
        const broadcast = JSON.stringify({ type: 'sync', checked: state.checked, customs: state.customs });
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(broadcast);
          }
        });
      }
    } catch (e) {
      console.error('Bad message:', e.message);
    }
  });

  ws.on('close', () => {
    console.log(`Client disconnected. Total: ${wss.clients.size}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Packing planner running on http://localhost:${PORT}`);
});
