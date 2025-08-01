// Simple HTTP server using only Node.js built-in modules (no external dependencies)
const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');

// Load environment variables manually
require('dotenv').config();

const PORT = 3001;

// Helper function to parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
  });
}

// Helper function to send email via Resend API
function sendEmailViaResend(emailData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(emailData);
    
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
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);

  // Health check endpoint
  if (req.method === 'GET' && parsedUrl.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'OK', message: 'Email API server is running' }));
    return;
  }

  // Email sending endpoint
  if (req.method === 'POST' && parsedUrl.pathname === '/api/send-email') {
    try {
      const body = await parseBody(req);
      const { to, subject, html, from, reply_to } = body;

      if (!to || !subject || !html) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing required fields: to, subject, html' }));
        return;
      }

      const emailData = {
        from: from || process.env.VITE_FROM_EMAIL || 'noreply@example.com',
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        reply_to: reply_to || process.env.VITE_REPLY_TO,
      };

      const result = await sendEmailViaResend(emailData);
      console.log('Email sent successfully:', result);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: result }));

    } catch (error) {
      console.error('Error sending email:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`🚀 Email API server running on http://localhost:${PORT}`);
  console.log(`📧 Ready to send emails via Resend`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
