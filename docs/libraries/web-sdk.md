---
id: web-sdk
title: ReserveKit Web SDK
sidebar_position: 1
slug: /libraries/web
---

A JavaScript/TypeScript library for interacting with the ReserveKit API. This SDK provides a simple interface for managing services, time slots, and bookings.

[Github repository](https://github.com/qwerqy/reservekitjs)

## Installation

Install the package using npm:

```bash
npm install reservekitjs
```

Or using yarn:

```bash
yarn add reservekitjs
```

Or using pnpm:

```bash
pnpm add reservekitjs
```

## Quick Start

```js
import { ReserveKit } from 'reservekitjs'
// Initialize the client with your API key
const reserveKitClient = new ReserveKit('your_api_key')
// Initialize a service
await reserveKitClient.initService(1)
// Access service properties
console.log(reserveKitClient.service.name)
console.log(reserveKitClient.service.description)
// Get available time slots
const timeSlots = await reserveKitClient.service.getTimeSlots()
// Create a booking
const booking = await reserveKitClient.service.createBooking({
  customer_name: 'John Doe',
  customer_email: 'john@example.com',
  customer_phone: '+1234567890',
  date: '2024-01-01',
  time_slot_id: 1
})
```

## API Reference

### ReserveKit Class

#### Constructor

```typescript
new ReserveKit(publicApiKey: string, options?: ReserveKitOptions)
```

Parameters:

- `publicApiKey` (required): Your ReserveKit API key
- `options` (optional): Configuration options
  - `host`: API host (default: "[https://api.reservekit.io](https://api.reservekit.io)")
  - `version`: API version (default: 'v1')

#### Methods

##### `initService(serviceId: number)`

Initializes a service by its ID. Returns a Promise that resolves when the service is loaded.

### Service Client

Once a service is initialized, you can access its properties and methods through `reserveKitClient.service`:

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

Returns a Promise that resolves to an array of available time slots for the service.

##### `createBooking(payload)`

Creates a new booking for the service.

Parameters:

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

The SDK uses a consistent error handling pattern. All methods that make API requests can throw errors. It's recommended to wrap calls in try-catch blocks:

```js
try {
  await reserveKitClient.initService(1)
} catch (error) {
  console.error('Failed to initialize service:', error.message)
}
```

## TypeScript Support

This SDK is written in TypeScript and includes type definitions. You'll get full type support when using TypeScript in your project.

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For support, please open an issue in the GitHub repository.
