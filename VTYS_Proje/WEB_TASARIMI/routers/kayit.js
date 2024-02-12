const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// MongoDB Atlas bağlantı URL'si (Sizin URL'nizi kullanın)
const dbUrl = 'mongodb+srv://user123:user4455@cluster0.40yopgu.mongodb.net/PlaceMaps?retryWrites=true&w=majority';

// MongoDB'ye bağlan
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB bağlantı hatası:'));
db.once('open', () => {
  console.log('MongoDB bağlantısı başarıyla kuruldu.');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Kullanıcı modeli
const User = mongoose.model('User', {
  email: String,
  password: String,
});

// Kayıt endpoint'i
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  // E-posta formatını kontrol etmek için bir regex kullanabilirsiniz
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.match(emailRegex)) {
    return res.status(400).json({ message: 'Geçersiz e-posta adresi formatı' });
  }

  // Kullanıcıyı veritabanına kaydet
  try {
    const user = new User({ email, password });
    await user.save();
    res.status(201).json({ message: 'Kayıt başarıyla tamamlandı' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Bir hata oluştu' });
  }
});

// Diğer endpoint'leri burada tanımlayabilirsiniz

// Sunucuyu dinle
app.listen(5500, () => {
  console.log('Sunucu 5500 portunda çalışıyor');
});
