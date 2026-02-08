const express = require('express');
const multer = require('multer');
const path = require('path');
const Item = require('../models/Item');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function(req, file, cb){
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`);
  }
});

const upload = multer({ storage });

// list items with optional search
router.get('/', async (req, res) => {
  try{
    const { q } = req.query;
    const where = { sold: false };
    if(q){
      where.title = { [require('sequelize').Op.like]: `%${q}%` };
    }
    const items = await Item.findAll({ where, include: ['seller'], order: [['createdAt','DESC']] });
    res.json(items);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try{
    const it = await Item.findByPk(req.params.id, { include: ['seller'] });
    if(!it) return res.status(404).json({ message: 'Not found' });
    res.json(it);
  }catch(err){
    res.status(500).json({ message: 'Server error' });
  }
});

// create item (seller)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try{
    const { title, price, description } = req.body;
    if(!title || !price) return res.status(400).json({ message: 'Missing title or price' });
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const item = await Item.create({ title, price: parseFloat(price), description, image: imagePath, sellerId: req.user.id });
    res.json(item);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// buy/contact seller -> we'll return seller contact (email) and mark sold
router.post('/:id/buy', authMiddleware, async (req, res) => {
  try{
    const it = await Item.findByPk(req.params.id);
    if(!it) return res.status(404).json({ message: 'Not found' });
    if(it.sold) return res.status(400).json({ message: 'Already sold' });
    it.sold = true;
    await it.save();
    const seller = await it.getSeller();
    res.json({ message: 'Purchase recorded', seller: { name: seller.name, email: seller.email } });
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
