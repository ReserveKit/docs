---
id: nodejs-sdk
title: ReserveKit Node.js SDK
sidebar_position: 1
slug: /libraries/nodejs
---

## Table of Contents

1. [Installation](#installation)
2. [Getting Started](#getting-started)
3. [Core Concepts](#core-concepts)
4. [API Reference](#api-reference)
5. [Error Handling](#error-handling)
6. [TypeScript Support](#typescript-support)
7. [Examples](#examples)

## Installation

Install using your preferred package manager:

```bash
# npm
npm install reservekitjs

# yarn
yarn add reservekitjs

# pnpm
pnpm add reservekitjs
```

## Getting Started

### Basic Setup

First, import and initialize the ReserveKit client:

```typescript
import { ReserveKit } from 'reservekitjs'

// Initialize with your API key
const client = new ReserveKit('your_api_key')
```

### Initializing a Service

Before making bookings or checking time slots, initialize a service:

```typescript
// Initialize service with ID
await client.initService(1)

// Access service information
console.log(client.service.name)
console.log(client.service.description)
console.log(client.service.timezone)
```

## Core Concepts

### Services

A service represents a bookable entity in your system. Each service has:
- Unique identifier
- Name and description
- Time slots
- Booking capabilities

### Time Slots

Time slots represent available booking times for a service:

```typescript
// Get all available time slots for the service
const timeSlots = await client.service.getTimeSlots()

// Example time slot data
console.log(timeSlots[0])
/* Output:
{
  id: 1,
  service_id: 1,
  day_of_week: 1,
  start_time: "2024-01-01T09:00:00",
  end_time: "2024-01-01T10:00:00",
  max_bookings: 5
}
*/
```

### Creating Bookings

To create a new booking:

```typescript
const booking = await client.service.createBooking({
  customer_name: "John Doe",
  customer_email: "john@example.com",
  customer_phone: "+1234567890",
  date: "2024-01-01",
  time_slot_id: 1
})
```

## API Reference

### ReserveKit Class

#### Constructor
```typescript
new ReserveKit(secretKey: string, options?: ReserveKitOptions)
```

**Parameters:**
- `secretKey` (required): Your ReserveKit API key
- `options` (optional):
  - `host`: API host (default: 'https://api.reservekit.io')
  - `version`: API version (default: 'v1')

### Service Client

After initialization, access service properties and methods through `client.service`:

#### Properties
- `id`: Service ID
- `name`: Service name
- `description`: Service description
- `provider_id`: Provider ID
- `version`: Service version
- `created_at`: Creation date
- `updated_at`: Last update date

#### Methods

##### `getTimeSlots()`
Returns a Promise that resolves to an array of available time slots.

##### `createBooking(payload)`
Creates a new booking for the service.

```typescript
interface CreateBookingPayload {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  date: string | Date;
  time_slot_id: number;
}
```

## Error Handling

Use try-catch blocks for API calls:

```typescript
try {
  await client.initService(1)
  const timeSlots = await client.service.getTimeSlots()
} catch (error) {
  console.error('API Error:', error.message)
}
```

**Common error scenarios:**
- Invalid API key
- Service not found
- Network errors
- Invalid booking parameters

## TypeScript Support

Full TypeScript support with type definitions:

```typescript
import { ReserveKit, CreateBookingPayload } from 'reservekitjs'

const bookingData: CreateBookingPayload = {
  customer_name: "Jane Doe",
  customer_email: "jane@example.com",
  date: new Date(),
  time_slot_id: 1
}
```

## Examples

### Complete Booking Flow

```typescript
import { ReserveKit } from 'reservekitjs'

async function createServiceBooking() {
  const client = new ReserveKit('your_api_key')
  
  try {
    // Initialize service
    await client.initService(1)
    
    // Get available time slots
    const timeSlots = await client.service.getTimeSlots()
    
    // Create booking with first available slot
    if (timeSlots.length > 0) {
      const booking = await client.service.createBooking({
        customer_name: "Alice Smith",
        customer_email: "alice@example.com",
        customer_phone: "+1234567890",
        date: new Date().toISOString().split('T')[0],
        time_slot_id: timeSlots[0].id
      })
      
      console.log('Booking created:', booking)
    }
  } catch (error) {
    console.error('Booking failed:', error.message)
  }
}
```

### Custom Configuration

```typescript
const client = new ReserveKit('your_api_key', {
  host: 'https://custom-api.example.com',
  version: 'v2'
})
```

## Support

For support or bug reports, please open an issue in the [GitHub repository](https://github.com/qwerqy/reservekitjs). For detailed API documentation, refer to the official ReserveKit API documentation.

---

**Note:** Keep your API key secure and never expose it in client-side code.
