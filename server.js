const express = require("express");
const axios = require("axios");
const cors = require("cors");
const cheerio = require("cheerio");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// 🔐 Put your Genius token here
const TOKEN = "tDinUbHiNvAPGEy2_OSBN__do3NMWhtM5_RN1G_WLVCR7IpzV33xMhDcPsMD84xhenHNt5e7hn-51pi2-7-6Cw";

// 🔍 Search songs
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
    res.status(500).json({ error: "Search failed" });
  }
});

// 🎵 Get lyrics (scraping)
app.get("/lyrics", async (req, res) => {
  const url = req.query.url;

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let lyrics = "";

    $('[data-lyrics-container="true"]').each((i, el) => {
      lyrics += $(el).text() + "\n";
    });

    res.json({ lyrics });
  } catch (err) {
    res.status(500).json({ error: "Lyrics fetch failed" });
  }
});

app.listen(PORT, () => console.log("Server running on port " + PORT));