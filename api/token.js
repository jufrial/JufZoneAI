export default async function handler(req, res) {
  const { token } = req.body;
  const prompt = `Prediksi arah dan peringatan untuk token ${token} dalam 15–60 menit ke depan. Singkat, tajam, dan langsung ke poin.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150
    })
  });

  const data = await response.json();
  res.status(200).json({ reply: data.choices[0].message.content });
}
