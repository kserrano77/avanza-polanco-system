// Dependency-free HTTP server using only Node.js built-in modules
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

// Load environment variables manually from .env file
function loadEnvVars() {
  try {
    const envPath = path.join(__dirname, '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('Could not load .env file:', error.message);
    return {};
  }
}

const env = loadEnvVars();

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
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
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
    res.end(JSON.stringify({ 
      status: 'OK', 
      message: 'Email API server is running',
      hasApiKey: !!env.RESEND_API_KEY,
      fromEmail: env.VITE_FROM_EMAIL || 'Not set'
    }));
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

      if (!env.RESEND_API_KEY) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'RESEND_API_KEY not configured' }));
        return;
      }

      const emailData = {
        from: from || env.VITE_FROM_EMAIL || 'noreply@example.com',
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        reply_to: reply_to || env.VITE_REPLY_TO,
      };

      console.log('Sending email to:', emailData.to);
      console.log('From:', emailData.from);
      console.log('Subject:', emailData.subject);

      const result = await sendEmailViaResend(emailData);
      console.log('✅ Email sent successfully:', result);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: result }));

    } catch (error) {
      console.error('❌ Error sending email:', error.message);
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
  console.log(`🔑 API Key configured: ${!!env.RESEND_API_KEY ? 'Yes' : 'No'}`);
  console.log(`📨 From email: ${env.VITE_FROM_EMAIL || 'Not set'}`);
});
