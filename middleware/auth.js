const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

async function authMiddleware(req, res, next){
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({ message: 'Missing token' });

  const parts = auth.split(' ');
  if(parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Invalid token format' });

  try{
    const payload = jwt.verify(parts[1], JWT_SECRET);
    const user = await User.findByPk(payload.id);
    if(!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  }catch(err){
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = { authMiddleware, JWT_SECRET };
