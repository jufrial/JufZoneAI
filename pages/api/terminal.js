export default function handler(req, res) {
  res.status(200).json({
    status: "success",
    message: "Terminal AI aktif. Fitur analisis akan segera tersedia.",
    timestamp: new Date().toISOString()
  });
}