export default async function handler(req, res) {
  const symbol = req.query.symbol || "XRPUSDC";
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).send("❌ OPENAI_API_KEY belum diatur di Environment Variables.");
  }

  try {
    const intervals = ["15m", "1h", "1d"];
    const klines = {};

    for (let interval of intervals) {
      const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=5`;
      const response = await fetch(url);
      const data = await response.json();

      if (!Array.isArray(data)) {
        return res.status(500).send(`❌ Binance API error (${interval}): ${JSON.stringify(data)}`);
      }

      klines[interval] = data.map(c => ({
        time: c[0], open: c[1], high: c[2], low: c[3], close: c[4], volume: c[5]
      }));
    }

    const summary = intervals.map(interval => {
      const last = klines[interval].slice(-1)[0];
      return `${interval} - Open: ${last.open}, Close: ${last.close}, Volume: ${last.volume}`;
    }).join("\n");

    const prompt = `
Token: ${symbol}
Timeframes:
${summary}

Apa strategi terbaik saat ini? Long, short, atau wait? Jelaskan tiap timeframe.
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