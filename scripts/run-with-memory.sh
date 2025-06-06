#!/bin/bash
# Run Node.js scripts with increased memory

# Option 1: Set to 4GB
node --max-old-space-size=4096 "$@"

# Option 2: Set to 8GB (uncomment if needed)
# node --max-old-space-size=8192 "$@"

# Option 3: Set to 16GB (uncomment if needed)
# node --max-old-space-size=16384 "$@"