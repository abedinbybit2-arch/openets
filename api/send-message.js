module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { chatId, message } = req.body;
  const token = process.env.TELEGRAM_TOKEN;

  if (!token) return res.status(500).json({ ok: false, error: 'TELEGRAM_TOKEN not set' });
  if (!chatId || !message) return res.status(400).json({ ok: false, error: 'Missing chatId or message' });

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message })
    });
    const data = await response.json();
    if (data.ok) return res.json({ ok: true });
    return res.json({ ok: false, error: data.description || 'Telegram error' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
