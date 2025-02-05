---
id: webhooks
title: Webhooks
sidebar_position: 2
slug: /webhooks
---

You can subscribe to webhooks to get notified when certain events happen.

## Setup

You can setup webhooks in the dashboard in the [Webhooks](https://app.reservekit.io/webhooks) page. Set your webhook URL and select the events you want to subscribe to.

## Available Webhooks

### Booking Created

When a booking is created, we will send a **POST** request to the webhook URL you provided.

> **Note:** Make sure to whitelist `https://api.reservekit.io` in your server to ensure the webhook is received.

```json
{
    "created_at": "string",
    "customer": {
      "email": "string",
      "id": 0,
      "name": "string",
      "phone": "string",
    },
    "date": "string",
    "id": 0,
    "service_id": 0,
    "time_slot": {
      "day_of_week": 0,
      "end_time": "string",
      "max_bookings": 0,
      "start_time": "string",
    },
    "time_slot_id": 0,
    "updated_at": "string",
    "version": 0
}
```

Refer to the [Booking Object](/api/#tag/Bookings/paths/~1bookings/post) for more information.

If you have any issues or suggestions, contact us through our Helpdesk chat through the dashboard.