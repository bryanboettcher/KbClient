#!/bin/sh
set -e

# Generate env.js with environment variables injected at runtime
cat <<EOF > /usr/share/nginx/html/assets/env.js
window.env = {
  apiUrl: '${API_URL:-http://localhost:5000/api}'
};
EOF

echo "Environment configuration injected:"
cat /usr/share/nginx/html/assets/env.js

# Execute the CMD (nginx)
exec "$@"
