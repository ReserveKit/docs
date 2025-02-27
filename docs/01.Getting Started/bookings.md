---
id: bookings
title: Bookings
sidebar_position: 5
slug: /getting-started/bookings
---

Bookings represent scheduled appointments for your services. They connect customers to specific time slots on particular dates. The Bookings API allows you to create, retrieve, update, and delete bookings, as well as manage customer information associated with each booking.

## Booking Object

A booking object contains the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `id` | integer | Unique identifier for the booking |
| `service_id` | integer | ID of the service being booked |
| `date` | string | Date of the booking in format "YYYY-MM-DD" |
| `time_slot_id` | integer | ID of the time slot being booked |
| `status` | string | Status of the booking: "pending", "confirmed", or "cancelled" |
| `cancel_reason` | string | Reason for cancellation (if status is "cancelled") |
| `message` | string | Additional message or notes for the booking |
| `created_at` | string | Timestamp when the booking was created |
| `updated_at` | string | Timestamp when the booking was last updated |
| `customer` | object | Customer information (name, email, phone) |

## Creating a Booking

Create a new booking for a service at a specific time slot.

### HTTP Request

```http
POST /v1/bookings
```

### Request Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | Yes | Date of the booking in format "YYYY-MM-DD" |
| `time_slot_id` | integer | Yes | ID of the time slot to book |
| `customer_name` | string | No | Name of the customer |
| `customer_email` | string | No | Email of the customer (must be valid email format) |
| `customer_phone` | string | No | Phone number of the customer (in E.164 format) |
| `message` | string | No | Additional message or notes for the booking |

### Example Request

### Example Request

```bash
curl -X GET "https://api.reservekit.io/v1/time-slots?service_id=123&page=1&page_size=10" \
  -H "Authorization: Bearer sk_rsv_your_api_key" \
    "date": "2023-07-10",
    "time_slot_id": 456,
    "customer_name": "Jane Doe",
    "customer_email": "jane.doe@example.com",
    "customer_phone": "+12025550185",
    "message": "First-time client consultation"
  }'
```

### Response

```json
{
  "data": {
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
}
```

### Error Responses

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | "time slot is full" | The time slot has reached its maximum number of bookings |
| 400 | "duplicate booking" | A booking already exists for this customer at this time slot |

## Retrieving Bookings

Get all bookings for a service.

### HTTP Request

```http
GET /v1/bookings
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `service_id` | integer | Yes | ID of the service to get bookings for |
| `page` | integer | Yes | Page number for pagination |
| `page_size` | integer | Yes | Number of results per page |

### Example Request

```bash
curl -X GET "https://api.reservekit.io/v1/bookings?service_id=123&page=1&page_size=10" \
  -H "Authorization: Bearer sk_rsv_your_api_key" \
  -H "Content-Type: application/json"
```

### Response

```json
{
  "data": {
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
      },
      {
        "id": 790,
        "service_id": 123,
        "date": "2023-07-11",
        "time_slot_id": 457,
        "status": "confirmed",
        "message": "Follow-up appointment",
        "created_at": "2023-06-20T10:30:00Z",
        "updated_at": "2023-06-21T08:45:00Z",
        "customer": {
          "id": 322,
          "name": "John Smith",
          "email": "john.smith@example.com",
          "phone": "+12025550186",
          "created_at": "2023-06-20T10:30:00Z",
          "updated_at": "2023-06-20T10:30:00Z"
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_count": 2,
      "page_size": 10
    }
  }
}
```

## Retrieving a Single Booking

Get details of a specific booking by its ID.

### HTTP Request

```http
GET /v1/bookings/{bookingID}
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bookingID` | integer | Yes | ID of the booking to retrieve |

### Example Request

```bash
curl -X GET "https://api.reservekit.io/v1/bookings/789" \
  -H "Authorization: Bearer sk_rsv_your_api_key" \
  -H "Content-Type: application/json"
```

### Response

```json
{
  "data": {
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
}
```

## Updating a Booking

Update an existing booking's details.

### HTTP Request

```http
PATCH /v1/bookings/{bookingID}
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bookingID` | integer | Yes | ID of the booking to update |

### Request Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | No | New date for the booking in format "YYYY-MM-DD" |
| `status` | string | No | New status: "pending", "confirmed", or "cancelled" |
| `cancel_reason` | string | No | Reason for cancellation (required if status is "cancelled") |
| `message` | string | No | Updated message or notes for the booking |

### Example Request

```bash
curl -X PATCH "https://api.reservekit.io/v1/bookings/789" \
  -H "Authorization: Bearer sk_rsv_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed",
    "message": "First-time client consultation - confirmed by phone"
  }'
```

### Response

```json
{
  "data": {
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
}
```

## Cancelling a Booking

To cancel a booking, update its status to "cancelled".

### Example Request

```bash
curl -X PATCH "https://api.reservekit.io/v1/bookings/789" \
  -H "Authorization: Bearer sk_rsv_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "cancelled",
    "cancel_reason": "Customer requested cancellation"
  }'
```

### Response

```json
{
  "data": {
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
}
```

## Deleting a Booking

Delete a booking completely from the system.

### HTTP Request

```http
DELETE /v1/bookings/{bookingID}
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bookingID` | integer | Yes | ID of the booking to delete |

### Example Request

```bash
curl -X DELETE "https://api.reservekit.io/v1/bookings/789" \
  -H "Authorization: Bearer sk_rsv_your_api_key"
```

### Response

```json
{
  "data": "ok"
}
```

## Retrieving Booking Customer Information

Get customer information for a specific booking.

### HTTP Request

```http
GET /v1/bookings/{bookingID}/customer
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bookingID` | integer | Yes | ID of the booking |

### Example Request

```bash
curl -X GET "https://api.reservekit.io/v1/bookings/789/customer" \
  -H "Authorization: Bearer sk_rsv_your_api_key" \
  -H "Content-Type: application/json"
```

### Response

```json
{
  "data": {
    "id": 321,
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "phone": "+12025550185",
    "created_at": "2023-06-20T09:15:00Z",
    "updated_at": "2023-06-20T09:15:00Z"
  }
}
```

## Updating Booking Customer Information

Update customer information for a specific booking.

### HTTP Request

```http
PATCH /v1/bookings/{bookingID}/customer
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bookingID` | integer | Yes | ID of the booking |

### Request Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | Updated name of the customer |
| `email` | string | No | Updated email of the customer (must be valid email format) |
| `phone` | string | No | Updated phone number of the customer (in E.164 format) |

### Example Request

```bash
curl -X PATCH "https://api.reservekit.io/v1/bookings/789/customer" \
  -H "Authorization: Bearer sk_rsv_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@example.com"
  }'
```

### Response

```json
{
  "data": {
    "id": 321,
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "phone": "+12025550185",
    "created_at": "2023-06-20T09:15:00Z",
    "updated_at": "2023-06-24T08:20:00Z"
  }
}
```

## Webhooks for Bookings

Bookings support webhook notifications when events occur. See the [Webhooks](/getting-started/webhooks) section for details on how to set up webhook notifications for booking events.

## Booking Statuses

Bookings can have one of the following statuses:

1. **pending**: The booking has been created but not yet confirmed
2. **confirmed**: The booking has been confirmed and is scheduled
3. **cancelled**: The booking has been cancelled

## Best Practices

1. **Validate Time Slots**: Before creating a booking, check if the time slot has availability using the time slot endpoints.

2. **Collect Customer Information**: While customer information fields are optional, collecting them improves communication and tracking.

3. **Status Management**: Update booking statuses promptly to maintain accurate scheduling.

4. **Cancellation Reasons**: Always provide a cancellation reason when changing a booking status to "cancelled".

5. **Booking Limits**: Be aware of rate limits that may apply to booking creation endpoints.

## Common Errors

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | "time slot is full" | The time slot has reached its maximum number of bookings |
| 400 | "duplicate booking" | A booking already exists for this customer at this time slot |
| 404 | "booking not found" | The specified booking ID does not exist |
| 429 | "rate limit exceeded" | You've exceeded the rate limit for booking creation |

## Next Steps

Now that you understand how to manage bookings, proceed to the [Webhooks](/getting-started/webhooks) section to learn how to set up real-time notifications for booking events.
