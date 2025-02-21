---
id: go-sdk
title: ReserveKit Go SDK
sidebar_position: 1
slug: /libraries/go
---

Here's a quick start documentation for the ReserveKit Go SDK:

## Introduction

ReserveKit Go SDK provides a simple and intuitive way to integrate booking functionality into your Go applications. This guide will help you get started with the basic features.

## Installation

Install the SDK using Go modules:

```bash
go get github.com/ReserveKit/reservekit-go
```

## Basic Usage

### Creating a Client

First, create a new ReserveKit client with your API key:

```go
import "github.com/ReserveKit/reservekit-go/pkg/reservekit"

client := reservekit.NewClient("your-api-key")
```

### Initialize a Service

Before making any bookings, initialize a service using its ID:

```go
err := client.InitService(1)
if err != nil {
    log.Fatal(err)
}
```

### Get Available Time Slots

Retrieve available time slots for the service:

```go
slots, err := client.Service().GetTimeSlots()
if err != nil {
    log.Fatal(err)
}

fmt.Printf("Found %d available time slots\n", len(slots))
```

### Create a Booking

Create a new booking for a specific time slot:

```go
booking, err := client.Service().CreateBooking(&reservekit.BookingRequest{
    CustomerName:  "John Doe",
    CustomerEmail: "john@example.com",
    CustomerPhone: "+1234567890",
    Date:          time.Now().AddDate(0, 0, 1), // Tomorrow
    TimeSlotID:    slots[0].ID,
})
if err != nil {
    log.Fatal(err)
}

fmt.Printf("Booking created successfully! ID: %d\n", booking.ID)
```

## Complete Example

Here's a complete example showing how to use the main features of the SDK:

```go
package main

import (
    "fmt"
    "log"
    "time"
    "github.com/ReserveKit/reservekit-go/pkg/reservekit"
)

func main() {
    // Initialize client
    client := reservekit.NewClient("your-api-key")

    // Initialize service
    if err := client.InitService(1); err != nil {
        log.Fatal("Failed to initialize service:", err)
    }

    // Get available time slots
    slots, err := client.Service().GetTimeSlots()
    if err != nil {
        log.Fatal("Failed to get time slots:", err)
    }

    if len(slots) == 0 {
        log.Fatal("No time slots available")
    }

    // Create a booking
    booking, err := client.Service().CreateBooking(&reservekit.BookingRequest{
        CustomerName:  "John Doe",
        CustomerEmail: "john@example.com",
        CustomerPhone: "+1234567890",
        Date:          time.Now().AddDate(0, 0, 1),
        TimeSlotID:    slots[0].ID,
    })
    if err != nil {
        log.Fatal("Failed to create booking:", err)
    }

    fmt.Printf("Booking created successfully! ID: %d, Status: %s\n", 
        booking.ID, booking.Status)
}
```

## Error Handling

The SDK uses custom error types for better error handling. You can check for specific API errors:

```go
if err := client.InitService(999); err != nil {
    if apiErr, ok := err.(*reservekit.APIError); ok {
        fmt.Printf("API Error: %s (Status: %d, Code: %s)\n",
            apiErr.Message, apiErr.Status, apiErr.Code)
    }
}
```

## Configuration Options

You can customize the client with additional options:

```go
client := reservekit.NewClient(
    "your-api-key",
    reservekit.WithHost("https://api.staging.reservekit.io"),
    reservekit.WithVersion("v2"),
)
```

## Next Steps

- View example implementations in our [Examples Repository](https://github.com/ReserveKit/examples)