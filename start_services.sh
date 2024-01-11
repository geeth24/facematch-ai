#!/bin/bash

# Echo commands to the terminal
set -x

# Start the Python backend
uvicorn app.main:app --host 0.0.0.0 --port 4000 &

# Attempt to change directory and list contents to verify
cd nextjs-app

# Start the Next.js frontend
npm start &

# Keep the script running
wait
