export default async function handler(req, res) {
  const symbol = (req.query.symbol || "BTCUSDT").toUpperCase();
  const symbolToId = {
    "BTCUSDT": "bitcoin",
    "ETHUSDT": "ethereum",
    "XRPUSDC": "ripple"
  };
  const coinId = symbolToId[symbol];
  if (!coinId) return res.status(400).send("❌ Token tidak didukung.");

  try {
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=1`;
    const response = await fetch(url);
    const data = await response.json();

    const prices = data?.prices;
    if (!Array.isArray(prices) || prices.length < 3) {
      return res.status(500).send("❌ Gagal ambil harga dari CoinGecko.");
    }

    const last3 = prices.slice(-3);
    const p1 = last3[0][1];
    const p2 = last3[1][1];
    const p3 = last3[2][1];
    const time1 = new Date(last3[0][0]).toLocaleTimeString();
    const time2 = new Date(last3[1][0]).toLocaleTimeString();
    const time3 = new Date(last3[2][0]).toLocaleTimeString();

    const change = ((p3 - p1) / p1) * 100;
    let mood = "";
    let advice = "";

    if (p1 < p2 && p2 < p3) {
      mood = "Harga terus naik pelan-pelan.";
      advice = "Boleh beli sekarang, tapi tetap hati-hati ya.";
    } else if (p1 > p2 && p2 > p3) {
      mood = "Harga makin turun dari waktu ke waktu.";
      advice = "Jangan beli dulu, tunggu harga naik lagi biar lebih aman.";
    } else if (Math.abs(p3 - p1) < 0.005) {
      mood = "Harga nggak banyak berubah, masih bolak-balik aja.";
      advice = "Mending tunggu dulu sampai arahnya lebih jelas.";
    } else {
      mood = "Pergerakan harga agak aneh, naik-turun nggak jelas.";
      advice = "Hati-hati, bisa naik tapi juga bisa turun tiba-tiba.";
    }

    const message = `📊 Analisa ${symbol} oleh JufZone AI
Waktu 15m/1h/1d (3 data terakhir):
${p1.toFixed(4)} @ ${time1}
${p2.toFixed(4)} @ ${time2}
${p3.toFixed(4)} @ ${time3}

📈 ${mood}
📉 Perubahan: ${change.toFixed(2)}%
💡 Saran AI: ${advice}`;

    return res.status(200).send(message);
  } catch (err) {
    return res.status(500).send("❌ Error: " + err.message);
  }
}
