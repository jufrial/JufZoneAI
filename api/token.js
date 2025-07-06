export default async function handler(req, res) {
  const symbol = (req.query.symbol || "BTCUSDT").toUpperCase();
  const symbolToId = {
    "BTCUSDT": "bitcoin",
    "ETHUSDT": "ethereum",
    "XRPUSDC": "ripple"
  };

  const coinId = symbolToId[symbol];
  if (!coinId) {
    return res.status(400).send("❌ Token tidak didukung");
  }

  try {
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=1`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data?.prices || data.prices.length < 3) {
      return res.status(500).send("❌ Gagal ambil harga");
    }

    const last3 = data.prices.slice(-3).map(([t, p]) => {
      return `${new Date(t).toLocaleTimeString()} - $${p.toFixed(4)}`
    }).join("\\n");

    return res.status(200).send("📊 Harga 3 titik terakhir:\\n" + last3);

  } catch (err) {
    return res.status(500).send("❌ CoinGecko Fetch Error: " + err.message);
  }
}
