// Simple Express server to handle email API (bypasses CORS)
const express = require('express');
const dotenv = require('dotenv');
const https = require('https');

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());

// Manual CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Email endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, from, reply_to } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
    }

    const postData = JSON.stringify({
      from: from || process.env.VITE_FROM_EMAIL || 'noreply@example.com',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      reply_to: reply_to || process.env.VITE_REPLY_TO,
    });

    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const result = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });
      req.on('error', reject);
      req.write(postData);
      req.end();
    });

    console.log('Email sent successfully:', result);
    return res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Email API server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Email API server running on http://localhost:${PORT}`);
  console.log(`📧 Ready to send emails via Resend`);
});
