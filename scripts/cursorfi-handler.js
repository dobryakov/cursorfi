#!/usr/bin/env node

/**
 * T120, T122: Protocol handler for cursorfi:// protocol (Windows)
 * 
 * This script is registered as a protocol handler on Windows to handle cursorfi:// URLs.
 * It calls the backend API via Cursor IDE's port forwarding (localhost:4001).
 * 
 * Usage:
 *   cursorfi://file/path/to/file.tsx:42
 *   cursorfi://page/app/page.tsx
 * 
 * Protocol registration (Windows):
 *   reg add "HKCU\Software\Classes\cursorfi" /ve /d "URL:cursorfi Protocol" /f
 *   reg add "HKCU\Software\Classes\cursorfi" /v "URL Protocol" /d "" /f
 *   reg add "HKCU\Software\Classes\cursorfi\shell\open\command" /ve /d "\"node\" \"%USERPROFILE%\\cursorfi\\scripts\\cursorfi-handler.js\" \"%1\"" /f
 */

const http = require('http');
const { URL } = require('url');

// Get the protocol URL from command line arguments
const protocolUrl = process.argv[2];

if (!protocolUrl) {
  console.error('Error: No protocol URL provided');
  process.exit(1);
}

// Parse the protocol URL: cursorfi://file/path/to/file.tsx:42 or cursorfi://page/app/page.tsx
// Format: cursorfi://{action}/{path}?:{line}?:{column}?
const url = new URL(protocolUrl);
const pathMatch = url.pathname.match(/^\/(file|page)\/(.+?)(?::(\d+))?(?::(\d+))?$/);

if (!pathMatch) {
  console.error('Error: Invalid protocol URL format. Expected: cursorfi://file/path/to/file.tsx:42 or cursorfi://page/app/page.tsx');
  process.exit(1);
}

const action = pathMatch[1]; // 'file' or 'page'
const filePath = decodeURIComponent(pathMatch[2]);
const line = pathMatch[3] ? parseInt(pathMatch[3], 10) : undefined;
const column = pathMatch[4] ? parseInt(pathMatch[4], 10) : undefined;

// Backend API endpoint (via Cursor IDE's port forwarding)
const backendPort = process.env.CURSORFI_BACKEND_PORT || '4001';
const backendUrl = `http://localhost:${backendPort}/api/trpc/cursor.open`;

// Prepare request payload
const payload = JSON.stringify({
  filePath,
  ...(line && { line }),
  ...(column && { column }),
});

// Make HTTP request to backend
const options = {
  hostname: 'localhost',
  port: backendPort,
  path: '/api/trpc/cursor.open',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  },
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (result.success) {
        if (action === 'page') {
          console.log(`Page opened in CursorFi: ${filePath}`);
        } else {
          console.log(`File opened in Cursor: ${filePath}${line ? `:${line}` : ''}`);
        }
      } else {
        console.error(`Error: ${result.message || 'Failed to open file'}`);
        process.exit(1);
      }
    } catch (error) {
      console.error('Error parsing response:', error);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error(`Error connecting to backend at localhost:${backendPort}:`, error.message);
  console.error('Make sure Cursor IDE is connected to the remote server and port forwarding is active.');
  process.exit(1);
});

req.write(payload);
req.end();

