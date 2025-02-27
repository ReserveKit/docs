---
id: services
title: Services
sidebar_position: 3
slug: /services
---


Services are the foundation of your scheduling system in **ReserveKit**. A service represents an offering that customers can book, such as a haircut, consultation, or any appointment-based activity. Each service defines its availability through time slots, which specify when bookings can be made.

![ReserveKit Services](/img/service-dashboard.png)

## Service Object

A service object contains the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `id` | integer | Unique identifier for the service |
| `name` | string | Name of the service |
| `description` | string | Description of what the service offers |
| `timezone` | string | Timezone in which the service operates (e.g., "America/New_York") |
| `created_at` | string | Timestamp when the service was created |
| `updated_at` | string | Timestamp when the service was last updated |

## Creating a Service

Create a new service with optional time slots.

### HTTP Request

```http
POST /v1/services
```

### Request Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Name of the service |
| `description` | string | No | Description of what the service offers |
| `timezone` | string | Yes | Timezone in which the service operates (e.g., "America/New_York") |
| `time_slots` | array | No | Array of time slot objects to create with the service |

#### Time Slot Object

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `day_of_week` | integer | Yes | Day of the week (0-6, where 0 is Sunday) |
| `start_time` | string | Yes | Start time in format "YYYY-MM-DD HH:MM:SS" |
| `end_time` | string | Yes | End time in format "YYYY-MM-DD HH:MM:SS" |
| `max_bookings` | integer | Yes | Maximum number of bookings allowed for this time slot |

### Example Request

```bash
curl -X POST "https://api.reservekit.io/v1/services" \
  -H "Authorization: Bearer sk_rsv_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Consultation",
    "description": "30-minute initial consultation",
    "timezone": "America/New_York",
    "time_slots": [
      {
        "day_of_week": 1,
        "start_time": "2023-01-01 09:00:00",
        "end_time": "2023-01-01 17:00:00",
        "max_bookings": 8
      },
      {
        "day_of_week": 3,
        "start_time": "2023-01-01 10:00:00",
        "end_time": "2023-01-01 15:00:00",
        "max_bookings": 5
      }
    ]
  }'
```

### Response

```json
{
  "data": {
    "id": 123,
    "name": "Consultation",
    "description": "30-minute initial consultation",
    "timezone": "America/New_York",
    "created_at": "2023-06-15T14:22:00Z",
    "updated_at": "2023-06-15T14:22:00Z"
  }
}
```

## Retrieving Services

Fetch all services associated with your API key.

### HTTP Request

```http
GET /v1/services
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number for pagination |
| `page_size` | integer | No | Number of results per page |

### Example Request

```bash
curl -X GET "https://api.reservekit.io/v1/services?page=1&page_size=10" \
  -H "Authorization: Bearer sk_rsv_your_api_key" \
  -H "Content-Type: application/json"
```

### Response

```json
{
  "data": {
    "services": [
      {
        "id": 123,
        "name": "Consultation",
        "description": "30-minute initial consultation",
        "timezone": "America/New_York",
        "created_at": "2023-06-15T14:22:00Z",
        "updated_at": "2023-06-15T14:22:00Z"
      },
      {
        "id": 124,
        "name": "Follow-up",
        "description": "15-minute follow-up session",
        "timezone": "America/New_York",
        "created_at": "2023-06-16T10:15:00Z",
        "updated_at": "2023-06-16T10:15:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_count": 25,
      "page_size": 10
    }
  }
}
```

## Retrieving a Single Service

Fetch a specific service by its ID.

### HTTP Request

```http
GET /v1/services/{serviceID}
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `serviceID` | integer | Yes | ID of the service to retrieve |

### Example Request

```bash
curl -X GET "https://api.reservekit.io/v1/services/123" \
  -H "Authorization: Bearer sk_rsv_your_api_key" \
  -H "Content-Type: application/json"
```

### Response

```json
{
  "data": {
    "id": 123,
    "name": "Consultation",
    "description": "30-minute initial consultation",
    "timezone": "America/New_York",
    "created_at": "2023-06-15T14:22:00Z",
    "updated_at": "2023-06-15T14:22:00Z"
  }
}
```

## Updating a Service

Update an existing service's details.

### HTTP Request

```http
PATCH /v1/services/{serviceID}
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `serviceID` | integer | Yes | ID of the service to update |

### Request Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | Updated name of the service |
| `description` | string | No | Updated description of what the service offers |
| `timezone` | string | No | Updated timezone in which the service operates |

### Example Request

```bash
curl -X PATCH "https://api.reservekit.io/v1/services/123" \
  -H "Authorization: Bearer sk_rsv_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Consultation",
    "description": "45-minute comprehensive consultation"
  }'
```

### Response

```json
{
  "data": {
    "id": 123,
    "name": "Premium Consultation",
    "description": "45-minute comprehensive consultation",
    "timezone": "America/New_York",
    "created_at": "2023-06-15T14:22:00Z",
    "updated_at": "2023-06-17T09:30:00Z"
  }
}
```

## Deleting a Service

Delete a service and all its associated time slots and bookings.

### HTTP Request

```http
DELETE /v1/services/{serviceID}
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `serviceID` | integer | Yes | ID of the service to delete |

### Example Request

```bash
curl -X DELETE "https://api.reservekit.io/v1/services/123" \
  -H "Authorization: Bearer sk_rsv_your_api_key"
```

### Response

```json
{
  "data": "ok"
}
```

## Retrieving Time Slots for a Service

Get all time slots associated with a specific service.

### HTTP Request

```http
GET /v1/services/{serviceID}/time-slots
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `serviceID` | integer | Yes | ID of the service |

### Example Request

```bash
curl -X GET "https://api.reservekit.io/v1/services/123/time-slots" \
  -H "Authorization: Bearer sk_rsv_your_api_key" \
  -H "Content-Type: application/json"
```

### Response

```json
{
  "data": [
    {
      "id": 456,
      "service_id": 123,
      "day_of_week": 1,
      "start_time": "2023-01-01 09:00:00",
      "end_time": "2023-01-01 17:00:00",
      "max_bookings": 8,
      "created_at": "2023-06-15T14:22:00Z",
      "updated_at": "2023-06-15T14:22:00Z"
    },
    {
      "id": 457,
      "service_id": 123,
      "day_of_week": 3,
      "start_time": "2023-01-01 10:00:00",
      "end_time": "2023-01-01 15:00:00",
      "max_bookings": 5,
      "created_at": "2023-06-15T14:22:00Z",
      "updated_at": "2023-06-15T14:22:00Z"
    }
  ]
}
```

## Best Practices

1. **Timezone Setting**: Choose the appropriate timezone for your service based on where it's physically located.

2. **Service Organization**: Create services based on distinct offerings rather than combining multiple services into one.

3. **Service Description**: Provide clear descriptions to help customers understand what the service entails.

4. **Service Naming**: Use consistent naming conventions across your services for better organization.

## Common Errors

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | Bad Request | The request body contains invalid parameters |
| 404 | Not Found | The specified service could not be found |
| 422 | Unprocessable Entity | The service cannot be created with the provided parameters |

## Next Steps

Now that you've learned how to manage services, you can proceed to the [Time Slots](/time-slots) section to understand how to control availability in more detail, or the [Bookings](/bookings) section to learn how customers can book your services.
