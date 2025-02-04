---
id: next-js
title: Next.js
sidebar_position: 2
slug: /explanation/next-js
---

We will show you how to use ReserveKit in a Next.js application.
Refer to the [example repo](https://github.com/qwerqy/reservekit-demo-nextjs) for the full example.

```tsx
// app/page.tsx
// Create a fetcher function to get the service info
const getService = async (serviceId: number) => {
 const res = await fetch(`${process.env.API_URL}/services/${serviceId}`, {
  headers: {
   Authorization: `Bearer ${process.env.API_KEY}`,
  },
 })
 const data = await res.json()
 return data
}

// Create a fetcher function to get the timeslots for the service
const getTimeslots = async (serviceId: number) => {
 const res = await fetch(
  `${process.env.API_URL}/time-slots?service_id=${serviceId}`,
  {
   headers: {
    Authorization: `Bearer ${process.env.API_KEY}`,
   },
  },
 )
 const data = await res.json()
 return data
}

export default async function Home() {
 const { data, error } = await getService(1)
 if (error) {
  console.error(error)
 }

 const { data: timeslots, error: timeslotsError } = await getTimeslots(1)
 if (timeslotsError) {
  console.error(timeslotsError)
 }
 const { time_slots } = timeslots
 
 return <Booking service={data} timeslots={time_slots} />
}
```

```tsx
// app/actions.ts

'use server'

export async function createBooking(bookingDetails: any) {
 const res = await fetch(`${process.env.API_URL}/bookings?service_id=1`, {
  method: 'POST',
  body: JSON.stringify(bookingDetails),
  headers: {
   Authorization: `Bearer ${process.env.API_KEY}`,
   'Content-Type': 'application/json',
  },
 })
 const data = await res.json()
 return data
}
```
