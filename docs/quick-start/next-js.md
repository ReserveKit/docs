---
id: next-js
title: Next.js
sidebar_position: 1
slug: /quick-start/next-js
---

This guide will help you quickly integrate the ReserveKit JavaScript SDK (`reservekitjs`) with your Next.js 15 application. We'll cover setting up the SDK, fetching service information, displaying time slots, creating bookings, and implementing additional API endpoints that aren't covered by the library.

## Installation

First, install the ReserveKit JavaScript SDK in your Next.js project:

```bash
npm install reservekitjs
# or
yarn add reservekitjs
# or
pnpm add reservekitjs
```

## Environment Setup

Create a `.env.local` file in the root of your project to store your ReserveKit API key:

```
RESERVEKIT_API_KEY=your_api_key_here
NEXT_PUBLIC_RESERVEKIT_SERVICE_ID=1
```

> **Important:** Never expose your API key in client-side code. We'll handle this securely using Next.js server components.

## Server-Side API Configuration

Create a utility file for your ReserveKit client:

```typescript
// lib/reservekit.ts
import { ReserveKit } from 'reservekitjs';

let reserveKitClient: ReserveKit | null = null;

export async function getReserveKitClient() {
  const apiKey = process.env.RESERVEKIT_API_KEY;
  const serviceId = parseInt(process.env.NEXT_PUBLIC_RESERVEKIT_SERVICE_ID || '1', 10);
  
  if (!apiKey) {
    throw new Error('ReserveKit API key is not configured');
  }
  
  if (!reserveKitClient) {
    reserveKitClient = await ReserveKit.create(apiKey, serviceId);
  }
  
  return reserveKitClient;
}
```

## Creating Server Actions

Next.js 15 uses React Server Components and Server Actions, which are ideal for working with the ReserveKit SDK:

```typescript
// app/actions/reservekit-actions.ts
'use server'

import { getReserveKitClient } from '@/lib/reservekit';

export async function getServiceInfo() {
  const client = await getReserveKitClient();
  return {
    id: client.service.id,
    name: client.service.name,
    description: client.service.description,
  };
}

export async function getTimeSlots() {
  const client = await getReserveKitClient();
  return client.service.getTimeSlots();
}

export async function createBooking(formData: FormData) {
  const customerName = formData.get('customerName') as string;
  const customerEmail = formData.get('customerEmail') as string;
  const customerPhone = formData.get('customerPhone') as string;
  const date = formData.get('date') as string;
  const timeSlotId = parseInt(formData.get('timeSlotId') as string, 10);

  const client = await getReserveKitClient();
  
  try {
    const booking = await client.service.createBooking({
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      date,
      time_slot_id: timeSlotId
    });
    
    return { success: true, booking };
  } catch (error) {
    console.error('Booking creation failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
```

## Implementing Additional API Endpoints

For endpoints not covered by the SDK, implement direct API calls:

```typescript
// app/actions/extended-api.ts
'use server'

const API_BASE = 'https://api.reservekit.io/v1';
const API_KEY = process.env.RESERVEKIT_API_KEY;

export async function getBookings(serviceId: number) {
  const response = await fetch(`${API_BASE}/services/${serviceId}/bookings`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch bookings: ${response.statusText}`);
  }
  
  return response.json();
}

export async function updateBooking(bookingId: number, data: any) {
  const response = await fetch(`${API_BASE}/bookings/${bookingId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update booking: ${response.statusText}`);
  }
  
  return response.json();
}

export async function cancelBooking(bookingId: number) {
  const response = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to cancel booking: ${response.statusText}`);
  }
  
  return response.json();
}
```

> **Note:** We will soon support more endpoints in the SDKs, so you can use the SDK for all your API needs. Keep an eye out for updates!

## Creating Page Components

### Home Page with Service Information

```tsx
// app/page.tsx
import { getServiceInfo } from '@/app/actions/reservekit-actions';
import Link from 'next/link';

export default async function Home() {
  const service = await getServiceInfo();
  
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">Welcome to {service.name}</h1>
      <p className="mb-6">{service.description}</p>
      <Link 
        href="/book" 
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Book Now
      </Link>
    </main>
  );
}
```

### Booking Page

```tsx
// app/book/page.tsx
import { getTimeSlots } from '@/app/actions/reservekit-actions';
import BookingForm from '@/components/BookingForm';

export default async function BookingPage() {
  const timeSlots = await getTimeSlots();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Book Your Appointment</h1>
      <BookingForm timeSlots={timeSlots} />
    </div>
  );
}
```

### Booking Form Component

```tsx
// components/BookingForm.tsx
'use client'

import { useState } from 'react';
import { createBooking } from '@/app/actions/reservekit-actions';
import { useRouter } from 'next/navigation';

export default function BookingForm({ timeSlots }) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const filteredTimeSlots = selectedDate 
    ? timeSlots.filter(slot => slot.available)
    : [];
  
  async function handleSubmit(formData) {
    setLoading(true);
    setError('');
    try {
      const result = await createBooking(formData);
      if (result.success) {
        router.push(`/booking-confirmation?id=${result.booking.id}`);
      } else {
        setError(result.error || 'Failed to create booking');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <form action={handleSubmit} className="max-w-md mx-auto">
      <div className="mb-4">
        <label htmlFor="customerName" className="block mb-2">Full Name</label>
        <input 
          type="text" 
          id="customerName" 
          name="customerName" 
          required 
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="customerEmail" className="block mb-2">Email</label>
        <input 
          type="email" 
          id="customerEmail" 
          name="customerEmail" 
          required 
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="customerPhone" className="block mb-2">Phone</label>
        <input 
          type="tel" 
          id="customerPhone" 
          name="customerPhone" 
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="date" className="block mb-2">Date</label>
        <input 
          type="date" 
          id="date" 
          name="date" 
          required 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-2 border rounded" 
        />
      </div>
      
      {selectedDate && (
        <div className="mb-4">
          <label htmlFor="timeSlotId" className="block mb-2">Time Slot</label>
          <select 
            id="timeSlotId" 
            name="timeSlotId" 
            required 
            className="w-full p-2 border rounded"
          >
            <option value="">Select a time slot</option>
            {filteredTimeSlots.map(slot => (
              <option key={slot.id} value={slot.id}>
                {slot.start_time} - {slot.end_time}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
      >
        {loading ? 'Processing...' : 'Book Appointment'}
      </button>
    </form>
  );
}
```

### Booking Confirmation Page

```tsx
// app/booking-confirmation/page.tsx
import { getReserveKitClient } from '@/lib/reservekit';
import { cancelBooking } from '@/app/actions/extended-api';
import CancelBookingButton from '@/components/CancelBookingButton';

export default async function BookingConfirmationPage({ searchParams }) {
  const bookingId = searchParams.id;
  
  // This would use a custom fetch since the SDK doesn't support getting booking by ID
  // For demo purposes, we're showing placeholder content
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Booking Confirmed!</h1>
        <p className="mb-4">Your booking (ID: {bookingId}) has been confirmed.</p>
        
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h2 className="text-lg font-semibold mb-2">Booking Details</h2>
          {/* Details would be fetched from an actual booking */}
          <p className="mb-1"><strong>Date:</strong> [Booking Date]</p>
          <p className="mb-1"><strong>Time:</strong> [Booking Time]</p>
          <p className="mb-1"><strong>Service:</strong> [Service Name]</p>
        </div>
        
        <div className="mt-6">
          <CancelBookingButton bookingId={Number(bookingId)} />
        </div>
      </div>
    </div>
  );
}
```

### Cancel Booking Component

```tsx
// components/CancelBookingButton.tsx
'use client'

import { useState } from 'react';
import { cancelBooking } from '@/app/actions/extended-api';
import { useRouter } from 'next/navigation';

export default function CancelBookingButton({ bookingId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
  async function handleCancel() {
    if (confirm('Are you sure you want to cancel this booking?')) {
      setIsLoading(true);
      try {
        await cancelBooking(bookingId);
        alert('Booking cancelled successfully');
        router.push('/');
      } catch (err) {
        setError('Failed to cancel booking');
      } finally {
        setIsLoading(false);
      }
    }
  }
  
  return (
    <>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <button
        onClick={handleCancel}
        disabled={isLoading}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-red-300"
      >
        {isLoading ? 'Cancelling...' : 'Cancel Booking'}
      </button>
    </>
  );
}
```

## Admin Dashboard Example

For admin functionality (which would require additional API endpoints):

```tsx
// app/admin/bookings/page.tsx
import { getBookings } from '@/app/actions/extended-api';

export default async function AdminBookingsPage() {
  const serviceId = parseInt(process.env.NEXT_PUBLIC_RESERVEKIT_SERVICE_ID || '1', 10);
  const bookingsData = await getBookings(serviceId);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Manage Bookings</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">ID</th>
              <th className="py-2 px-4 text-left">Customer</th>
              <th className="py-2 px-4 text-left">Date</th>
              <th className="py-2 px-4 text-left">Time</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookingsData.bookings.map(booking => (
              <tr key={booking.id} className="border-t">
                <td className="py-2 px-4">{booking.id}</td>
                <td className="py-2 px-4">{booking.customer_name}</td>
                <td className="py-2 px-4">{booking.date}</td>
                <td className="py-2 px-4">{booking.time}</td>
                <td className="py-2 px-4">{booking.status}</td>
                <td className="py-2 px-4">
                  <a href={`/admin/bookings/${booking.id}`} className="text-blue-600 hover:underline">
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## Best Practices for Next.js 15 & ReserveKit

1. **Server Components & Actions:** Use Server Components and Server Actions for API operations to keep your API key secure.

2. **Route Handlers:** For more complex API operations, implement route handlers in the `/app/api` directory.

3. **Client Components:** Use the `'use client'` directive only for components that need interactivity, keeping most components as server components.

4. **Error Handling:** Implement proper error handling and loading states for all API calls.

5. **Environment Variables:** Store sensitive information in environment variables and access them only in server-side code.

6. **Caching & Revalidation:** Utilize Next.js data caching and revalidation features for optimal performance:

```typescript
// Example of using revalidation with ReserveKit
export async function getTimeSlots() {
  const client = await getReserveKitClient();
  const timeSlots = await client.service.getTimeSlots();
  
  // Cache for 5 minutes
  revalidatePath('/book', 'page');
  return timeSlots;
}
```

7. **Progressive Enhancement:** Build forms with native HTML capabilities first, then enhance with JavaScript for a better user experience.

8. **TypeScript:** Use TypeScript for better type safety and developer experience.

This quick start guide provides a foundation for integrating ReserveKit with Next.js 15. You can extend it based on your specific needs and requirements.
