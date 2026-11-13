const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Supabase PostgreSQL Database နဲ့ ချိတ်ဆက်ခြင်း
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// HTML Form ကနေ ဒေတာလက်ခံမယ့် API Route
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const query = 'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *';
    const values = [name, email, password];
    const newUser = await pool.query(query, values);
    
    res.status(201).json({ 
      message: 'အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ', 
      user: newUser.rows[0] 
    });
  } catch (err) {
    console.error(err.message);
    
    // အီးမေးလ် ထပ်နေခြင်း (Duplicate Email) ရှိမရှိ စစ်ဆေးခြင်း
    if (err.code === '23505') {
      return res.status(400).json({ error: 'ဤအီးမေးလ်ဖြင့် အကောင့်ဖွင့်ပြီးသား ဖြစ်ပါသည်။' });
    }
    
    res.status(500).json({ error: 'ဆာဗာတွင် အမှားအယွင်းရှိသည်' });
  }
});

const PORT = process.env.PORT || 3000;

// Local မှာ Run ရင် app.listen လုပ်မယ်၊ Vercel ပေါ်မှာဆိုရင်တော့ export လုပ်မယ်
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
const path = require('path');

// ... သင့်ရဲ့ အခြား middleware များ (express.json, cors စသည်) ...

// Root URL (/) ကို ဝင်လာရင် index.html ကို ပြပေးရန်
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});