export default async function handler(req, res) {
  const symbol = (req.query.symbol || "XRPUSDC").toUpperCase();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).send("❌ OPENAI_API_KEY belum diatur.");
  }

  const symbolToId = {
    "BTCUSDT": "bitcoin",
    "ETHUSDT": "ethereum",
    "XRPUSDC": "ripple"
  };

  const coinId = symbolToId[symbol];
  if (!coinId) {
    return res.status(400).send(`❌ Token ${symbol} belum didukung.`);
  }

  try {
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=1`;
    const response = await fetch(url);
    const json = await response.json();

    const prices = json?.prices;
    if (!Array.isArray(prices) || prices.length < 3) {
      return res.status(500).send("❌ Gagal mengambil harga dari CoinGecko.");
    }

    const last3 = prices.slice(-3).map(([time, price]) => {
      const t = new Date(time).toLocaleTimeString();
      return `Waktu: ${t} - Harga: $${price.toFixed(4)}`;
    }).join("\\n");

    const prompt = `Token: ${symbol}
Harga 3 titik terakhir hari ini:
${last3}

Apa sinyal terbaik saat ini? Buy, sell, atau wait? Jelaskan secara teknikal.`;

    const ai = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await ai.json();
    const result = data.choices?.[0]?.message?.content || "⚠️ GPT tidak menjawab.";

    return res.status(200).send(result);

  } catch (err) {
    return res.status(500).send("❌ Error: " + err.message);
  }
}
