module.exports = async function handler(req, res) {
  const token = process.env.TELEGRAM_TOKEN;
  const groupId = process.env.TELEGRAM_GROUP_ID;

  if (!token || !groupId) {
    return res.status(500).json({ error: 'Missing TELEGRAM_TOKEN or TELEGRAM_GROUP_ID' });
  }

  try {
    const priceResp = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,bdt&include_24hr_change=true'
    );
    const priceData = await priceResp.json();
    const btc = priceData.bitcoin;

    const change = btc.usd_24h_change.toFixed(2);
    const arrow = change >= 0 ? '📈' : '📉';
    const sign = change >= 0 ? '+' : '';

    const message =
`${arrow} *Bitcoin Update*

💵 USD: $${btc.usd.toLocaleString()}
💴 BDT: ৳${btc.bdt.toLocaleString()}
📊 ২৪ঘণ্টা: ${sign}${change}%

🕐 ${new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })}`;

    const sendResp = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: groupId,
          text: message,
          parse_mode: 'Markdown'
        })
      }
    );

    const sendData = await sendResp.json();
    if (sendData.ok) return res.json({ ok: true, price: btc.usd });
    return res.json({ ok: false, error: sendData.description });

  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
