#/bin/sh

set -x

cat > .env <<EOF
CV_JSON=$(jq . $1 -c)
EOF
