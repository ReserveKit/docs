---
id: authentication
title: Authentication
---

All requests to the ReserveKit API must include a valid API key. Our API keys
are generated through the dashboard in [API Keys](https://app.reservekit.io/api-keys) page.

## API Keys

We generate the API key using a random string of characters, and hash it when stored in the database. That
said, after generating the API key, you can't see it again. So make sure to keep it safe!

Each API key is associated with an **FQDN (Fully Qualified Domain Name)** of your application. This is to
ensure that the API key is used in the correct environment.

A key can either be created as `test` or `live` key. A test key is used for testing purposes, and
will not be charged. A production key is used for production purposes, and will be charged.

**Note**: A live key has a prefix of `pk_rsv_` and a test key has a prefix of `tk_rsv_`.

- Each user can generate one or more API keys in the dashboard.
- **Send the key in the `Authorization` header** as a Bearer token.

Example:

```bash
curl -X GET "https://api.your-booking-api-website.com/v1/bookings" \
  -H "Authorization: Bearer YOUR_API_KEY"
```
