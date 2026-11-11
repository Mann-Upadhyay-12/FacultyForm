require('dotenv').config()
const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || 'dev_secret_key_change_in_production';

app.use(express.json())

const posts = [
  {
    username: 'Kyle',
    title: 'Post 1'
  },
  {
    username: 'Jim',
    title: 'Post 2'
  }
]

// Use a Set for better performance and to avoid duplicates
let refreshTokens = new Set()

// GET posts endpoint
app.get('/posts', authenticateToken, (req, res) => {
  const userPosts = posts.filter(post => post.username === req.user.name)
  res.json({
    success: true,
    user: req.user.name,
    posts: userPosts
  })
})

// Refresh token endpoint
app.post('/token', (req, res) => {
  const refreshToken = req.body.token
  
  if (!refreshToken) {
    return res.status(401).json({ 
      success: false, 
      error: 'Refresh token is required' 
    })
  }
  
  if (!refreshTokens.has(refreshToken)) {
    return res.status(403).json({ 
      success: false, 
      error: 'Invalid refresh token' 
    })
  }
  
  jwt.verify(refreshToken, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: 'Invalid or expired refresh token' 
      })
    }
    
    const accessToken = generateAccessToken({ name: user.name })
    res.json({ 
      success: true,
      accessToken: accessToken 
    })
  })
})

// Logout endpoint
app.delete('/logout', (req, res) => {
  const refreshToken = req.body.token
  
  if (!refreshToken) {
    return res.status(400).json({ 
      success: false, 
      error: 'Refresh token is required' 
    })
  }
  
  refreshTokens.delete(refreshToken)
  res.json({ 
    success: true, 
    message: 'Logged out successfully' 
  })
})

// Login endpoint
app.post('/login', (req, res) => {
  const username = req.body.username
  
  if (!username) {
    return res.status(400).json({ 
      success: false, 
      error: 'Username is required' 
    })
  }
  
  // Authenticate User (in production, verify against database)
  const user = { name: username }
  
  const accessToken = generateAccessToken(user)
  const refreshToken = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })
  
  refreshTokens.add(refreshToken)
  
  res.json({ 
    success: true,
    accessToken: accessToken, 
    refreshToken: refreshToken,
    expiresIn: '15m',
    message: 'Login successful'
  })
})

// Generate access token with 15 minute expiration
function generateAccessToken(user) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '15m' })
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token is required' 
    })
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification error:', err.message)
      
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          error: 'Access token has expired. Use refresh token to get a new one.' 
        })
      }
      
      return res.status(403).json({ 
        success: false, 
        error: 'Invalid access token' 
      })
    }
    
    req.user = user
    next()
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`)
  console.log(`Access token expiration: 15 minutes`)
  console.log(`Refresh token expiration: 7 days`)
})