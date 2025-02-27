---
id: go-sdk
title: Go SDK
sidebar_position: 1
slug: /libraries/go
---

The ReserveKit Go SDK is a client library that provides a simple and efficient way to interact with the ReserveKit API from Go applications. This SDK enables developers to seamlessly integrate scheduling and booking functionality, allowing you to manage services, time slots, and bookings with clean, idiomatic Go code.

## Installation

Install the ReserveKit Go SDK using the `go get` command:

```bash
go get github.com/ReserveKit/reservekit-go
```

This will download and install the SDK in your Go project.

## Getting Started

### Initializing the Client

To start using the SDK, you need to create a client instance with your API key:

```go
package main

import (
    "fmt"
    "github.com/ReserveKit/reservekit-go/pkg/reservekit"
)

func main() {
    // Create a new client with your API key
    client := reservekit.NewClient("your-api-key")
    
    // Now you can use the client to interact with the API
}
```

> **Important:** Keep your API key secure and never expose it in client-side code.

### Working with Services

Before working with time slots or bookings, you need to initialize a service:

```go
// Initialize a service with its ID
err := client.InitService(1)
if err != nil {
    // Handle error
    panic(err)
}

// Now you have access to the service information
service := client.Service()
fmt.Println("Service ID:", service.ID)
fmt.Println("Service Name:", service.Name)
```

## Working with Time Slots

### Retrieving Time Slots

Once you've initialized a service, you can fetch available time slots:

```go
// Get available time slots for the initialized service
slots, err := client.Service().GetTimeSlots()
if err != nil {
    // Handle error
    panic(err)
}

fmt.Printf("Found %d time slots\n", len(slots))

// Iterate through time slots
for _, slot := range slots {
    fmt.Printf("Time Slot ID: %d\n", slot.ID)
    fmt.Printf("Start Time: %s\n", slot.StartTime)
    fmt.Printf("End Time: %s\n", slot.EndTime)
    fmt.Printf("Day of Week: %d\n", slot.DayOfWeek)
    fmt.Printf("Available: %t\n", slot.Available)
    fmt.Println("---")
}
```

## Creating Bookings

You can create a booking for a specific time slot:

```go
// Create a booking request
bookingRequest := &reservekit.BookingRequest{
    CustomerName:  "John Doe",
    CustomerEmail: "john@example.com",
    CustomerPhone: "+1234567890",
    Date:          "2024-01-01",
    TimeSlotID:    1,
}

// Submit the booking request
booking, err := client.Service().CreateBooking(bookingRequest)
if err != nil {
    // Handle error
    panic(err)
}

fmt.Printf("Booking created with ID: %d\n", booking.ID)
fmt.Printf("Status: %s\n", booking.Status)
```

## Error Handling

The SDK uses Go's standard error handling pattern. All methods that make API calls return an error value that should be checked:

```go
slots, err := client.Service().GetTimeSlots()
if err != nil {
    // You can check for specific error types
    if apiErr, ok := err.(*reservekit.APIError); ok {
        fmt.Printf("API Error: %s (Status Code: %d)\n", apiErr.Message, apiErr.StatusCode)
    } else {
        fmt.Printf("Error: %s\n", err.Error())
    }
    return
}
```

## Complete Example

Here's a more complete example showing how to initialize the SDK, fetch time slots, and create a booking:

```go
package main

import (
    "fmt"
    "github.com/ReserveKit/reservekit-go/pkg/reservekit"
    "time"
)

func main() {
    // Create a new client
    client := reservekit.NewClient("your-api-key")
    
    // Initialize a service
    err := client.InitService(1)
    if err != nil {
        fmt.Printf("Failed to initialize service: %s\n", err.Error())
        return
    }
    
    // Get service information
    service := client.Service()
    fmt.Printf("Service: %s\n", service.Name)
    
    // Get available time slots
    slots, err := service.GetTimeSlots()
    if err != nil {
        fmt.Printf("Failed to get time slots: %s\n", err.Error())
        return
    }
    
    fmt.Printf("Found %d time slots\n", len(slots))
    
    if len(slots) > 0 {
        // Create a booking with the first available time slot
        tomorrow := time.Now().AddDate(0, 0, 1).Format("2006-01-02")
        
        bookingRequest := &reservekit.BookingRequest{
            CustomerName:  "John Doe",
            CustomerEmail: "john@example.com",
            CustomerPhone: "+1234567890",
            Date:          tomorrow,
            TimeSlotID:    slots[0].ID,
        }
        
        booking, err := service.CreateBooking(bookingRequest)
        if err != nil {
            fmt.Printf("Failed to create booking: %s\n", err.Error())
            return
        }
        
        fmt.Printf("Booking created: ID=%d, Status=%s\n", booking.ID, booking.Status)
    }
}
```

## API Reference

### Client

```go
func NewClient(apiKey string) *Client
```
Creates a new ReserveKit client with the provided API key.

```go
func (c *Client) InitService(serviceID int) error
```
Initializes a service with the given ID. This method must be called before using service-related methods.

```go
func (c *Client) Service() *Service
```
Returns the currently initialized service. Must be called after a successful `InitService()` call.

### Service

```go
func (s *Service) GetTimeSlots() ([]*TimeSlot, error)
```
Returns available time slots for the initialized service.

```go
func (s *Service) CreateBooking(request *BookingRequest) (*Booking, error)
```
Creates a new booking for the service.

### Data Structures

#### Service
```go
type Service struct {
    ID          int       `json:"id"`
    Name        string    `json:"name"`
    Description string    `json:"description"`
    ProviderID  int       `json:"provider_id"`
    Version     string    `json:"version"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}
```

#### TimeSlot
```go
type TimeSlot struct {
    ID         int    `json:"id"`
    ServiceID  int    `json:"service_id"`
    DayOfWeek  int    `json:"day_of_week"`
    StartTime  string `json:"start_time"`
    EndTime    string `json:"end_time"`
    MaxBookings int    `json:"max_bookings"`
    Available  bool   `json:"available"`
}
```

#### BookingRequest
```go
type BookingRequest struct {
    CustomerName  string `json:"customer_name,omitempty"`
    CustomerEmail string `json:"customer_email,omitempty"`
    CustomerPhone string `json:"customer_phone,omitempty"`
    Date          string `json:"date"`
    TimeSlotID    int    `json:"time_slot_id"`
}
```

#### Booking
```go
type Booking struct {
    ID           int       `json:"id"`
    ServiceID    int       `json:"service_id"`
    TimeSlotID   int       `json:"time_slot_id"`
    CustomerName string    `json:"customer_name"`
    Status       string    `json:"status"`
    CreatedAt    time.Time `json:"created_at"`
    UpdatedAt    time.Time `json:"updated_at"`
}
```

## Best Practices

1. **Error Handling**: Always check error returns from SDK methods.
2. **Concurrency**: The SDK is designed to be safe for concurrent use.
3. **API Key Security**: Keep your API key secure and never commit it to source control.
4. **Request Rate**: Be mindful of API rate limits and implement appropriate backoff strategies if needed.

## Additional Resources

For more detailed information on the API endpoints and available methods, please refer to the [ReserveKit API Documentation](https://docs.reservekit.io/api).

## Support

If you encounter any issues or have questions about the SDK, please open an issue in the [GitHub repository](https://github.com/ReserveKit/reservekit-go).

## License

This SDK is licensed under the MIT License. See the LICENSE file for details.
