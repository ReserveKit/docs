---
id: introduction
title: Introduction
sidebar_position: 1
slug: /
---


Welcome to the **ReserveKit** API documentation! This guide provides all the information you need to integrate our scheduling system into your applications. **ReserveKit** API offers the building blocks for your scheduling system, allowing you to create, manage, and customize bookings and services with ease.

![ReserveKit Service Dashboard](/img/service-dashboard.png)

### What is **ReserveKit**?

**ReserveKit** is a powerful scheduling API that enables developers to build robust booking and appointment systems. Whether you're developing a salon booking platform, a healthcare appointment system, or any application that requires time slot management, **ReserveKit** provides the essential infrastructure to handle your scheduling needs.

### Key Features

- **Service Management**: Create and customize services with specific availability schedules.
- **Time Slot Management**: Define time slots with precise control over days, hours, and booking capacity.
- **Booking System**: Create, manage, and track bookings with customer information.
- **Webhook Integration**: Receive real-time notifications when bookings are created or updated.
- **Timezone Support**: Handle scheduling across different time zones seamlessly.

### API Access

All endpoints in this documentation require API key authentication. To use the **ReserveKit** API, you'll need to include your API key in the authorization header of your requests:

```
Authorization: Bearer YOUR_API_KEY
```

API keys follow this format:

- Secret keys start with `sk_rsv_`

### API Key Security

**Important**: Never expose your secret API keys on the client side. Secret keys (`sk_rsv_`) should only be used in server-side code where they cannot be accessed by users. Exposing your secret keys in browser-based JavaScript or mobile applications puts your account at risk of unauthorized access.

Best practices for API key security:

- Keep secret keys on your server and make API requests from there
- Use environment variables to store your keys rather than hardcoding them
- Implement proper authentication in your application to manage user access
- Consider using a backend proxy to make API calls on behalf of your client application

If you believe your API key has been exposed, visit [API Keys](https://app.reservekit.io/api-keys) to regenerate or revoke it.

### Getting Started

To begin using the **ReserveKit** API, you'll need to:

1. **Obtain an API Key**: Create an API key in the [API Keys](https://app.reservekit.io/api-keys) page.
2. **Explore the API**: Browse through this documentation to understand the available endpoints.
3. **Make Your First Request**: Use the examples provided to make your first API call.

### Base URL

All API requests should be made to:

```
https://api.reservekit.io/v1
```

### What's Next?

In the following sections, we'll explore:

- **[Authentication](/authentication)**: Detailed information about API key management
- **Services**: How to create and manage services
- **Time Slots**: Managing availability through time slots
- **Bookings**: Creating and managing bookings
- **Webhooks**: Setting up notifications for booking events
- **Error Handling**: Understanding API responses and error codes
- **Rate Limits**: Information on usage limitations and best practices

Let's begin building your scheduling system with Slottie API!

