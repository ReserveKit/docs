---
id: authentication
title: Authentication
sidebar_position: 2
slug: /authentication
---


The **ReserveKit** API uses API keys to authenticate requests. API keys provide a simple and secure way to access our services while allowing you to manage access controls for your applications. All API requests must be authenticated using your API key.

![ReserveKit API Keys](/img/apikeys-dashboard.png)

## API Key Types

**ReserveKit** offers one type of API keys:

- **Secret Keys**: Begin with `sk_rsv_`. These keys have access to your actual data and can make changes that affect your live services.

## Obtaining an API Key

You can obtain an API key by:

1. Creating an account on the **ReserveKit** platform [here](https://app.reservekit.io/login)
2. Navigating to the [API Keys](https://app.reservekit.io/api-keys) page in your dashboard
3. Generating a new API key

When you create a new API key, you'll need to specify:

- **Domain** (optional): Restrict the API key to specific domains for added security

⚠️ **Important**: API keys are only displayed once at creation time. Make sure to store your key securely as you won't be able to retrieve it later.

## Using Your API Key

To authenticate your API requests, include your API key in the Authorization header:

```http
Authorization: Bearer sk_rsv_your_api_key
```

### Example Request

```bash
curl -X GET "https://api.reservekit.io/v1/services" \
  -H "Authorization: Bearer sk_rsv_your_api_key" \
  -H "Content-Type: application/json"
```

## API Key Security

To keep your API keys secure:

1. **Never expose keys in client-side code**: API keys should be used in server-side code only
2. **Use environment variables**: Store API keys as environment variables rather than hardcoding them
3. **Implement proper access controls**: Restrict who can access and use your API keys
4. **Monitor usage**: Regularly check your [API usage](https://app.reservekit.io/api-logs) for any suspicious activity
5. **Use domain restrictions**: When possible, restrict your API keys to specific domains

## Managing API Keys

### Rotating API Keys

It's a good security practice to periodically rotate your API keys. To rotate a key:

1. Generate a new API key in your dashboard
2. Update your applications to use the new key
3. Revoke the old key once you've confirmed the new key works

### Revoking API Keys

If you believe an API key has been compromised, you should revoke it immediately:

1. Go to the [API Keys](https://app.reservekit.io/api-keys) page in your dashboard
2. Find the API key you want to revoke
3. Select "Revoke"

Once revoked, the API key can no longer be used to make API requests.

## Rate Limiting

API requests are subject to rate limiting based on your plan. When you exceed your rate limit, requests will receive a `429 Too Many Requests` response. The response will include headers that indicate your current rate limit status.

## Troubleshooting Authentication Issues

Common authentication errors:

| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 401 | Authorization header is missing | The request doesn't include an Authorization header |
| 401 | Authorization header is malformed | The Authorization header format is incorrect |
| 401 | API key revoked | The API key has been revoked and is no longer valid |
| 403 | Origin does not match API key domain | The request origin doesn't match the domain restriction |

If you're experiencing authentication issues, check that:
- You're using the correct API key format (including the prefix)
- The API key hasn't been revoked
- Your API key has access to the endpoint you're trying to reach
- You're properly encoding the API key in the Authorization header

## Next Steps

Now that you understand authentication, you're ready to start making API requests. The next section covers creating and managing services, which is the foundation of your scheduling system.
