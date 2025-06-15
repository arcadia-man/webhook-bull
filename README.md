
# webhook-bull

## 📌 Overview

This document explains how to handle incoming webhook requests efficiently using a queueing system (Bull) in a Node.js application.

---

## 📌 What is a Webhook?

- A webhook is an HTTP callback triggered by an external system when a specific event occurs.
- It sends a POST request to your application's endpoint with relevant event data (e.g., push to GitHub, payment from Stripe).

---

## 📌 Why Use a Queue (Bull) to Handle Webhooks?

- Webhooks can arrive at high frequency or volume.
- Processing them synchronously in the request-response cycle can lead to slow responses, timeouts, or failures.
- Using a queue like Bull helps decouple the receipt of the webhook from its processing.

---

## 📌 Workflow Steps

1. **Webhook Event Triggered:**
   - An external service (like GitHub or Stripe) sends a POST request to your application's webhook endpoint.

2. **Express Server Receives the Request:**
   - The incoming webhook is caught by an Express route.
   - Metadata like event type and the request payload are extracted.

3. **Job Enqueued into Bull Queue:**
   - Instead of processing the payload directly, it is pushed into a Redis-backed Bull queue as a job.
   - This keeps the API response fast and lightweight.

4. **Immediate API Response:**
   - The server responds with a 200 OK status to the external system, confirming receipt of the webhook.
   - This avoids retries and respects timeout constraints of the webhook provider.

5. **Worker Process Picks Up the Job:**
   - A separate background processor (running in a different Node.js process) continuously listens to the Bull queue.
   - When it detects a new job, it pulls it for processing.

6. **Job is Processed Asynchronously:**
   - The processor performs required logic such as:
     - Logging the event
     - Saving data to a database
     - Sending internal notifications
     - Triggering other services

7. **Monitoring and Retry:**
   - Bull automatically retries failed jobs based on your configuration.
   - Failed jobs can be logged or moved to a dead-letter queue for inspection.
   - Optional: You can add Bull Board or Arena UI to monitor the queue visually.

---

## 📌 Advantages of This Approach

- **Scalability:** Handles burst traffic without slowing down the main server.
- **Resilience:** Ensures processing continues even if some jobs fail or Redis restarts.
- **Decoupling:** Keeps webhook handling logic separate from the API layer.
- **Observability:** Jobs can be monitored, retried, or delayed easily.

---

## 📌 Dependencies Required

- `express` – to receive webhooks
- `bull` – queueing system for job management
- `ioredis` – Redis client used by Bull
- `dotenv` – for managing environment configuration
- `redis` – installed and running locally or remotely

---

## 📌 Best Practices

- Always validate webhook signatures to ensure authenticity.
- Limit the size of data stored in jobs; use job IDs + database references if needed.
- Run the queue processor and web server in separate processes.
- Monitor queue health and job failures with tools like Bull Board or logs.

---

## 🛠️ How to Run the Application

### 1. Set up `.env` file

Create a `.env` file in the root directory with the following content:

```
PORT=3000
REDIS_URL="redis://localhost:6379"
```

---

### 2. Start Redis

Make sure Redis is running locally. If not, you can start it using Docker:

```bash
docker run -p 6379:6379 redis
```

---

### 3. Run the Express Server

In one terminal window, start the server:

```bash
node index.js
```

---

### 4. Run the Queue Processor

In another terminal window, start the queue worker:

```bash
node processor.js
```

---

### 5. Test the Webhook Locally

Use the following `curl` command to simulate a GitHub webhook event:

```bash
curl -X POST http://localhost:3000/webhook/github \
  -H "Content-Type: application/json" \
  -H "x-github-event: push" \
  -d '{"repository":{"full_name":"example/repo"}, "pusher":{"name":"john"}, "head_commit":{"message":"Initial commit"}}'
```

---

### ✅ Expected Result

- The API will respond with `200 OK`.
- The job will be queued and processed asynchronously by `processor.js`.
- You will see logs in the processor terminal showing the parsed webhook data.