# Stage 1: Python Backend Setup
FROM python:3.9 AS backend
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt
RUN pip install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cpu
RUN apt-get update && apt-get install -y libgl1-mesa-glx
COPY python-app/ ./app

# Stage 2: Next.js Frontend Setup
FROM node:20 AS frontend
WORKDIR /app/nextjs-app
COPY nextjs-app/package.json nextjs-app/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY nextjs-app/ ./
RUN pnpm run build
# The .next directory is now inside /app/nextjs-app
# Final Stage
FROM python:3.9
WORKDIR /app

RUN apt-get update && apt-get install -y libpq-dev

# Install Node.js
RUN apt-get update && apt-get install -y curl software-properties-common && \
    curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Install pnpm
RUN npm install -g pnpm

# Install Python dependencies including uvicorn
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cpu
RUN apt-get update && apt-get install -y libgl1-mesa-glx

COPY --from=backend /app /app
COPY --from=frontend /app/nextjs-app /app/nextjs-app
COPY --from=frontend /app/nextjs-app/public /app/nextjs-app/public
COPY start_services.sh .
RUN chmod +x start_services.sh

# Expose the ports the services run on
EXPOSE 4000
EXPOSE 3000

CMD ["./start_services.sh"]
