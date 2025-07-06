
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
    const format = (p) => `$${p[1].toFixed(4)} @ ${new Date(p[0]).toLocaleTimeString()}`;
    const priceList = last3.map(format).join("\n");

    const p1 = last3[0][1];
    const p2 = last3[1][1];
    const p3 = last3[2][1];
    const change = ((p3 - p1) / p1) * 100;
    let trend = "";
    let reco = "";

    if (p1 < p2 && p2 < p3) { trend = "Naik kuat"; reco = "BUY"; }
    else if (p1 > p2 && p2 > p3) { trend = "Turun tajam"; reco = "SELL"; }
    else if (Math.abs(p3 - p1) < 0.005) { trend = "Sideway"; reco = "WAIT"; }
    else { trend = "Zig-zag"; reco = "HATI-HATI"; }

    const message = `🧠 Dummy AI Result for ${symbol}
⏱️ Timeframe 15m/1h/1d (last 3 pts)
${priceList}

📊 Trend: ${trend}
📈 Perubahan: ${change.toFixed(2)}%
✅ Rekomendasi: ${reco}`;

    return res.status(200).send(message);

  } catch (err) {
    return res.status(500).send("❌ Error: " + err.message);
  }
}
