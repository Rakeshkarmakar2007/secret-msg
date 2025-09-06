const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

let messages = [];

app.use(bodyParser.urlencoded({ extended: true }));

// Basic Bootstrap styling
const pageWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Secret Box</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { background: #f7f9fc; font-family: 'Segoe UI', sans-serif; }
    .container { max-width: 600px; margin-top: 50px; }
    .card { border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    textarea { resize: none; }
    .msg { background: #fff; border-radius: 10px; padding: 12px; margin: 10px 0; box-shadow: 0 2px 6px rgba(0,0,0,0.05);}
    .timestamp { font-size: 0.8rem; color: gray; }
  </style>
</head>
<body>
  <div class="container">
    ${content}
  </div>
</body>
</html>
`;

app.get("/", (req, res) => {
 res.send(pageWrapper(`
    <div class="card p-4">
      <h2 class="text-center mb-3">🔒 Secret Message Box</h2>
      <p class="text-center text-muted">
        Type your anonymous msg to Me.<br>
        I will never know who are you 😅
        
      </p>
      <form action="/send" method="POST">
        <div class="mb-3">
          <textarea class="form-control" name="message" rows="5" placeholder="Type your secret..."></textarea>
        </div>
        <div class="d-grid">
          <button type="submit" class="btn btn-primary btn-lg">Send Secret</button>
        </div>
      </form>
    
    </div>
  `));
});

app.post("/send", (req, res) => {
  const msg = req.body.message;
  if (msg) {
    messages.push({ text: msg, time: new Date() });
  }
  res.send(pageWrapper(`
    <div class="card p-4 text-center">
      <h3 class="text-success">✅ Your secret has been sent!</h3>
      <a href="/" class="btn btn-primary mt-3">Go Back</a>
    </div>
  `));
});

app.get("/ghost123", (req, res) => {
  let list = messages.length
    ? messages.map(
        (m) => `
          <div class="msg">
            <p>${m.text}</p>
            <div class="timestamp">🕒 ${m.time.toLocaleString()}</div>
          </div>
        `
      ).join("")
    : "<h4 class='text-muted text-center'>No messages yet</h4>";

  res.send(pageWrapper(`
    <div class="card p-4">
      <h2 class="mb-3 text-center">📜 All Secret msgs</h2>
      ${list}
    </div>
  `));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

