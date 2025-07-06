export default async function handler(req, res) {
  const symbol = (req.query.symbol || "XRPUSDC").toLowerCase();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).send("❌ OPENAI_API_KEY belum diatur di Environment Variables.");
  }

  const symbolMap = {
    xrpcusdc: "ripple",
    xrp: "ripple",
    btcusdt: "bitcoin",
    ethusdt: "ethereum"
  };

  const tokenId = symbolMap[symbol.replace(/[^a-z]/gi, "")] || "bitcoin";

  try {
    const resPrice = await fetch(`https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart?vs_currency=usd&days=1&interval=hourly`);
    const priceData = await resPrice.json();

    if (!priceData?.prices) {
      return res.status(500).send("❌ Gagal mengambil data dari CoinGecko.");
    }

    const last3 = priceData.prices.slice(-3).map(p =>
      `Waktu: ${new Date(p[0]).toLocaleTimeString()}, Harga: $${p[1].toFixed(4)}`
    ).join("\\n");

    const prompt = `
Token: ${symbol.toUpperCase()}
Harga 3 jam terakhir:
${last3}

Apakah saat ini layak untuk buy, sell, atau wait? Jelaskan.
`;

    const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
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

    const gptData = await gptRes.json();

    if (gptData.error) {
      return res.status(500).send("❌ GPT Error: " + gptData.error.message);
    }

    const answer = gptData.choices?.[0]?.message?.content || "⚠️ GPT tidak memberikan jawaban.";
    res.status(200).send(answer);

  } catch (err) {
    res.status(500).send("❌ Server Error: " + err.message);
  }
}
