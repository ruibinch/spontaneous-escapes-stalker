const https = require('https');
const { KFSEANALYSIS_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

module.exports.handler = async (event) => {
  const body = JSON.parse(event.body); // { email: string; message: string }
  const message = encodeURIComponent(`${body.email}\n\n${body.message}`);

  const url = `https://api.telegram.org/bot${KFSEANALYSIS_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${message}`;

  const result = await new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject({ error: `statusCode=${res.statusCode}` });
      }
      let body = [];
      res.on('data', (chunk) => {
        body.push(chunk);
      });
      res.on('end', () => {
        try {
          // response from Telegram API
          body = JSON.parse(Buffer.concat(body).toString());
        } catch (err) {
          reject({ error: JSON.stringify(err) });
        }
        resolve({ data: body });
      });
    });

    req.on('error', (err) => {
      reject({ error: err.message });
    });
    req.end();
  });

  return 'data' in result
    ? { statusCode: 204 }
    : { statusCode: 500, body: result };
};
