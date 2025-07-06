export default async function handler(req, res) {
  const symbol = (req.query.symbol || "BTCUSDT").toUpperCase();

  const dataMock = {
    "1s": "🔼 Naik kecil (1 detik)",
    "1m": "🔼 Naik stabil",
    "10m": "🔽 Turun ringan",
    "15m": "⏸️ Sideways kecil",
    "30m": "🔽 Koreksi ringan",
    "1h": "🔽 Turun moderat",
    "4h": "🔽 Turun tajam",
    "1d": "🔽 Dominan turun",
    "1w": "⏸️ Masih range besar"
  };

  const hasil = `
📊 Analisa ${symbol} oleh AI (Multi Timeframe)

• 1 detik  : ${dataMock["1s"]}
• 1 menit  : ${dataMock["1m"]}
• 10 menit : ${dataMock["10m"]}
• 15 menit : ${dataMock["15m"]}
• 30 menit : ${dataMock["30m"]}
• 1 jam    : ${dataMock["1h"]}
• 4 jam    : ${dataMock["4h"]}
• 1 hari   : ${dataMock["1d"]}
• 1 minggu : ${dataMock["1w"]}

📈 Kesimpulan Besar:
Tren dominan sedang **turun bertahap** dari 10m–1d.
Waspadai kemungkinan pantulan kecil namun tetap rawan breakdown.

💡 Saran AI:
• Hindari posisi Long.
• Amati volume di TF 4h+.
• Tunggu sinyal konfirmasi naik sebelum masuk posisi.

#JufZoneAI
`;

  return res.status(200).send(hasil);
}
