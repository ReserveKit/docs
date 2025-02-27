---
id: nodejs-sdk
title: Node.js SDK
sidebar_position: 1
slug: /libraries/nodejs
---

The ReserveKit JavaScript SDK provides a simple and intuitive interface for interacting with the ReserveKit API. This library makes it easy to integrate scheduling and booking functionality into your JavaScript and TypeScript applications, allowing you to manage services, time slots, and bookings with minimal code.

## Installation

You can install the ReserveKit JavaScript SDK using your preferred package manager:

```bash
# Using npm
npm install reservekitjs

# Using yarn
yarn add reservekitjs

# Using pnpm
pnpm add reservekitjs
```

## Getting Started

### Initializing the SDK

The recommended way to initialize the SDK is using the static factory method:

```javascript
import { ReserveKit } from 'reservekitjs';

// Initialize the client with your API key and service ID
const client = await ReserveKit.create('your_api_key', 1);

// Now you can access the service information
console.log(client.service.name);
console.log(client.service.description);
```

### Alternative Initialization

You can also use the constructor directly, but you'll need to call `initService()` separately:

```javascript
import { ReserveKit } from 'reservekitjs';

// Create client instance with API key
const client = new ReserveKit('your_api_key');

// Initialize service separately
await client.initService(1);
```

> **Important:** Do not expose your API key in client-side code. The API key should only be used in server-side environments.

### Configuration Options

When initializing the SDK, you can provide optional configuration:

```javascript
const options = {
  host: 'https://api.reservekit.io', // Custom API host if needed
  version: 'v1'                      // API version
};

const client = await ReserveKit.create('your_api_key', 1, options);
```

## Working with Services

Once you've initialized the SDK with a service ID, you can access the service properties:

```javascript
// Access service properties
const service = client.service;

console.log(service.id);          // Service ID
console.log(service.name);        // Service name
console.log(service.description); // Service description
console.log(service.provider_id); // Provider ID
console.log(service.version);     // Service version
console.log(service.created_at);  // Creation date
console.log(service.updated_at);  // Last update date
```

## Managing Time Slots

### Retrieving Time Slots

You can fetch all available time slots for a service:

```javascript
// Get available time slots
const timeSlots = await client.service.getTimeSlots();

// Example of working with time slots
timeSlots.forEach(slot => {
  console.log(`Time Slot ID: ${slot.id}`);
  console.log(`Day of Week: ${slot.day_of_week}`);
  console.log(`Start Time: ${slot.start_time}`);
  console.log(`End Time: ${slot.end_time}`);
  console.log(`Max Bookings: ${slot.max_bookings}`);
});
```

## Creating Bookings

### Creating a New Booking

You can create a new booking for a service using the `createBooking` method:

```javascript
// Create a booking
const booking = await client.service.createBooking({
  customer_name: 'John Doe',
  customer_email: 'john@example.com',
  customer_phone: '+1234567890',
  date: '2024-01-01',        // Can be a string in YYYY-MM-DD format
  time_slot_id: 1            // ID of the time slot
});

console.log(`Booking created with ID: ${booking.id}`);
```

### Booking Payload Structure

The booking creation method accepts the following parameters:

```typescript
interface CreateBookingPayload {
  customer_name?: string;    // Optional customer name
  customer_email?: string;   // Optional customer email
  customer_phone?: string;   // Optional customer phone
  date: string | Date;       // Required booking date (string or Date object)
  time_slot_id: number;      // Required time slot ID
}
```

## Error Handling

The SDK uses a consistent error handling pattern. It's recommended to wrap API calls in try-catch blocks:

```javascript
try {
  const client = await ReserveKit.create('your_api_key', 1);
  const timeSlots = await client.service.getTimeSlots();
  console.log('Available time slots:', timeSlots);
} catch (error) {
  console.error('Error:', error.message);
  // Handle the error appropriately
}
```

## TypeScript Support

This SDK is written in TypeScript and includes comprehensive type definitions. When using TypeScript in your project, you'll get full type support for all SDK methods and responses.

```typescript
import { ReserveKit, TimeSlot, Booking } from 'reservekitjs';

// TypeScript will provide intellisense and type checking
const client = await ReserveKit.create('your_api_key', 1);

// TimeSlot type is inferred
const timeSlots: TimeSlot[] = await client.service.getTimeSlots();

// Booking type is inferred
const booking: Booking = await client.service.createBooking({
  customer_name: 'John Doe',
  date: '2024-01-01',
  time_slot_id: 1
});
```

## Complete Example

Here's a complete example showing how to initialize the SDK, fetch time slots, and create a booking:

```javascript
import { ReserveKit } from 'reservekitjs';

async function main() {
  try {
    // Initialize the SDK
    const client = await ReserveKit.create('your_api_key', 1);
    
    console.log(`Service: ${client.service.name}`);
    
    // Get available time slots
    const timeSlots = await client.service.getTimeSlots();
    console.log(`Found ${timeSlots.length} available time slots`);
    
    if (timeSlots.length > 0) {
      // Create a booking with the first available time slot
      const booking = await client.service.createBooking({
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_phone: '+1234567890',
        date: '2024-01-01',
        time_slot_id: timeSlots[0].id
      });
      
      console.log('Booking created:', booking);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

## Best Practices

1. **Server-Side Usage**: Keep your API key secure by only using it in server-side environments.
2. **Error Handling**: Always implement proper error handling around SDK calls.
3. **Validation**: Validate user inputs before passing them to the SDK methods.
4. **Rate Limiting**: Be mindful of API rate limits and implement appropriate throttling if necessary.

## API Reference

### ReserveKit Class

#### Static Factory Method

```typescript
static create(secretKey: string, serviceId: number, options?: ReserveKitOptions): Promise<ReserveKit>
```

Parameters:
- `secretKey` (required): Your ReserveKit API key
- `serviceId` (required): The ID of the service to initialize
- `options` (optional): Configuration options
  - `host`: API host (default: 'https://api.reservekit.io')
  - `version`: API version (default: 'v1')

Returns: A Promise that resolves to an initialized ReserveKit instance.

#### Constructor

```typescript
new ReserveKit(secretKey: string, options?: ReserveKitOptions)
```

#### Methods

```typescript
initService(serviceId: number): Promise<void>
```
Initializes a service by its ID. Returns a Promise that resolves when the service is loaded.

### Service Client

#### Properties

- `id`: Service ID
- `name`: Service name
- `description`: Service description
- `provider_id`: Provider ID
- `version`: Service version
- `created_at`: Creation date
- `updated_at`: Last update date

#### Methods

```typescript
getTimeSlots(): Promise<TimeSlot[]>
```
Returns a Promise that resolves to an array of available time slots for the service.

```typescript
createBooking(payload: CreateBookingPayload): Promise<Booking>
```
Creates a new booking for the service.

## Support

For support, please open an issue in the [GitHub repository](https://github.com/ReserveKit/reservekitjs).

## License

This SDK is licensed under the MIT License.
