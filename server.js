const express = require("express");
const axios = require("axios");
const cors = require("cors");
const cheerio = require("cheerio");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// 🔐 PUT YOUR TOKEN HERE
const TOKEN = "yZOTApGV0aOyf1JQvfst-k9fb5jDj-gan9k4RUkMLL9CqaDAt6STBDdISJTNvZ8U";

// 🔍 SEARCH ROUTE (USES TOKEN)
app.get("/search", async (req, res) => {
  const query = req.query.q;

  try {
    const response = await axios.get("https://api.genius.com/search", {
      params: { q: query },
      headers: {
        Authorization: "Bearer " + TOKEN
      }
    });

    const results = response.data.response.hits.map(hit => ({
      title: hit.result.full_title,
      url: hit.result.url,
      image: hit.result.song_art_image_thumbnail_url
    }));

    res.json(results);

  } catch (err) {
    console.log(err.response?.data || err.message);
    res.json({ error: "Search failed" });
  }
});

// 🎵 LYRICS ROUTE (NO TOKEN NEEDED)
app.get("/lyrics", async (req, res) => {
  const url = req.query.url;

  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const cheerio = require("cheerio");
    const $ = cheerio.load(data);

    let lyrics = "";

    // Main method
    $('div[data-lyrics-container="true"]').each((i, el) => {
      lyrics += $(el).text() + "\n";
    });

    // Fallback
    if (!lyrics) {
      lyrics = $(".lyrics").text();
    }

    if (!lyrics) {
      lyrics = "Lyrics not found 😢";
    }

    res.json({ lyrics });

  } catch (err) {
    console.log(err.message);
    res.json({ lyrics: "Error fetching lyrics ❌" });
  }
});

// ✅ HOME ROUTE (optional)
app.get("/", (req, res) => {
  res.send("🔥 TEAMNEXUZ Lyrics API Running");
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});