---
id: error-handling
title: Error Handling
sidebar_position: 7
slug: /error-handling
---

The ReserveKit API uses conventional HTTP response codes to indicate the success or failure of an API request. This guide explains how to interpret error responses and provides best practices for handling errors in your applications.

## Response Format

All API responses, including errors, follow a consistent envelope format:

### Success Response

```json
{
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "error_code",
    "message": "A description of the error"
  }
}
```

## HTTP Status Codes

The ReserveKit API uses the following HTTP status codes:

| Status Code | Description |
|-------------|-------------|
| 200 | OK - The request was successful |
| 201 | Created - The resource was successfully created |
| 400 | Bad Request - The request contains invalid parameters |
| 401 | Unauthorized - Authentication failed or wasn't provided |
| 403 | Forbidden - The authenticated user doesn't have permission |
| 404 | Not Found - The requested resource doesn't exist |
| 422 | Unprocessable Entity - The request is valid but can't be processed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Something went wrong on our server |

## Common Error Types

### Authentication Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `authentication_required` | No authentication credentials provided |
| 401 | `invalid_api_key` | The API key is invalid or revoked |
| 401 | `authorization_header_malformed` | The Authorization header format is incorrect |

Example:
```json
{
  "error": {
    "code": "invalid_api_key",
    "message": "API key is invalid or revoked"
  }
}
```

### Request Validation Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `invalid_request` | General validation error |
| 400 | `missing_required_field` | A required field is missing |
| 400 | `invalid_field_format` | A field's format is invalid |

Example:
```json
{
  "error": {
    "code": "invalid_field_format",
    "message": "The customer_email field must be a valid email address"
  }
}
```

### Resource Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 404 | `resource_not_found` | The requested resource doesn't exist |
| 404 | `service_not_found` | The specified service doesn't exist |
| 404 | `booking_not_found` | The specified booking doesn't exist |
| 404 | `time_slot_not_found` | The specified time slot doesn't exist |

Example:
```json
{
  "error": {
    "code": "booking_not_found",
    "message": "Booking with ID 789 not found"
  }
}
```

### Business Logic Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `time_slot_full` | The requested time slot is already at capacity |
| 400 | `duplicate_booking` | A duplicate booking already exists |
| 422 | `invalid_status_transition` | The requested status change is not allowed |

Example:
```json
{
  "error": {
    "code": "time_slot_full",
    "message": "The selected time slot has reached its maximum booking capacity"
  }
}
```

### Rate Limiting Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 429 | `rate_limit_exceeded` | You've exceeded your rate limit |
| 429 | `api_limit_exceeded` | You've exceeded your monthly API usage limit |

Example:
```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Try again in 30 seconds.",
    "retry_after": 30
  }
}
```

## Handling Errors in Your Application

### Best Practices

1. **Check HTTP Status Codes**: Always check the HTTP status code first to determine the general category of the error.

2. **Read Error Messages**: Error messages provide specific details about what went wrong.

3. **Implement Retries**: For certain errors like rate limiting (429), implement an exponential backoff retry strategy.

4. **Log Errors**: Log errors for debugging and monitoring purposes.

5. **Provide Feedback**: Translate API errors into user-friendly messages in your application.

### Error Handling Example (JavaScript)

```javascript
async function createBooking(bookingData) {
  try {
    const response = await fetch('https://api.reservekit.io/v1/bookings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Handle error based on status code
      switch (response.status) {
        case 400:
          console.error('Invalid request:', data.error.message);
          throw new Error(`Validation error: ${data.error.message}`);
        
        case 401:
          console.error('Authentication error:', data.error.message);
          throw new Error('Authentication failed. Please check your API key.');
        
        case 404:
          console.error('Resource not found:', data.error.message);
          throw new Error(`Not found: ${data.error.message}`);
        
        case 429:
          // Handle rate limiting with retries
          const retryAfter = response.headers.get('Retry-After') || 30;
          console.warn(`Rate limited. Retrying in ${retryAfter} seconds...`);
          
          // Wait and retry
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          return createBooking(bookingData);
        
        case 500:
          console.error('Server error:', data.error.message);
          throw new Error('An unexpected error occurred. Please try again later.');
        
        default:
          console.error('Unknown error:', data.error.message);
          throw new Error(`Error: ${data.error.message}`);
      }
    }
    
    return data.data;
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.error('Network error:', error);
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw error;
  }
}
```

## Validation Errors

For requests that fail validation, the error response will often include details about which fields had issues:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "The request contains invalid parameters",
    "details": {
      "customer_email": "must be a valid email address",
      "date": "must be in format YYYY-MM-DD"
    }
  }
}
```

## Debugging Tips

1. **Check Request Parameters**: Ensure all required parameters are included and formatted correctly.

2. **Verify API Key**: Make sure you're using the correct API key and that it's active.

3. **Check Rate Limits**: Be aware of your plan's rate limits and implement appropriate throttling.

4. **Review Logs**: Use the Developer Portal to review API request logs for more details.


## Common Error Scenarios and Solutions

| Error | Possible Solution |
|-------|-------------------|
| Authentication failures | Check that your API key is correct and hasn't been revoked |
| "Time slot full" errors | Check availability before attempting to create a booking |
| Rate limiting | Implement backoff strategies and optimize your API usage |
| "Resource not found" | Verify the IDs you're using in your requests |
| Validation errors | Review the API documentation for correct parameter formats |

## Next Steps

Now that you understand how to handle errors from the ReserveKit API, proceed to the [Rate Limits](/rate-limits) section to learn about API usage limitations and best practices for staying within your plan's limits.
