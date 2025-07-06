export default async function handler(req, res) {
  const symbol = (req.query.symbol || "XRPUSDC").toUpperCase();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).send("❌ OPENAI_API_KEY belum diatur.");
  }

  // Pemetaan ke CoinGecko ID
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
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=1&interval=hourly`;
    const response = await fetch(url);
    const json = await response.json();

    if (!json?.prices || !Array.isArray(json.prices)) {
      return res.status(500).send("❌ Gagal mengambil harga CoinGecko.");
    }

    const last3 = json.prices.slice(-3).map(([time, price]) => {
      const t = new Date(time).toLocaleTimeString();
      return `Waktu: ${t} - Harga: $${price.toFixed(4)}`;
    }).join("\\n");

    const prompt = `Token: ${symbol}
Harga 3 jam terakhir:
${last3}

Apakah saat ini peluang terbaik Buy, Sell, atau Wait? Berikan analisa teknikal sederhana.`;

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
