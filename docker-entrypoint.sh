#!/bin/sh
set -e

TEMPLATE="/etc/nginx/templates/default.conf.template"
OUTPUT="/etc/nginx/conf.d/default.conf"

if [ -n "$API_UPSTREAM" ]; then
  sed "s|__API_UPSTREAM__|${API_UPSTREAM}|g" "$TEMPLATE" > "$OUTPUT"
else
  sed '/# PROXY_START/,/# PROXY_END/d' "$TEMPLATE" > "$OUTPUT"
fi

exec nginx -g "daemon off;"
