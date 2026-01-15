#!/usr/bin/env node
const fs = require('fs');

let envContent = fs.readFileSync('.env', 'utf8');

envContent = envContent.replace(/https:\/\/skyler-storage\.b-cdn\.net/g, 'https://skyler-storage.b-cdn.net');

fs.writeFileSync('.env', envContent);
console.log('Fixed Bunny CDN URL in .env');
