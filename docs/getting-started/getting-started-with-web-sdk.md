---
id: getting-started-with-web-sdk
title: Getting Started with Web SDK
sidebar_position: 1
slug: /getting-started/web
---

This guide walks you through setting up your environment to call ReserveKit API using `reservekitjs`.

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

Install our package with either `npm`, `yarn` or `pnpm`:

```bash
npm install reservekitjs
```

### 3.1 Get the Service

```tsx
// useService.ts

import { useQuery } from '@tanstack/react-query'
import { serviceClient } from '../reservekit-client'
import { IService } from 'reservekitjs'

export const useService = () => {
 return useQuery<IService | undefined>({
  queryKey: ['services', import.meta.env.VITE_RESERVEKIT_SERVICE_ID],
  queryFn: async () => {
   const service = await serviceClient()

   return service as IService
  },
 })
}

```

**Note**: Refer to the [API Reference](/api/#tag/services) for more information on
the response.

### 3.2 Get the time slots

```tsx
// useTimeSlots.ts

import { useQuery } from '@tanstack/react-query'
import { serviceClient } from '../reservekit-client'
import { ITimeSlot } from 'reservekitjs'

export const useTimeSlots = () => {
 return useQuery<ITimeSlot[] | undefined>({
  queryKey: ['timeSlots'],
  queryFn: async () => {
   const service = await serviceClient()
   const timeSlots = await service?.getTimeSlots()
   return timeSlots
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
import { serviceClient } from '../reservekit-client'

import { CreateBookingPayload } from 'reservekitjs'

export const useCreateBooking = () => {
 const queryClient = useQueryClient()

 return useMutation({
  mutationFn: async (bookingData: CreateBookingPayload) => {
   const service = await serviceClient()
   return service?.createBooking(bookingData as CreateBookingPayload)
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

// imports...

const formSchema = z.object({
 customer_name: z.string().optional(),
 customer_email: z.string().optional(),
 customer_phone: z.string().optional(),
 date: z.string().date(),
 time_slot_id: z.string().transform(val => Number(val)),
})

function App() {
 const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
 })

 const [filteredTimeSlots, setFilteredTimeSlots] = useState<
  ITimeSlot[] | null
 >(null)
 const { data: service } = useService()
 const { data: timeSlots } = useTimeSlots()
 const { mutate: createBooking, error } = useCreateBooking()

 const { date } = useWatch({
  control: form.control,
 })

 useEffect(() => {
  if (timeSlots && date) {
   setFilteredTimeSlots(
    timeSlots.filter(
     timeSlot =>
      timeSlot.day_of_week ===
      new Date(date as unknown as Date).getDay() - 1,
    ),
   )
  }
 }, [timeSlots, date])

 const handleSubmit = (values: z.infer<typeof formSchema>) => {
  createBooking(values, {
   onSuccess: () => {
    alert('Appointment scheduled successfully!')
   },
  })
 }

 return (
  <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
   <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
    <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
     {service?.name}
    </h1>
    <p className="text-sm text-gray-600 mb-6 text-center">
     {service?.description}
    </p>

    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
       {...form.register('customer_name')}
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
API with our npm package.

If you have any questions, please refer to the [API Reference](/api/) or
create an issue on [GitHub](https://github.com/qwerqy/reservekit-docs/issues).
