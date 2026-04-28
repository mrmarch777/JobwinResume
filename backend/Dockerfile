FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend
COPY . .

# Expose port 8000
EXPOSE 8000

# Start the server — Railway injects PORT env var, use it if present
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
