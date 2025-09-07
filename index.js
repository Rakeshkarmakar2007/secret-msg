// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser
app.use(express.urlencoded({ extended: true }));

// ---------- MongoDB connect ----------
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('⚠️  WARNING: MONGODB_URI is not set. Set it in .env or platform env vars.');
}

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.once('open', () => console.log('✅ MongoDB connection open'));
mongoose.connection.on('error', (err) => console.error('❌ MongoDB connection error:', err));

// ---------- Schema ----------
const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  sender: { type: String, required: true },
  time: { type: Date, default: Date.now },
});
const Message = mongoose.model('Message', messageSchema);

// ---------- Helpers ----------
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function randomSender() {
  const names = [
    'Mysterious Owl 🦉',
    'Ghost Cat 🐾',
    'Mysterious Banana 🍌',
    'Hidden Coder 👾',
    'Silent Star ✨',
    'Secret Penguin 🐧',
    'Phantom Debugger 👻',
    'Anonymous Bee 🐝'
  ];
  return names[Math.floor(Math.random() * names.length)];
}

const pageWrapper = (content) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Secret Box</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"/>
<style>
  body { background: #f7f9fc; font-family: 'Segoe UI', sans-serif; }
  .container { max-width: 700px; margin-top: 40px; }
  .card { border-radius: 14px; box-shadow: 0 6px 18px rgba(0,0,0,0.06); }
  textarea { resize: none; }
  .msg { background: #fff; border-radius: 10px; padding: 12px; margin: 10px 0; box-shadow: 0 2px 6px rgba(0,0,0,0.04); }
  .meta { font-size: 0.85rem; color: #6c757d; }
  .small-note { font-size: 0.9rem; color: #6c757d; }
</style>
</head>
<body>
  <div class="container">
    ${content}
  </div>
</body>
</html>`;

// ---------- Routes ----------
app.get('/', (req, res) => {
  res.send(pageWrapper(`
    <div class="card p-4">
      <h2 class="text-center mb-2">🔒 Secret Message Box</h2>
      <p class="text-center small-note">Type your anonymous msg to me. I will never know who you are 😅</p>
      <form action="/send" method="POST">
        <div class="mb-3">
          <textarea class="form-control" name="message" rows="5" placeholder="Type your secret..." required></textarea>
        </div>
        <div class="d-grid">
          <button type="submit" class="btn btn-primary btn-lg">Send Secret</button>
        </div>
      </form>
    </div>
  `));
});

app.post('/send', async (req, res) => {
  const raw = (req.body && req.body.message) ? String(req.body.message).trim() : '';
  if (!raw) {
    return res.send(pageWrapper(`
      <div class="card p-4 text-center">
        <h3 class="text-warning">⚠️ Empty message — nothing sent!</h3>
        <a href="/" class="btn btn-primary mt-3">Go Back</a>
      </div>
    `));
  }

  const safeText = escapeHtml(raw);
  const sender = randomSender();

  try {
    const saved = await Message.create({ text: safeText, sender });
    console.log('Message saved:', saved);
  } catch (err) {
    console.error('DB save error:', err);
  }

  res.send(pageWrapper(`
    <div class="card p-4 text-center">
      <h3 class="text-success">✅ Your secret has been sent anonymously!</h3>
      <p class="small-note">Sender assigned: <b>${sender}</b></p>
      <a href="/" class="btn btn-primary mt-2">Send another</a>
    </div>
  `));
});

// ---------- Debugged Ghost Archive ----------
app.get('/ghost123', async (req, res) => {
  let items = [];
  try {
    items = await Message.find().sort({ time: -1 }).limit(200);
    console.log('Fetched items:', items.length);
  } catch (err) {
    console.error('DB read error:', err);
  }

  const list = items.length
    ? items.map(m => `
        <div class="msg">
          <div class="meta">${m.sender} • 🕒 ${new Date(m.time).toLocaleString()}</div>
          <p style="margin:6px 0;">${m.text}</p>
        </div>
      `).join('')
    : `<h4 class='text-muted text-center'>No messages yet</h4>`;

  res.send(pageWrapper(`
    <div class="card p-4">
      <h2 class="mb-1 text-center">👻 Ghost Archive of Secrets</h2>
      <p class="text-center small-note">Only the chosen ones see this.</p>
      <div style="margin-top:12px;">${list}</div>
    </div>
  `));
});

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
