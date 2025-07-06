export default async function handler(req, res) {
  const symbol = (req.query.symbol || "BTCUSDT").toUpperCase();
  const apiKey = process.env.OPENAI_API_KEY;

  const symbolToId = {
    "BTCUSDT": "bitcoin",
    "ETHUSDT": "ethereum",
    "XRPUSDC": "ripple"
  };

  const coinId = symbolToId[symbol];
  if (!coinId) return res.status(400).send("❌ Token tidak didukung.");

  if (!apiKey) return res.status(500).send("❌ OPENAI_API_KEY tidak diatur.");

  try {
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=1`;
    const response = await fetch(url);
    const data = await response.json();

    const prices = data?.prices;
    if (!Array.isArray(prices) || prices.length < 3) {
      return res.status(500).send("❌ Gagal ambil harga dari CoinGecko.");
    }

    const last3 = prices.slice(-3).map(([t, p], i) => {
      return `T${i+1}: ${new Date(t).toLocaleTimeString()} - $${p.toFixed(4)}`;
    }).join("\\n");

    const prompt = `Token: ${symbol}
Harga terbaru:
${last3}

Berikan analisis ringkas. Saat ini sebaiknya BUY, SELL, atau WAIT?`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5
      })
    });

    const aiData = await aiRes.json();

    if (aiData.error) {
      return res.status(500).send("❌ GPT Error: " + aiData.error.message);
    }

    const answer = aiData.choices?.[0]?.message?.content;
    if (!answer) {
      return res.status(500).send("⚠️ GPT tidak menjawab.");
    }

    return res.status(200).send("📊 Harga:\n" + last3 + "\n\n🤖 Analisis AI:\n" + answer);

  } catch (err) {
    return res.status(500).send("❌ Server Error: " + err.message);
  }
}
