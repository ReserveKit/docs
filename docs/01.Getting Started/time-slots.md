---
id: time-slots
title: Time Slots
sidebar_position: 4
slug: /getting-started/time-slots
---


Time slots define when your services are available for booking. Each time slot specifies a day of the week, start and end times, and the maximum number of bookings allowed during that period. Properly configured time slots are essential for managing your schedule effectively and preventing overbooking.

![ReserveKit Time Slots](/img/time-slots-form.png)

## Time Slot Object

A time slot object contains the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `id` | integer | Unique identifier for the time slot |
| `service_id` | integer | ID of the service this time slot belongs to |
| `day_of_week` | integer | Day of the week (0-6, where 0 is Sunday) |
| `start_time` | string | Start time in format "YYYY-MM-DD HH:MM:SS" |
| `end_time` | string | End time in format "YYYY-MM-DD HH:MM:SS" |
| `max_bookings` | integer | Maximum number of bookings allowed for this time slot |
| `created_at` | string | Timestamp when the time slot was created |
| `updated_at` | string | Timestamp when the time slot was last updated |

## Creating Time Slots

Time slots are typically created when you create a service. See the [Services](/getting-started/services) documentation for details on creating services with time slots.

However, you can also add time slots to an existing service by updating the service with new time slots.

## Retrieving Time Slots

Get all time slots, optionally filtered by service ID.

### HTTP Request

```http
GET /v1/time-slots
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `service_id` | integer | Yes | ID of the service to get time slots for |
| `page` | integer | Yes | Page number for pagination |
| `page_size` | integer | Yes | Number of results per page |
| `no_pagination` | boolean | No | If true, returns all results without pagination |

### Example Request

```bash
curl -X GET "https://api.reservekit.io/v1/time-slots?service_id=123&page=1&page_size=10" \
  -H "Authorization: Bearer sk_rsv_your_api_key" \
  -H "Content-Type: application/json"
```

### Response

```json
{
  "data": {
    "time_slots": [
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

## Retrieving Time Slots for a Specific Service

Get all time slots for a specific service. This is an alternative to the query parameter approach.

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

## Batch Updating Time Slots

Update multiple time slots at once or create new ones for a service.

### HTTP Request

```http
PATCH /v1/time-slots
```

### Request Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `service_id` | integer | Yes | ID of the service to update time slots for |
| `time_slots` | array | Yes | Array of time slot objects to update or create |

#### Time Slot Object for Updates

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | No | ID of the time slot to update (omit for new time slots) |
| `day_of_week` | integer | Yes | Day of the week (0-6, where 0 is Sunday) |
| `start_time` | string | Yes | Start time in format "YYYY-MM-DD HH:MM:SS" |
| `end_time` | string | Yes | End time in format "YYYY-MM-DD HH:MM:SS" |
| `max_bookings` | integer | Yes | Maximum number of bookings allowed for this time slot |

### Example Request

```bash
curl -X PATCH "https://api.reservekit.io/v1/time-slots" \
  -H "Authorization: Bearer sk_rsv_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "service_id": 123,
    "time_slots": [
      {
        "id": 456,
        "day_of_week": 1,
        "start_time": "2023-01-01 08:00:00",
        "end_time": "2023-01-01 16:00:00",
        "max_bookings": 10
      },
      {
        "day_of_week": 5,
        "start_time": "2023-01-01 09:00:00",
        "end_time": "2023-01-01 14:00:00",
        "max_bookings": 6
      }
    ]
  }'
```

### Response

```json
{
  "data": [
    {
      "id": 456,
      "service_id": 123,
      "day_of_week": 1,
      "start_time": "2023-01-01 08:00:00",
      "end_time": "2023-01-01 16:00:00",
      "max_bookings": 10,
      "created_at": "2023-06-15T14:22:00Z",
      "updated_at": "2023-06-18T10:35:00Z"
    }
  ]
}
```

## Deleting a Time Slot

Delete a specific time slot by its ID.

### HTTP Request

```http
DELETE /v1/time-slots/{timeSlotID}
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `timeSlotID` | integer | Yes | ID of the time slot to delete |

### Example Request

```bash
curl -X DELETE "https://api.reservekit.io/v1/time-slots/456" \
  -H "Authorization: Bearer sk_rsv_your_api_key"
```

### Response

```json
{
  "data": "ok"
}
```

## Deleting Time Slots by Day of Week

Delete all time slots for a service on a specific day of the week (Admin API).

### HTTP Request

```http
DELETE /v1/time-slots
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `service_id` | integer | Yes | ID of the service |
| `day_of_week` | integer | Yes | Day of the week to delete time slots for (0-6) |

### Example Request

```bash
curl -X DELETE "https://api.reservekit.io/v1/time-slots?service_id=123&day_of_week=1" \
  -H "Authorization: Bearer sk_rsv_your_api_key"
```

### Response

```json
{
  "data": "ok"
}
```

## Working with Time Formats

Time slots use a specific format for time values:

1. The `day_of_week` field uses integers from 0 to 6, where:
   - 0 = Monday
   - 1 = Tuesday
   - 2 = Wednesday
   - 3 = Thursday
   - 4 = Friday
   - 5 = Saturday
   - 6 = Sunday

2. The `start_time` and `end_time` fields use the format "YYYY-MM-DD HH:MM:SS". 
   - The date part (YYYY-MM-DD) is typically a placeholder date, as time slots recur weekly.
   - The time part (HH:MM:SS) defines the actual start and end times.

## Best Practices

1. **Regular Scheduling**: Set up time slots for your regular weekly schedule.

2. **Capacity Planning**: Set appropriate `max_bookings` values based on your capacity to handle concurrent appointments.

3. **Buffer Time**: Consider adding buffer time between slots if needed for preparation.

4. **Timezone Consistency**: Ensure the times you define align with the timezone specified for the service.

5. **Complete Coverage**: Make sure to cover all the hours you want to be available for bookings.

## Common Errors

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | Bad Request | The request contains invalid parameters |
| 404 | Not Found | The specified time slot or service could not be found |
| 500 | Internal Server Error | An unexpected error occurred on the server |

## Next Steps

Now that you understand how to manage time slots, proceed to the [Bookings](/getting-started/bookings) section to learn how to create and manage bookings for your services.
