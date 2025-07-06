    const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
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

    const output = gptData.choices?.[0]?.message?.content;
    if (!output) {
      return res.status(500).send("⚠️ GPT tidak mengembalikan teks.");
    }

    return res.status(200).send(output);
