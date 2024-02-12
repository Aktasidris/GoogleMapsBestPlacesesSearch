import express from "express";
import fetch from "node-fetch";
import mongoose from "mongoose";
import bodyParser from "body-parser";

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.json());

// Anasayfa İşlemleri
const apiKey = "AIzaSyAxMbv8Ktrj_etOMNIL5Jk6N8VQus52JqE";

function fetchPlaces(apiUrl, allResults = []) {
  return fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        throw new Error(data.error_message || "Google Maps API hatası.");
      }
      // Sadece ilk 20 sonucu al
      const limitedResults = data.results.slice(0, 20);

      return {
        places: limitedResults,
        next_page_token: data.next_page_token,
      };
    });
}

app.get("/searchPlaces", (req, res) => {
  res.sendFile(__dirname + "/public/Ana_Sayfa.html");
});

app.post("/searchPlaces", (req, res) => {
  const { city, province, sector, page } = req.body;
  let apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?key=${apiKey}&query=${encodeURIComponent(
    city + " " + province + " " + sector
  )}`;
  // İlk sayfa yükleniyorsa, yalnızca ilk 20 sonucu getir
  if (!page) {
    apiUrl += `&region=tr&language=tr&radius=5000&type=point_of_interest&fields=formatted_address,name,rating,opening_hours,geometry,place_id`;
  }
  // İstek sayfasını ayarla
  else {
    apiUrl += `&page=${page}`;
  }
  fetchPlaces(apiUrl)
    .then(({ places, next_page_token }) => {
      res.json({ places, next_page_token });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Sunucu hatası: " + error.message);
    });
});

// Login İşlemleri
// MongoDB bağlantısı
mongoose.connect(
  "mongodb+srv://user123:user4455@cluster0.40yopgu.mongodb.net/PlaceMaps?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const Place = mongoose.model("Place", {
  eposta: String,
  sifre: String,
  FavoriMekanlar: [
    {
      name: String,
      rating: Number,
      address: String,
      phone: String,
      website: String,
      weekday_text: String,
    },
  ],
});

// POST isteği için örnek bir route
app.post("/login", async (req, res) => {
  try {
    const { eposta, sifre } = req.body;
    let user;
    try {
      user = await Place.findOne({ eposta });
    } catch (error) {
      console.log("veritabanı" + error);
    }

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }
    // Şifre doğrulaması
    if (user.sifre !== sifre) {
      return res.status(401).json({ message: "Şifre yanlış" });
    }
    res.json({ message: "Giriş başarılı" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Kullanıcı Kaydı
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    // E-posta adresi zaten kayıtlı mı diye kontrol et
    const existingUser = await Place.findOne({ eposta: email });
    if (existingUser) {
      return res.json({
        success: false,
        message: "Bu e-posta adresi zaten kullanılıyor.",
      });
    }
    // Yeni kullanıcı oluştur
    const newUser = new Place({
      eposta: email,
      sifre: password,
      FavoriMekanlar: [],
    });
    // Kullanıcıyı veritabanına kaydet
    await newUser.save();
    res.json({ success: true, message: "Kayıt başarılı" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
});

app.post("/favori", async (req, res) => {
  try {
    const { email } = req.body;
    const place = await Place.findOne({ eposta: email });
    console.log(place);
    if (!place) {
      return res.status(404).send({ message: "Kullanıcı bulunamadı." });
    }

    if (place.FavoriMekanlar && place.FavoriMekanlar.length > 0) {
      res.send({ favoriMekanlar: place.FavoriMekanlar });
    } else {
      // Kullanıcının favori mekanları yoksa
      res.status(404).send({ message: "Favori mekan bulunamadı." });
    }
  } catch (err) {
    console.log("Sunucu hatası:", err);
    res.status(500).send({ message: "Sunucu hatası: " + err });
  }
});

// Favori mekanı kaydetme route'u
app.post("/favorites", (req, res) => {
  const mekanData = req.body;
  console.log(mekanData);
  const kullaniciEposta = mekanData.eposta; // Örneğin, mekanı eklemek isteyen kullanıcının e-postası

  // İlgili kullanıcıyı bul ve mekanı favorilere ekle
  Place.findOne({ eposta: kullaniciEposta }, (err, user) => {
    if (err) {
      res.status(500).send("Sunucu hatası");
      return;
    }

    if (!user) {
      res.status(404).send("Kullanıcı bulunamadı");
      return;
    }

    // Mekanı FavoriMekanlar'a ekle
    user.FavoriMekanlar.push(mekanData);
    user.save((err) => {
      if (err) {
        res.status(500).send("Favori mekan kaydedilemedi");
      } else {
        res.status(200).send("Favori mekan başarıyla eklendi");
      }
    });
  });
});
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
