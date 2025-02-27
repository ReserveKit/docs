---
id: webhooks
title: Webhooks
sidebar_position: 6
slug: /webhooks
---

Webhooks allow your applications to receive real-time notifications when events occur in the ReserveKit system. Instead of continuously polling the API for updates, webhooks push data to your specified endpoints whenever relevant events happen, such as when bookings are created, updated, or cancelled.

![ReserveKit Webhooks](/img/webhooks-dashboard.png)

## Managing Webhooks

Webhooks are managed exclusively through the ReserveKit Developer Portal. You cannot create, list, or delete webhooks directly via API calls.

To set up webhooks for your services:

1. Log in to the [ReserveKit Dashboard](https://app.reservekit.io)
2. Navigate to the [Webhooks](https://app.reservekit.io/webhooks) page
3. Click "Create a Webhook"
4. Enter your webhook URL and select the event types you want to subscribe to
5. Save your webhook configuration

The dashboard allows you to:

- Create new webhook subscriptions
- View existing webhook configurations
- Test webhooks by sending sample payloads
- View webhook delivery logs
- Edit or delete webhook endpoints

## Webhook Object

A webhook configuration in the Developer Portal includes the following information:

| Property | Description |
|----------|-------------|
| URL | The endpoint where webhook events will be sent |
| Service | The specific service this webhook is associated with |
| Events | The types of events that will trigger this webhook |
| Status | Whether the webhook is active or disabled |

## Event Types

ReserveKit supports the following webhook event types:

| Event Type | Description |
|------------|-------------|
| `bookings.create` | Triggered when a new booking is created |
| `bookings.update` | Triggered when a booking is updated |
| `bookings.delete` | Triggered when a booking is deleted |

## Webhook Payload Format

When an event occurs, ReserveKit sends a POST request to your webhook URL with a JSON payload.

### Booking Create Event Payload

```json
{
  "event_type": "bookings.create",
  "bookings": [
    {
      "id": 789,
      "service_id": 123,
      "date": "2023-07-10",
      "time_slot_id": 456,
      "status": "pending",
      "message": "First-time client consultation",
      "created_at": "2023-06-20T09:15:00Z",
      "updated_at": "2023-06-20T09:15:00Z",
      "customer": {
        "id": 321,
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "phone": "+12025550185",
        "created_at": "2023-06-20T09:15:00Z",
        "updated_at": "2023-06-20T09:15:00Z"
      }
    }
  ],
  "timestamp": "2023-06-20T09:15:00Z"
}
```

### Booking Update Event Payload

```json
{
  "event_type": "bookings.update",
  "bookings": [
    {
      "id": 789,
      "service_id": 123,
      "date": "2023-07-10",
      "time_slot_id": 456,
      "status": "confirmed",
      "message": "First-time client consultation - confirmed by phone",
      "created_at": "2023-06-20T09:15:00Z",
      "updated_at": "2023-06-22T14:30:00Z",
      "customer": {
        "id": 321,
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "phone": "+12025550185",
        "created_at": "2023-06-20T09:15:00Z",
        "updated_at": "2023-06-20T09:15:00Z"
      }
    }
  ],
  "timestamp": "2023-06-22T14:30:00Z"
}
```

### Booking Delete Event Payload

```json
{
  "event_type": "bookings.delete",
  "bookings": [
    {
      "id": 789,
      "service_id": 123,
      "date": "2023-07-10",
      "time_slot_id": 456,
      "status": "cancelled",
      "cancel_reason": "Customer requested cancellation",
      "message": "First-time client consultation - confirmed by phone",
      "created_at": "2023-06-20T09:15:00Z",
      "updated_at": "2023-06-23T11:45:00Z",
      "customer": {
        "id": 321,
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "phone": "+12025550185",
        "created_at": "2023-06-20T09:15:00Z",
        "updated_at": "2023-06-20T09:15:00Z"
      }
    }
  ],
  "timestamp": "2023-06-23T11:45:00Z"
}
```

## Handling Webhook Events

When your endpoint receives a webhook:

1. **Verify the request**: Ensure it's coming from ReserveKit by checking headers or using signature verification.
2. **Respond quickly**: Your endpoint should return a 2xx status code as quickly as possible (ideally within 5 seconds).
3. **Process asynchronously**: Handle any time-consuming operations after responding to the webhook.
4. **Implement idempotency**: Design your webhook handler to be idempotent, as webhooks may occasionally be delivered more than once.

### Example Webhook Handler (Node.js)

```javascript
const express = require('express');
const app = express();
app.use(express.json());

app.post('/webhooks/reservekit', (req, res) => {
  // Respond immediately to acknowledge receipt
  res.status(200).send('Webhook received');
  
  // Process the webhook payload asynchronously
  const { event_type, bookings } = req.body;
  
  switch(event_type) {
    case 'bookings.create':
      processNewBooking(bookings[0]);
      break;
    case 'bookings.update':
      processBookingUpdate(bookings[0]);
      break;
    case 'bookings.delete':
      processBookingDeletion(bookings[0]);
      break;
    default:
      console.log('Unknown event type:', event_type);
  }
});

function processNewBooking(booking) {
  // Handle new booking
  console.log('New booking created:', booking.id);
  // Add to your system, send notifications, etc.
}

function processBookingUpdate(booking) {
  // Handle booking update
  console.log('Booking updated:', booking.id, 'Status:', booking.status);
  // Update in your system, send notifications, etc.
}

function processBookingDeletion(booking) {
  // Handle booking deletion
  console.log('Booking deleted/cancelled:', booking.id);
  // Remove from your system, free up resources, etc.
}

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

## Webhook Security

To secure your webhook endpoints:

1. **HTTPS**: Always use HTTPS for your webhook URLs.
2. **Request Validation**: Validate incoming requests to ensure they come from ReserveKit.
3. **Implement Timeouts**: Set appropriate timeouts for webhook processing.
4. **Error Handling**: Implement robust error handling in your webhook processor.

## Webhook Reliability

ReserveKit's webhook system is designed for reliability, but occasionally delivery issues can occur. To ensure you don't miss important events:

1. **Implement Retry Logic**: Be prepared to handle retries of the same webhook event.
2. **Set Up Monitoring**: Monitor your webhook endpoint's availability and response times.
3. **Fallback Mechanism**: Implement a fallback mechanism (like periodic API polling) for critical operations.
4. **View Delivery Logs**: Check the webhook delivery logs in the Developer Portal for failed deliveries.

## Best Practices

1. **Response Time**: Keep webhook processing time short to prevent timeouts.

2. **Logging**: Log all webhook events for debugging and auditing purposes.

3. **Event Filtering**: Only subscribe to events you need to process to reduce unnecessary traffic.

4. **Webhook URL Security**: Use obscure, hard-to-guess URLs for your webhook endpoints to enhance security.

5. **Testing**: Use the Developer Portal's test functionality to send sample payloads to your endpoint during development.

## Troubleshooting Webhooks

If you're not receiving webhook events as expected:

1. Check the webhook delivery logs in the Developer Portal
2. Verify your endpoint is publicly accessible
3. Ensure your endpoint returns a 2xx status code promptly
4. Check for any firewall or security settings that might block incoming requests
5. Test your endpoint using the Developer Portal's test functionality

## Next Steps

Now that you understand how webhooks work in ReserveKit, proceed to the [Error Handling](/error-handling) section to learn about handling API errors or the [Rate Limits](/rate-limits) section to understand usage limitations.
