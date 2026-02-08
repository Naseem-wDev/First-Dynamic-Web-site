const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Item = require('../models/Item');

const router = express.Router();

async function adminOnly(req, res, next){
  if(!req.user) return res.status(401).json({ message: 'Not authorized' });
  if(!req.user.isAdmin) return res.status(403).json({ message: 'Admin only' });
  next();
}

router.use(authMiddleware, adminOnly);

router.get('/users', async (req, res) => {
  const users = await User.findAll({ attributes: ['id','name','email','isAdmin','createdAt'] });
  res.json(users);
});

router.get('/items', async (req, res) => {
  const items = await Item.findAll({ include: ['seller'] });
  res.json(items);
});

router.delete('/items/:id', async (req, res) => {
  const it = await Item.findByPk(req.params.id);
  if(!it) return res.status(404).json({ message: 'Not found' });
  await it.destroy();
  res.json({ message: 'Deleted' });
});

module.exports = router;
