module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.TELEGRAM_TOKEN;
  if (!token) return res.status(500).json({ ok: false, error: 'TELEGRAM_TOKEN not set' });

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
    const data = await response.json();
    if (!data.ok) return res.json({ ok: false, error: data.description });

    const users = {};
    data.result.forEach(update => {
      const msg = update.message;
      if (msg && msg.from && !msg.from.is_bot) {
        const id = msg.from.id;
        users[id] = {
          chatId: String(id),
          name: [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' '),
          username: msg.from.username || ''
        };
      }
    });

    return res.json({ ok: true, users: Object.values(users) });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
