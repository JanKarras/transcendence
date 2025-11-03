#!/bin/bash
CERT_DIR="/etc/nginx/certs"
CRT="$CERT_DIR/nginx-selfsigned.crt"
KEY="$CERT_DIR/nginx-selfsigned.key"

# Prüfen, ob Zertifikate existieren
if [ ! -f "$CRT" ] || [ ! -f "$KEY" ]; then
  echo "🔐 Generating self-signed SSL certificate..."
  openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout "$KEY" \
    -out "$CRT" \
    -subj "/C=DE/ST=Lower Saxony/L=Wolfsburg/O=42/OU=Transcendence/CN=localhost"
else
  echo "✅ SSL certificates already exist, skipping generation."
fi
