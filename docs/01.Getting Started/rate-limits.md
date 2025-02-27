---
id: rate-limits
title: Rate Limits
sidebar_position: 8
slug: /getting-started/rate-limits
---

ReserveKit implements rate limiting to ensure fair usage and system stability. These limits help maintain optimal performance for all users while preventing abuse. This page explains the rate limits that apply to your API requests and how to best work within these constraints.

## Types of Rate Limits

ReserveKit implements several types of rate limits:

1. **Request Rate Limits** - Limits on how many requests you can make per time period
2. **Endpoint-Specific Limits** - Different limits for specific high-resource endpoints
3. **Monthly Usage Limits** - Caps on total API usage per month based on your plan

## Request Rate Limits

Request rate limits restrict how many API calls you can make in a given time period. These limits help distribute API resources fairly among all users.

| Plan Type | Requests per Second | Burst Capacity |
|-----------|---------------------|----------------|
| Starter     | 5                   | 10             |
| Developer       | 10                  | 20             |
| Growth| 20                  | 50             |

When you exceed these limits, requests will return a `429 Too Many Requests` status code.

## Monthly Usage Limits

Each plan includes a monthly limit on the total number of API requests:

| Plan Type | Monthly Request Limit |
|-----------|------------------------|
| Starter     | 10,000                 |
| Developer       | 50,000                 |  
| Growth| Custom                 | 

You can view your current usage in the Developer Portal dashboard.

## How Rate Limiting Works

ReserveKit uses a combination of leaky bucket and token bucket algorithms for rate limiting:

1. **Leaky Bucket** - Controls the overall rate of requests
2. **Token Bucket** - Allows for short bursts of traffic while maintaining average limits

## Rate Limit Headers

When you make API requests, the response headers include information about your current rate limit status:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | The maximum number of requests allowed per period |
| `X-RateLimit-Remaining` | The number of requests remaining in the current period |
| `X-RateLimit-Reset` | The time at which the rate limit will reset (in Unix time) |
| `Retry-After` | When rate-limited, this header tells you how many seconds to wait before retrying |

Example:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1623846000
```

## Handling Rate Limits

When you exceed a rate limit, the API will respond with:

- HTTP Status Code: `429 Too Many Requests`
- A JSON error object with a `rate_limit_exceeded` code
- A `Retry-After` header indicating how long to wait before retrying

Example response:
```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Try again in 30 seconds.",
    "retry_after": 30
  }
}
```

### Implementing Backoff Strategies

To handle rate limits effectively, implement an exponential backoff strategy:

```javascript
async function makeApiRequestWithRetry(url, options, maxRetries = 3) {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const response = await fetch(url, options);
      
      if (response.status !== 429) {
        return response;
      }
      
      // Rate limited - get retry time
      const retryAfter = parseInt(response.headers.get('Retry-After') || '30');
      const backoffTime = retryAfter * 1000 * Math.pow(2, retries);
      
      console.log(`Rate limited. Retrying in ${backoffTime/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      
      retries++;
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }
  
  throw new Error('Max retries exceeded');
}
```

## Best Practices

To minimize the impact of rate limits on your application:

### 1. Implement Caching

Cache responses that don't change frequently:

```javascript
const cache = new Map();

async function getWithCaching(url, options, ttlSeconds = 300) {
  if (cache.has(url) && cache.get(url).expiry > Date.now()) {
    return cache.get(url).data;
  }
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  cache.set(url, {
    data,
    expiry: Date.now() + (ttlSeconds * 1000)
  });
  
  return data;
}
```

### 2. Use Bulk Operations

When possible, use batch endpoints instead of making multiple single-item requests:

- Use `GET /v1/time-slots?service_id=123` with pagination instead of multiple requests for individual time slots
- Update multiple time slots at once with `PATCH /v1/time-slots`

### 3. Implement Request Queuing

Queue non-urgent requests and process them at a controlled rate:

```javascript
class RequestQueue {
  constructor(requestsPerSecond = 5) {
    this.queue = [];
    this.processing = false;
    this.interval = 1000 / requestsPerSecond;
  }
  
  async add(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      if (!this.processing) {
        this.process();
      }
    });
  }
  
  async process() {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const { request, resolve, reject } = this.queue.shift();
      
      try {
        const result = await request();
        resolve(result);
      } catch (error) {
        reject(error);
      }
      
      // Wait before processing the next request
      await new Promise(resolve => setTimeout(resolve, this.interval));
    }
    
    this.processing = false;
  }
}

// Usage
const queue = new RequestQueue(5); // 5 requests per second

queue.add(() => fetch('https://api.reservekit.io/v1/services'))
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

### 4. Optimize Your Code

- Make only the API calls you need
- Use filtering parameters to reduce response size
- Implement proper error handling to avoid repeat requests

### 5. Monitor Your Usage

- Regularly check your API usage in the Developer Portal
- Adjust your implementation if you're consistently hitting rate limits

## Plan Upgrades

If you consistently need higher limits, consider upgrading your plan:

| Feature | Starter | Developer | Growth |
|---------|-------|-----|------------|
| Requests per second | 5 | 10 | 20+ |
| Monthly requests | 10,000 | 50,000 | Custom |
| Support | Email | Priority Email | Dedicated Support |

Visit the [Pricing Page](https://reservekit.io/#pricing) or contact [amin@reservekit.io](mailto:amin@reservekit.io) for more information about plan upgrades.

## Next Steps

Now that you understand ReserveKit's rate limits, you can build a more resilient application that operates efficiently within these constraints. Check out the [Best Practices](/getting-started/best-practices) section for more tips on optimizing your integration with ReserveKit.
