export default function handler(req, res) {
  const symbol = (req.query.symbol || "BTCUSDT").toUpperCase();

  const harga = {
    "1m": 58200,
    "10m": 58080,
    "15m": 58020,
    "1h": 57890,
    "4h": 57600,
    "1d": 57500
  };

  const arah = {
    "1m": "⬆️",
    "10m": "⬇️",
    "15m": "⬇️",
    "1h": "⬇️",
    "4h": "⬇️",
    "1d": "⬆️"
  };

  const analisa = `📊 Analisa ${symbol} (Versi Dummy - Simulasi)

• 1m  : $${harga["1m"]} ${arah["1m"]}
• 10m : $${harga["10m"]} ${arah["10m"]}
• 15m : $${harga["15m"]} ${arah["15m"]}
• 1h  : $${harga["1h"]} ${arah["1h"]}
• 4h  : $${harga["4h"]} ${arah["4h"]}
• 1d  : $${harga["1d"]} ${arah["1d"]}

📛 Waspada:
Harga mencoba naik (TF kecil), tapi gagal tembus $58260.
📉 TF besar masih dominan turun.
⚠️ Breakout palsu terlihat — volume lemah & candle tak dikonfirmasi.

🎯 BUY jika mantul kuat dari $57600 disertai volume tinggi.
🛑 HINDARI posisi jika harga berputar antara $57890–$58260 (jebakan area).

💬 Rekomendasi AI:
Tunda entry besar. Tunggu breakout valid di atas $58260 atau breakdown di bawah $57600 disertai volume besar. Jangan terburu masuk saat arah tidak sinkron antar timeframe.
`;

  return res.status(200).send(analisa);
}
