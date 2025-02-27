---
id: best-practices
title: Best Practices
position: 9
slug: /getting-started/best-practices
---

This guide provides recommended practices for integrating with the ReserveKit API. Following these guidelines will help you build a robust, efficient, and maintainable integration that provides the best experience for your users while minimizing potential issues.

## API Integration

### Use the Right Authentication Method

- Always use API keys for server-to-server communication
- Never expose your API keys in client-side code
- Store API keys securely using environment variables or a secure vault
- Consider using different API keys for different environments (development, staging, production)

```javascript
// Bad practice - hardcoded API key
const apiKey = "sk_rsv_1234567890abcdef";

// Good practice - using environment variables
const apiKey = process.env.RESERVEKIT_API_KEY;
```

### Version Management

- Include version information in your integration to track API changes
- Monitor the ReserveKit changelog for API updates
- Test upgrades in a staging environment before deploying to production

## Performance Optimization

### Implement Caching

Cache responses that don't change frequently to reduce API calls:

```javascript
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const cache = new Map();

async function fetchWithCache(url, options = {}) {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  
  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
  }
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  return data;
}
```

Good candidates for caching:
- Service details and configurations
- Time slot availability (with a short TTL)
- Static booking data

### Use Pagination Effectively

When retrieving large collections of data, use pagination to limit response sizes:

```javascript
// Fetch all bookings across multiple pages
async function getAllBookings(serviceId) {
  let allBookings = [];
  let page = 1;
  const pageSize = 50;
  let hasMorePages = true;
  
  while (hasMorePages) {
    const response = await fetch(`https://api.reservekit.io/v1/bookings?service_id=${serviceId}&page=${page}&page_size=${pageSize}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    const data = await response.json();
    const bookings = data.data.bookings;
    const pagination = data.data.pagination;
    
    allBookings = [...allBookings, ...bookings];
    
    if (pagination.current_page >= pagination.total_pages) {
      hasMorePages = false;
    } else {
      page++;
    }
  }
  
  return allBookings;
}
```

### Batch Operations

Use batch endpoints where available instead of making multiple individual requests:

- Updating multiple time slots in a single request
- Fetching multiple bookings in one request with filters

## Error Handling

### Implement Comprehensive Error Handling

Properly handle all possible error scenarios:

```javascript
async function makeApiRequest(url, options) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      // Handle API errors
      const errorCode = data.error?.code;
      const errorMessage = data.error?.message || 'Unknown error';
      
      switch (response.status) {
        case 400:
          console.error(`Bad request: ${errorMessage}`);
          // Handle validation errors
          break;
        case 401:
          console.error(`Authentication error: ${errorMessage}`);
          // Handle authentication issues
          break;
        case 404:
          console.error(`Resource not found: ${errorMessage}`);
          // Handle missing resources
          break;
        case 429:
          console.error(`Rate limit exceeded: ${errorMessage}`);
          // Implement retry with backoff
          break;
        case 500:
          console.error(`Server error: ${errorMessage}`);
          // Handle server errors
          break;
        default:
          console.error(`API error (${response.status}): ${errorMessage}`);
      }
      
      throw new Error(`API error: ${errorMessage}`);
    }
    
    return data.data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Network error:', error);
      // Handle network issues
    }
    throw error;
  }
}
```

### Implement Retry Logic

Use exponential backoff for retrying failed requests:

```javascript
async function fetchWithRetry(url, options, maxRetries = 3) {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const response = await fetch(url, options);
      
      if (response.status !== 429 && response.status !== 500) {
        return response;
      }
      
      // Calculate backoff time - exponential with jitter
      const retryAfter = parseInt(response.headers.get('Retry-After') || '1');
      const baseWait = retryAfter * 1000;
      const maxJitter = baseWait * 0.2; // 20% jitter
      const waitTime = baseWait * Math.pow(2, retries) + Math.random() * maxJitter;
      
      console.log(`Retrying in ${Math.round(waitTime/1000)} seconds...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
    } catch (error) {
      console.error('Request failed:', error);
    }
    
    retries++;
  }
  
  throw new Error('Maximum retries exceeded');
}
```

## Data Management

### Handling Time Zones

Always be explicit about time zones when dealing with dates and times:

```javascript
// Create a booking with explicit timezone handling
async function createBooking(serviceId, timeSlotId, date, customerData) {
  // Ensure the date is in YYYY-MM-DD format
  const formattedDate = new Date(date).toISOString().split('T')[0];
  
  const bookingData = {
    date: formattedDate,
    time_slot_id: timeSlotId,
    customer_name: customerData.name,
    customer_email: customerData.email,
    customer_phone: customerData.phone
  };
  
  const response = await fetch(`https://api.reservekit.io/v1/bookings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bookingData)
  });
  
  return response.json();
}
```

### Validation

Always validate data before sending it to the API:

```javascript
function validateBookingData(data) {
  const errors = {};
  
  if (!data.date) errors.date = 'Date is required';
  if (!data.time_slot_id) errors.timeSlotId = 'Time slot is required';
  
  // Validate email format if provided
  if (data.customer_email && !isValidEmail(data.customer_email)) {
    errors.customerEmail = 'Invalid email format';
  }
  
  // Validate phone format if provided
  if (data.customer_phone && !isValidPhone(data.customer_phone)) {
    errors.customerPhone = 'Phone must be in E.164 format (e.g., +12025550185)';
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^\+[1-9]\d{1,14}$/.test(phone);
}
```

## Webhook Implementation

### Best Practices for Webhook Handlers

1. **Respond Quickly**: Acknowledge receipt of webhooks immediately before processing

```javascript
app.post('/webhooks/reservekit', (req, res) => {
  // Immediately acknowledge receipt
  res.status(200).send('Webhook received');
  
  // Process asynchronously
  setTimeout(() => {
    processWebhook(req.body).catch(err => {
      console.error('Webhook processing error:', err);
    });
  }, 0);
});
```

2. **Make Handlers Idempotent**: Process webhooks without side effects if received multiple times

```javascript
async function processWebhook(payload) {
  const { event_type, bookings } = payload;
  const booking = bookings[0];
  
  // Check if we've already processed this webhook
  const alreadyProcessed = await checkIfProcessed(event_type, booking.id, booking.updated_at);
  if (alreadyProcessed) {
    console.log(`Already processed ${event_type} for booking ${booking.id}`);
    return;
  }
  
  // Process based on event type
  switch(event_type) {
    case 'bookings.create':
      await handleNewBooking(booking);
      break;
    case 'bookings.update':
      await handleBookingUpdate(booking);
      break;
    case 'bookings.delete':
      await handleBookingDeletion(booking);
      break;
  }
  
  // Mark as processed
  await markAsProcessed(event_type, booking.id, booking.updated_at);
}
```

3. **Implement Verification**: Verify webhook authenticity

```javascript
function isValidWebhook(request) {
  // Implement verification logic (e.g., signature validation)
  // This will depend on what verification methods ReserveKit provides
  return true;
}
```

## Testing and Development

### Use Test API Keys

Always use test API keys (`tk_rsv_`) for development and testing:

```javascript
// For development/testing environments
const apiKey = process.env.NODE_ENV === 'production'
  ? process.env.RESERVEKIT_LIVE_API_KEY
  : process.env.RESERVEKIT_TEST_API_KEY;
```

### Create Test Fixtures

Maintain test fixtures for common scenarios:

```javascript
// test/fixtures/booking.js
module.exports = {
  validBooking: {
    date: "2023-12-31",
    time_slot_id: 123,
    customer_name: "Test Customer",
    customer_email: "test@example.com",
    customer_phone: "+12025550185"
  },
  invalidBooking: {
    date: "invalid-date",
    time_slot_id: -1,
    customer_email: "not-an-email"
  }
};
```

### Integration Testing

Set up proper integration tests:

```javascript
const { expect } = require('chai');
const { validBooking } = require('./fixtures/booking');
const { createBooking, getBooking } = require('../src/api');

describe('Booking API Integration', function() {
  this.timeout(10000); // Allow time for API calls
  
  let bookingId;
  
  it('should create a booking', async () => {
    const result = await createBooking(validBooking);
    expect(result).to.have.property('id');
    bookingId = result.id;
  });
  
  it('should retrieve the created booking', async () => {
    const booking = await getBooking(bookingId);
    expect(booking).to.have.property('id', bookingId);
    expect(booking.customer).to.have.property('email', validBooking.customer_email);
  });
});
```

## Production Considerations

### Monitoring and Logging

Implement comprehensive logging and monitoring:

```javascript
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'reservekit-integration' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log API request and response
async function apiCall(url, options) {
  const requestId = generateRequestId();
  
  logger.info({
    message: 'API request',
    requestId,
    url,
    method: options.method || 'GET'
  });
  
  try {
    const startTime = Date.now();
    const response = await fetch(url, options);
    const data = await response.json();
    const duration = Date.now() - startTime;
    
    logger.info({
      message: 'API response',
      requestId,
      statusCode: response.status,
      duration,
      success: response.ok
    });
    
    if (!response.ok) {
      logger.error({
        message: 'API error',
        requestId,
        statusCode: response.status,
        error: data.error
      });
    }
    
    return data;
  } catch (error) {
    logger.error({
      message: 'API request failed',
      requestId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}
```

### Rate Limit Handling in Production

Implement graceful handling of rate limits:

```javascript
class ApiRateLimiter {
  constructor(maxRequestsPerSecond) {
    this.queue = [];
    this.processing = false;
    this.interval = 1000 / maxRequestsPerSecond;
    this.lastRequestTime = 0;
  }
  
  async enqueue(apiCallFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ apiCallFn, resolve, reject });
      
      if (!this.processing) {
        this.processQueue();
      }
    });
  }
  
  async processQueue() {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const { apiCallFn, resolve, reject } = this.queue.shift();
      
      // Ensure we're respecting the rate limit
      const now = Date.now();
      const timeToWait = Math.max(0, this.interval - (now - this.lastRequestTime));
      
      if (timeToWait > 0) {
        await new Promise(r => setTimeout(r, timeToWait));
      }
      
      try {
        const result = await apiCallFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
      
      this.lastRequestTime = Date.now();
    }
    
    this.processing = false;
  }
}

// Usage
const rateLimiter = new ApiRateLimiter(5); // 5 requests per second

async function getService(serviceId) {
  return rateLimiter.enqueue(() => {
    return fetch(`https://api.reservekit.io/v1/services/${serviceId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    }).then(res => res.json());
  });
}
```

### Health Checks

Implement health checks for your integration:

```javascript
async function checkApiHealth() {
  try {
    const response = await fetch('https://api.reservekit.io/v1/health', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    if (response.ok) {
      logger.info('API health check: OK');
      return true;
    } else {
      logger.warn(`API health check failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    logger.error(`API health check error: ${error.message}`);
    return false;
  }
}

// Run health check every 5 minutes
setInterval(checkApiHealth, 5 * 60 * 1000);
```

## Security Best Practices

### Secure Data Handling

- Never log sensitive information like API keys or customer data
- Implement proper data sanitization before storing or displaying data
- Use HTTPS for all API communications
- Implement proper access controls in your application

### API Key Rotation

Regularly rotate your API keys:

1. Generate a new API key in the Developer Portal
2. Deploy the new key to your production environment
3. Verify that the new key works correctly
4. Revoke the old API key

## Summary

By following these best practices, you'll create a robust and efficient integration with the ReserveKit API that provides a great experience for your users while minimizing potential issues. Remember that optimizing your integration is an ongoing process—regularly review your implementation and make improvements as needed.

For more specific guidance or help with your integration, don't hesitate to reach out to our support team through the Developer Portal.
