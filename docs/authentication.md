---
id: authentication
title: Authentication
sidebar_position: 3
slug: /authentication
---

All requests to the ReserveKit API must include a valid API key. Our API keys
are generated through the dashboard in [API Keys](https://app.reservekit.io/api-keys) page.

## API Keys

Each API key is associated with an **FQDN (Fully Qualified Domain Name)** of your application. This is to
ensure that the API key is used in the correct environment.

- Each user can generate one or more API keys in the dashboard.
- **Send the key in the `Authorization` header** as a Bearer token.

Example:

```bash
curl -X GET "https://api.your-booking-api-website.com/v1/bookings" \
  -H "Authorization: Bearer YOUR_API_KEY"
```
