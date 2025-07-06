import fetch from 'node-fetch';

export default async function handler(req, res) {
  const symbol = req.query.symbol || "XRPUSDC";

  const intervals = ["15m", "1h", "1d"];
  const klines = {};

  for (let interval of intervals) {
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=5`;
    const response = await fetch(url);
    const data = await response.json();
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

Apa yang harus dilakukan saat ini? Long? Short? Atau menunggu?
Berikan penjelasan detail untuk semua timeframe.
`;

  const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    })
  });

  const gptData = await gptRes.json();
  const answer = gptData.choices?.[0]?.message?.content || "Tidak ada jawaban dari AI.";

  res.status(200).send(answer);
}