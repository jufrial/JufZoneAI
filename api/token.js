export default async function handler(req, res) {
  const symbol = req.query.symbol || "XRPUSDC";
  res.status(200).send(`✅ API Aktif. Token: ${symbol}`);
}
