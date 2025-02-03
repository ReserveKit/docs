---
id: getting-started-with-rest
title: Getting Started with REST
sidebar_position: 2
slug: /getting-started/rest
---

This guide walks you through setting up your environment to call ReserveKit API.

> This guide is sort of outdated, I will work on a new implementation soon. It is best practice to connect to the API in your backend. 
> If you want to connect to the API, please connect using
> [REST](/api).

## 1. Sign Up for an Account

1. Go to [ReserveKit](https://app.reservekit.io) and create an account.
2. Go to [API Keys](https://app.reservekit.io/api-keys) and create an API key.
3. If you are going to test locally, I suggest creating a `test` API key.
4. Ensure you have **saved your API key** in a secure place. We will need it
   later.

> **Note**: Test API keys are prefixed with `tk_rsv_`

## 2. Create a Service

1. Go to the dashboard and click on the + button on the sidebar next to the
   **Services** section.
2. Fill in the form and click **Create**.
3. You will be redirected to the service page.
4. Pay attention to the **Service ID**. We will need it later.

## 3. Start calling the API

I will use `@tanstack/react-query` in this example, but you can use any other
library you want.

I am using two environment variables for this example:

- `VITE_RESERVEKIT_API_KEY`: Your API key.
- `VITE_RESERVEKIT_SERVICE_ID`: The ID of the service you created.

### 3.0 Create an Axios instance (Optional)

```ts
// axiosIntance.ts

import axios from 'axios'

const axiosInstance = axios.create({
 // @ts-ignore
 baseURL: import.meta.env.VITE_API_URL,
})

export const useAxiosWithToken = () => {
 axiosInstance.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${
   // @ts-ignore
   import.meta.env.VITE_RESERVEKIT_API_KEY
  }`

  return config
 })

 return axiosInstance
}

export default axiosInstance
```

### 3.1 Get the Service

```tsx
// useService.ts

import { useQuery } from '@tanstack/react-query'
import { useAxiosWithToken } from '../axiosInstance'

interface Service {
 data: {
  id: string
  name: string
  description: string
 }
}

export const useService = () => {
 const axios = useAxiosWithToken()

 return useQuery<Service>({
  // @ts-ignore
  queryKey: ['services', import.meta.env.VITE_RESERVEKIT_SERVICE_ID],
  queryFn: async () => {
   const { data } = await axios.get(
    // @ts-ignore
    `/v1/services/${import.meta.env.VITE_RESERVEKIT_SERVICE_ID}`,
   )
   return data
  },
  staleTime: 1000 * 60 * 15, // 15 minutes
 })
}
```

**Note**: Refer to the [API Reference](/api/#tag/services) for more information on
the response.

### 3.2 Get the time slots

```tsx
// useTimeSlots.ts

import { useQuery } from '@tanstack/react-query'
import { useAxiosWithToken } from '../axiosInstance'

export interface TimeSlot {
 data: {
  time_slots: {
   id: string
   start_time: string
   end_time: string
   max_bookings: boolean
   day_of_week: number
  }[]
 }
}

export const useTimeSlots = () => {
 const axios = useAxiosWithToken()

 return useQuery<TimeSlot>({
  queryKey: ['timeSlots'],
  queryFn: async () => {
   const { data } = await axios.get(
    `/v1/time-slots?service_id=${
     // @ts-ignore
     import.meta.env.VITE_RESERVEKIT_SERVICE_ID
    }`,
   )
   return data
  },
  staleTime: 1000 * 60 * 15, // 15 minutes
 })
}
```

**Note**: Refer to the [API Reference](/api/#tag/time-slots) for more information on
the response.

### 3.3 Create a Booking

```tsx
// useCreateBooking.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAxiosWithToken } from '../axiosInstance'
import { Appointment } from '../App'

interface CreateBookingData extends Appointment {}

export const useCreateBooking = () => {
 const axios = useAxiosWithToken()
 const queryClient = useQueryClient()

 return useMutation({
  mutationFn: async (bookingData: CreateBookingData) => {
   const { data } = await axios.post(
    `/v1/bookings?service_id=${
     // @ts-ignore
     import.meta.env.VITE_RESERVEKIT_SERVICE_ID
    }`,
    bookingData,
   )
   return data
  },
  onSuccess: () => {
   // Invalidate the bookings query to refetch the updated list
   queryClient.invalidateQueries({ queryKey: ['bookings'] })
  },
 })
}
```

**Note**: Refer to the [API Reference](/api/#tag/bookings) for more information on
the response.

## 4. Connect your UI

From this point forward, you can use the hooks to fetch the data and create a
booking.

```tsx
// App.tsx

function App() {
 const [appointment, setAppointment] = useState<Appointment>({
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  date: '',
  time_slot_id: null,
 })

// For the sake of simplicity, 
// I will use useState to filter the time slots based on the date.
 const [filteredTimeSlots, setFilteredTimeSlots] = useState<
  TimeSlot['data']['time_slots'] | null
 >(null)
 const { data: service } = useService()
 const { data: timeSlots } = useTimeSlots()
 const { mutate: createBooking, error } = useCreateBooking()

 useEffect(() => {
  if (timeSlots?.data?.time_slots && appointment.date) {
   console.log(
    timeSlots.data.time_slots.filter(timeSlot => {
     return (
      timeSlot.day_of_week === new Date(appointment.date).getDay() - 1
     )
    }),
   )
   setFilteredTimeSlots(
    timeSlots.data.time_slots.filter(
     timeSlot =>
      timeSlot.day_of_week === new Date(appointment.date).getDay() - 1,
    ),
   )
  }
 }, [timeSlots, appointment.date])

 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  appointment.time_slot_id = Number(appointment.time_slot_id)
  createBooking(appointment, {
   onSuccess: () => {
    alert('Appointment scheduled successfully!')
   },
  })
 }

 const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
 ) => {
  const { name, value } = e.target
  setAppointment(prev => ({
   ...prev,
   [name]: value,
  }))
 }

 return (
  <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
   <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
    <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
     {service?.data.name}
    </h1>
    <p className="text-sm text-gray-600 mb-6 text-center">
     {service?.data.description}
    </p>
    <form onSubmit={handleSubmit} className="space-y-6">
     <div>
      <label
       htmlFor="customer_name"
       className="block text-sm font-medium text-gray-700"
      >
       Full Name
      </label>
      <input
       type="text"
       id="customer_name"
       name="customer_name"
       value={appointment.customer_name}
       onChange={handleChange}
       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
     </div>

     {/* Rest of the code... */}

     {error && (
      <p className="text-red-500">
       {/* @ts-ignore */}
       {error.message}: {error.response?.data?.error}
      </p>
     )}
     <button
      type="submit"
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
     >
      Schedule Appointment
     </button>
    </form>
   </div>
  </div>
 )
}

export default App
```

## 5. Conclusion

This guide walks you through setting up your environment to call ReserveKit
API.

If you have any questions, please refer to the [API Reference](/api/) or
create an issue on [GitHub](https://github.com/qwerqy/reservekit-docs/issues).
