const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { OAuth2Client } = require('google-auth-library');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "supersecretkey";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google authentication
router.post('/google-auth', async (req, res) => {
  try {
    const { credential } = req.body;
    
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        email,
        name,
        avatar: picture,
        password: 'google-auth', // Dummy password
        likedCountries: [],
        wishList: []
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '1d' });

    res.json({ 
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// Improved authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.userId = decoded.id; // More explicit naming
    next();
  });
};

// Enhanced registration with validation
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  
  try {
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create new user
    const newUser = new User({ 
      email, 
      password: hashedPassword, 
      name: name || '', // Optional name field
      likedCountries: [] 
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, SECRET, { expiresIn: '1d' });

    // Return user data (excluding password) and token
    res.status(201).json({ 
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Improved login with better error handling
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '1d' });

    // Return user data (excluding password) and token
    res.json({ 
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      },
      message: "Login successful" 
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Enhanced like/unlike functionality
router.post("/like", authenticateToken, async (req, res) => {
  try {
    const { countryName } = req.body;
    
    if (!countryName) {
      return res.status(400).json({ error: "Country name is required" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if country is already liked
    const countryIndex = user.likedCountries.indexOf(countryName);
    
    if (countryIndex === -1) {
      // Add to liked countries
      user.likedCountries.push(countryName);
    } else {
      // Remove from liked countries
      user.likedCountries.splice(countryIndex, 1);
    }

    await user.save();

    res.json({ 
      message: "Country preference updated",
      likedCountries: user.likedCountries,
      action: countryIndex === -1 ? "added" : "removed"
    });

  } catch (error) {
    console.error("Like error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fixed typo in route ('/likes' instead of '/likes')
router.get("/likes", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('likedCountries');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.likedCountries || []);

  } catch (error) {
    console.error("Get likes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add or remove a country from the wish list
router.post("/wishlist", authenticateToken, async (req, res) => {
  try {
    const { countryName } = req.body;
    
    if (!countryName) {
      return res.status(400).json({ error: "Country name is required" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const countryIndex = user.wishList.indexOf(countryName);

    if (countryIndex === -1) {
      // Add to wish list
      user.wishList.push(countryName);
    } else {
      // Remove from wish list
      user.wishList.splice(countryIndex, 1);
    }

    await user.save();

    res.json({ 
      message: "Wish list updated",
      wishList: user.wishList,
      action: countryIndex === -1 ? "added" : "removed"
    });

  } catch (error) {
    console.error("Wish list error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get the user's wish list
router.get("/wishlist", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('wishList');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.wishList || []);

  } catch (error) {
    console.error("Get wish list error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;