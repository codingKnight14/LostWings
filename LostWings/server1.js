const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(
  cors({
    origin: "http://127.0.0.1:5500", 
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "secret-key", // Store in environment variable for better security
    resave: true,
    saveUninitialized: true,
  })
);

// Ensure users.json exists and is initialized
if (!fs.existsSync("users.json")) {
  fs.writeFileSync("users.json", JSON.stringify([]));
}
// Check if the user is authenticated middleware
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ authenticated: false });
    }
}

app.get("/user", isAuthenticated, (req, res) => {
    res.json({
        authenticated: true,
        username: req.session.user.username,
    });
});

// Signup Route
app.post("/submit", (req, res) => {
  const userData = req.body;

  fs.readFile("users.json", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Failed to read user data" });
      return;
    }

    let users = JSON.parse(data);
    users.push(userData);

    fs.writeFile("users.json", JSON.stringify(users, null, 2), (err) => {
      if (err) {
        res.status(500).json({ error: "Failed to save user data" });
        return;
      }
      console.log("User data saved!");
      res.json({ message: "User data saved successfully!" });
    });
  });
});

// Login Route
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  fs.readFile("users.json", (err, data) => {
    if (err) return res.status(500).send("Server error");
    const users = JSON.parse(data);
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      req.session.user = user;
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  });
});

// Status Route
app.get("/status", (req, res) => {
  if (req.session.user) {
    res.json({
      loggedInUser: true,
      userName: req.session.user.username,
    });
  } else {
    res.json({ loggedInUser: false });
  }
});

// Logout Route
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Server error");
    res.json({ success: true });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
