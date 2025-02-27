---
id: express
title: Express
sidebar_position: 2
slug: /explanation/express
---

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Basic knowledge of Express.js

## Project Setup

### 1. Create a New Express Project

```bash
# Create a new directory for your project
mkdir reservekit-express-api
cd reservekit-express-api

# Initialize a new Node.js project
npm init -y

# Install required dependencies
npm install express dotenv cors helmet express-validator reservekitjs
```

### 2. Configure Environment Variables

Create a `.env` file in the root of your project:

```
PORT=3000
RESERVEKIT_API_KEY=your_api_key_here
RESERVEKIT_SERVICE_ID=1

# Email configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-email-password

# SMS configuration (Twilio example)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Webhook secret for signature verification
WEBHOOK_SECRET=your_webhook_secret
```

### 3. Create the Server Entry Point

Create an `index.js` file in the root directory:

```javascript
// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { setupReserveKit } = require('./services/reservekit');
const { createEventEmitter } = require('./services/events');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize global event emitter
const eventEmitter = createEventEmitter();
app.locals.eventEmitter = eventEmitter;

// Initialize ReserveKit
setupReserveKit();

// Routes
app.use('/api/services', require('./routes/services'));
app.use('/api/timeslots', require('./routes/timeslots'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/webhooks', require('./routes/webhooks'));

// Register event handlers
require('./events/email-handlers')(eventEmitter);
require('./events/sms-handlers')(eventEmitter);
require('./events/webhook-handlers')(eventEmitter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: true,
    message: err.message || 'Internal Server Error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## ReserveKit Integration

### 1. Create a ReserveKit Service

Create a `services` directory and add a `reservekit.js` file:

```javascript
// services/reservekit.js
const { ReserveKit } = require('reservekitjs');

let reserveKitClient = null;

async function setupReserveKit() {
  try {
    const apiKey = process.env.RESERVEKIT_API_KEY;
    const serviceId = parseInt(process.env.RESERVEKIT_SERVICE_ID, 10);
    
    if (!apiKey) {
      throw new Error('ReserveKit API key is not configured');
    }
    
    console.log('Initializing ReserveKit client...');
    reserveKitClient = await ReserveKit.create(apiKey, serviceId);
    console.log('ReserveKit client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize ReserveKit client:', error);
    process.exit(1);
  }
}

function getReserveKitClient() {
  if (!reserveKitClient) {
    throw new Error('ReserveKit client is not initialized');
  }
  return reserveKitClient;
}

// Additional helper for direct API calls
async function makeReserveKitRequest(method, endpoint, data = null) {
  const apiKey = process.env.RESERVEKIT_API_KEY;
  const url = `https://api.reservekit.io/v1${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, options);
  const responseData = await response.json();
  
  if (!response.ok) {
    const error = new Error(responseData.message || 'API request failed');
    error.statusCode = response.status;
    error.details = responseData;
    throw error;
  }
  
  return responseData;
}

module.exports = {
  setupReserveKit,
  getReserveKitClient,
  makeReserveKitRequest
};
```

## Setting Up a Custom Event System

Create an event service to handle custom notifications:

```javascript
// services/events.js
const EventEmitter = require('events');

function createEventEmitter() {
  const eventEmitter = new EventEmitter();
  
  // Increase the maximum number of listeners
  eventEmitter.setMaxListeners(20);
  
  return eventEmitter;
}

module.exports = {
  createEventEmitter
};
```

## API Routes with Event Emission

### Create Booking Route with Event Emission

Update the booking creation route to emit events:

```javascript
// routes/bookings.js
const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { getReserveKitClient, makeReserveKitRequest } = require('../services/reservekit');

const router = express.Router();

// Create a booking with event emission
router.post('/', [
  body('customer_name').optional().isString().trim(),
  body('customer_email').optional().isEmail(),
  body('customer_phone').optional().isString(),
  body('date').isString().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be in YYYY-MM-DD format'),
  body('time_slot_id').isInt().withMessage('Time slot ID must be an integer')
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const client = getReserveKitClient();
    const bookingData = {
      customer_name: req.body.customer_name,
      customer_email: req.body.customer_email,
      customer_phone: req.body.customer_phone,
      date: req.body.date,
      time_slot_id: req.body.time_slot_id
    };
    
    const booking = await client.service.createBooking(bookingData);
    
    // Emit events for custom handling
    req.app.locals.eventEmitter.emit('booking:created', booking);
    
    // If customer email is provided, emit email event
    if (booking.customer_email) {
      req.app.locals.eventEmitter.emit('booking:email:confirmation', booking);
    }
    
    // If customer phone is provided, emit SMS event
    if (booking.customer_phone) {
      req.app.locals.eventEmitter.emit('booking:sms:confirmation', booking);
    }
    
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
});

// Cancel booking with event emission
router.post('/:id/cancel', [
  param('id').isInt().withMessage('Booking ID must be an integer')
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const bookingId = req.params.id;
    const result = await makeReserveKitRequest('POST', `/bookings/${bookingId}/cancel`);
    
    // Emit cancellation events
    req.app.locals.eventEmitter.emit('booking:cancelled', { id: bookingId, ...result });
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Additional routes...

module.exports = router;
```

## Custom Notification Handlers

### 1. Create Email Notification Service

```javascript
// services/email.js
const nodemailer = require('nodemailer');

// Create a transporter
function createTransporter() {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
}

// Send a booking confirmation email
async function sendBookingConfirmation(booking) {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: booking.customer_email,
      subject: 'Your Booking Confirmation',
      html: `
        <h1>Booking Confirmation</h1>
        <p>Dear ${booking.customer_name},</p>
        <p>Your booking has been confirmed for ${booking.date}.</p>
        <p>Booking Details:</p>
        <ul>
          <li>Booking ID: ${booking.id}</li>
          <li>Date: ${booking.date}</li>
          <li>Time: ${booking.time || 'As scheduled'}</li>
        </ul>
        <p>Thank you for your booking!</p>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

// Send a booking cancellation email
async function sendBookingCancellation(booking) {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: booking.customer_email,
      subject: 'Your Booking Cancellation',
      html: `
        <h1>Booking Cancellation</h1>
        <p>Dear ${booking.customer_name},</p>
        <p>Your booking (ID: ${booking.id}) has been cancelled.</p>
        <p>If you have any questions, please contact us.</p>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Cancellation email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send cancellation email:', error);
    throw error;
  }
}

module.exports = {
  sendBookingConfirmation,
  sendBookingCancellation
};
```

### 2. Create SMS Notification Service

```javascript
// services/sms.js
const twilio = require('twilio');

// Create Twilio client
function createTwilioClient() {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

// Send booking confirmation SMS
async function sendBookingConfirmationSMS(booking) {
  try {
    const client = createTwilioClient();
    
    const message = await client.messages.create({
      body: `Your booking has been confirmed for ${booking.date}. Booking ID: ${booking.id}. Thank you!`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: booking.customer_phone
    });
    
    console.log('SMS sent with SID:', message.sid);
    return message;
  } catch (error) {
    console.error('Failed to send SMS:', error);
    throw error;
  }
}

// Send booking cancellation SMS
async function sendBookingCancellationSMS(booking) {
  try {
    const client = createTwilioClient();
    
    const message = await client.messages.create({
      body: `Your booking (ID: ${booking.id}) has been cancelled. If you have any questions, please contact us.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: booking.customer_phone
    });
    
    console.log('Cancellation SMS sent with SID:', message.sid);
    return message;
  } catch (error) {
    console.error('Failed to send cancellation SMS:', error);
    throw error;
  }
}

module.exports = {
  sendBookingConfirmationSMS,
  sendBookingCancellationSMS
};
```

### 3. Set Up Webhook Handler Service

```javascript
// services/webhooks.js
const crypto = require('crypto');
const axios = require('axios');

// Verify webhook signature
function verifyWebhookSignature(signature, payload) {
  const hmac = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET);
  const calculatedSignature = hmac.update(JSON.stringify(payload)).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  );
}

// Send webhook to external system
async function sendWebhook(url, event, data) {
  try {
    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data
    };
    
    const signature = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature
      }
    });
    
    console.log(`Webhook sent to ${url}:`, response.status);
    return response.data;
  } catch (error) {
    console.error(`Failed to send webhook to ${url}:`, error);
    throw error;
  }
}

module.exports = {
  verifyWebhookSignature,
  sendWebhook
};
```

### 4. Create Event Handlers

Create an `events` directory to organize your event handlers:

#### Email Event Handlers

```javascript
// events/email-handlers.js
const { sendBookingConfirmation, sendBookingCancellation } = require('../services/email');

module.exports = function(eventEmitter) {
  // Handle booking confirmation emails
  eventEmitter.on('booking:email:confirmation', async (booking) => {
    try {
      await sendBookingConfirmation(booking);
      console.log(`Confirmation email sent to ${booking.customer_email}`);
    } catch (error) {
      console.error('Email handler error:', error);
    }
  });
  
  // Handle booking cancellation emails
  eventEmitter.on('booking:cancelled', async (booking) => {
    // Only send if we have an email
    if (booking.customer_email) {
      try {
        await sendBookingCancellation(booking);
        console.log(`Cancellation email sent to ${booking.customer_email}`);
      } catch (error) {
        console.error('Email cancellation handler error:', error);
      }
    }
  });
};
```

#### SMS Event Handlers

```javascript
// events/sms-handlers.js
const { sendBookingConfirmationSMS, sendBookingCancellationSMS } = require('../services/sms');

module.exports = function(eventEmitter) {
  // Handle booking confirmation SMS
  eventEmitter.on('booking:sms:confirmation', async (booking) => {
    try {
      await sendBookingConfirmationSMS(booking);
      console.log(`Confirmation SMS sent to ${booking.customer_phone}`);
    } catch (error) {
      console.error('SMS handler error:', error);
    }
  });
  
  // Handle booking cancellation SMS
  eventEmitter.on('booking:cancelled', async (booking) => {
    // Only send if we have a phone number
    if (booking.customer_phone) {
      try {
        await sendBookingCancellationSMS(booking);
        console.log(`Cancellation SMS sent to ${booking.customer_phone}`);
      } catch (error) {
        console.error('SMS cancellation handler error:', error);
      }
    }
  });
};
```

#### Webhook Event Handlers

```javascript
// events/webhook-handlers.js
const { sendWebhook } = require('../services/webhooks');

// You would typically store webhook URLs in a database
// This is a simplified example
const WEBHOOK_ENDPOINTS = [
  {
    url: 'https://your-crm-system.com/webhooks/reservekit',
    events: ['booking:created', 'booking:cancelled']
  },
  {
    url: 'https://your-analytics-platform.com/api/events',
    events: ['booking:created', 'booking:cancelled', 'booking:updated']
  }
];

module.exports = function(eventEmitter) {
  // Universal handler for sending webhooks
  ['booking:created', 'booking:cancelled', 'booking:updated'].forEach(eventName => {
    eventEmitter.on(eventName, async (data) => {
      // Find all endpoints interested in this event
      const relevantEndpoints = WEBHOOK_ENDPOINTS.filter(
        endpoint => endpoint.events.includes(eventName)
      );
      
      // Send webhooks in parallel
      const promises = relevantEndpoints.map(endpoint => 
        sendWebhook(endpoint.url, eventName, data)
          .catch(error => console.error(`Failed webhook to ${endpoint.url}:`, error))
      );
      
      try {
        await Promise.allSettled(promises);
        console.log(`Processed ${promises.length} webhooks for ${eventName}`);
      } catch (error) {
        console.error('Webhook processing error:', error);
      }
    });
  });
};
```

## Creating Custom Webhook Routes

```javascript
// routes/webhooks.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { verifyWebhookSignature } = require('../services/webhooks');

const router = express.Router();

// Subscribe to webhooks
router.post('/subscribe', [
  body('url').isURL().withMessage('Valid webhook URL is required'),
  body('events').isArray().withMessage('Events must be an array'),
  body('events.*').isString().withMessage('Each event must be a string')
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    // In a real implementation, you would store this in a database
    console.log('Webhook subscription:', req.body);
    
    // Send a test webhook to verify the endpoint works
    const testEvent = {
      event: 'webhook:test',
      timestamp: new Date().toISOString(),
      data: { message: 'Webhook subscription successful' }
    };
    
    res.status(201).json({
      success: true,
      message: 'Webhook subscription created',
      subscription: {
        id: 'subscription_' + Date.now(),
        url: req.body.url,
        events: req.body.events,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// Receive webhooks from ReserveKit (if they support this)
router.post('/receive', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  
  if (!signature) {
    return res.status(400).json({ error: 'Missing signature header' });
  }
  
  try {
    const payload = JSON.parse(req.body.toString());
    const isValid = verifyWebhookSignature(signature, payload);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // Process the webhook
    console.log('Received webhook:', payload);
    
    // Emit corresponding event
    req.app.locals.eventEmitter.emit(payload.event, payload.data);
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

module.exports = router;
```

## Implementing a Custom Calendar Integration

```javascript
// services/calendar.js
const { google } = require('googleapis');

// Set up Google Calendar client
function createCalendarClient() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  
  auth.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });
  
  return google.calendar({ version: 'v3', auth });
}

// Add booking to Google Calendar
async function addBookingToCalendar(booking) {
  try {
    const calendar = createCalendarClient();
    
    // Convert booking time to RFC3339 timestamps
    const bookingDate = new Date(booking.date);
    const startTime = new Date(bookingDate);
    // Assuming the booking time is stored in format "HH:MM"
    const [hours, minutes] = (booking.time || '09:00').split(':');
    startTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1); // Assuming 1-hour appointments
    
    const event = {
      summary: `Booking: ${booking.customer_name}`,
      description: `Booking ID: ${booking.id}\nPhone: ${booking.customer_phone || 'N/A'}\nEmail: ${booking.customer_email || 'N/A'}`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'America/New_York', // Adjust to your timezone
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'America/New_York', // Adjust to your timezone
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 }, // 30 minutes before
        ],
      },
    };
    
    const result = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      resource: event,
    });
    
    console.log('Event created:', result.data.htmlLink);
    return result.data;
  } catch (error) {
    console.error('Calendar integration error:', error);
    throw error;
  }
}

// Remove booking from Google Calendar
async function removeBookingFromCalendar(eventId) {
  try {
    const calendar = createCalendarClient();
    
    await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId: eventId
    });
    
    console.log('Event deleted:', eventId);
    return true;
  } catch (error) {
    console.error('Calendar deletion error:', error);
    throw error;
  }
}

module.exports = {
  addBookingToCalendar,
  removeBookingFromCalendar
};
```

## Calendar Event Handler

```javascript
// events/calendar-handlers.js
const { addBookingToCalendar, removeBookingFromCalendar } = require('../services/calendar');

module.exports = function(eventEmitter) {
  // Add booking to calendar when created
  eventEmitter.on('booking:created', async (booking) => {
    try {
      const calendarEvent = await addBookingToCalendar(booking);
      
      // Store the calendar event ID with the booking
      // In a real implementation, you would update the booking in your database
      console.log(`Added booking ${booking.id} to calendar as event ${calendarEvent.id}`);
    } catch (error) {
      console.error('Calendar handler error:', error);
    }
  });
  
  // Remove booking from calendar when cancelled
  eventEmitter.on('booking:cancelled', async (booking) => {
    try {
      // In a real implementation, you would retrieve the calendar event ID from your database
      // For this example, we'll assume the calendar event ID is stored in booking.calendar_event_id
      if (booking.calendar_event_id) {
        await removeBookingFromCalendar(booking.calendar_event_id);
        console.log(`Removed booking ${booking.id} from calendar`);
      }
    } catch (error) {
      console.error('Calendar cancellation handler error:', error);
    }
  });
};
```

## Custom Analytics Integration

```javascript
// services/analytics.js
const axios = require('axios');

// Send booking data to analytics service
async function trackBookingEvent(eventType, bookingData) {
  try {
    const analyticsData = {
      event_type: eventType,
      booking_id: bookingData.id,
      service_id: bookingData.service_id,
      timestamp: new Date().toISOString(),
      properties: {
        customer_name: bookingData.customer_name || 'Anonymous',
        date: bookingData.date,
        time_slot_id: bookingData.time_slot_id
      }
    };
    
    // Send to your analytics service
    await axios.post(
      process.env.ANALYTICS_API_URL,
      analyticsData,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.ANALYTICS_API_KEY
        }
      }
    );
    
    console.log(`Analytics event ${eventType} tracked for booking ${bookingData.id}`);
  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Don't throw, just log error to avoid interrupting main flow
  }
}

module.exports = {
  trackBookingEvent
};
```

## Analytics Event Handler

```javascript
// events/analytics-handlers.js
const { trackBookingEvent } = require('../services/analytics');

module.exports = function(eventEmitter) {
  // Track booking created
  eventEmitter.on('booking:created', async (booking) => {
    await trackBookingEvent('booking_created', booking);
  });
  
  // Track booking cancelled
  eventEmitter.on('booking:cancelled', async (booking) => {
    await trackBookingEvent('booking_cancelled', booking);
  });
  
  // Track booking updated
  eventEmitter.on('booking:updated', async (booking) => {
    await trackBookingEvent('booking_updated', booking);
  });
};
```

## Register All Event Handlers

Update your main `index.js` to register all event handlers:

```javascript
// index.js (updated part)

// Register event handlers
require('./events/email-handlers')(eventEmitter);
require('./events/sms-handlers')(eventEmitter);
require('./events/webhook-handlers')(eventEmitter);
require('./events/calendar-handlers')(eventEmitter);
require('./events/analytics-handlers')(eventEmitter);
```

## Custom Notification Template Service

For more flexible notifications, create a template service:

```javascript
// services/templates.js
const fs = require('fs').promises;
const path = require('path');
const Handlebars = require('handlebars');

// Load and compile template
async function getTemplate(templateName) {
  const templatePath = path.join(__dirname, '../templates', `${templateName}.hbs`);
  const templateContent = await fs.readFile(templatePath, 'utf8');
  return Handlebars.compile(templateContent);
}

// Generate HTML from template
async function renderTemplate(templateName, data) {
  try {
    const template = await getTemplate(templateName);
    return template(data);
  } catch (error) {
    console.error(`Template rendering error for ${templateName}:`, error);
    throw error;
  }
}

module.exports = {
  renderTemplate
};
```

Then create template files in a `templates` directory:

```handlebars
<!-- templates/booking-confirmation.hbs -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Booking Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4CAF50; color: white; padding: 10px; text-align: center; }
    .footer { background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; }
    .booking-details { margin: 20px 0; border: 1px solid #ddd; padding: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Booking Confirmation</h1>
    </div>
    
    <p>Dear {{customer_name}},</p>
    
    <p>Your booking has been confirmed. Please find the details below:</p>
    
    <div class="booking-details">
      <p><strong>Booking ID:</strong> {{id}}</p>
      <p><strong>Date:</strong> {{date}}</p>
      <p><strong>Time:</strong> {{time}}</p>
      <p><strong>Service:</strong> {{service_name}}</p>
    </div>
    
    <p>If you need to make any changes to your booking, please contact us.</p>
    
    <p>Thank you for choosing our service!</p>
    
    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
```

And update your email service to use templates:

```javascript
// services/email.js (updated)
const nodemailer = require('nodemailer');
const { renderTemplate } = require('./templates');

// Create a transporter
function createTransporter() {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
}

// Send a booking confirmation email
async function sendBookingConfirmation(booking) {
  try {
    const transporter = createTransporter();
    
    // Get service information
    const { getReserveKitClient } = require('./reservekit');
    const client = getReserveKitClient();
    const serviceName = client.service.name;
    
    // Render email template
    const emailHtml = await renderTemplate('booking-confirmation', {
      ...booking,
      service_name: serviceName,
      time: booking.time || 'As scheduled'
    });
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: booking.customer_email,
      subject: 'Your Booking Confirmation',
      html: emailHtml
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

// Other methods...

module.exports = {
  sendBookingConfirmation,
  sendBookingCancellation
};
```

## Complete Example Project Structure

```
reservekit-express-api/
├── .env
├── index.js
├── package.json
├── events/
│   ├── analytics-handlers.js
│   ├── calendar-handlers.js
│   ├── email-handlers.js
│   ├── sms-handlers.js
│   └── webhook-handlers.js
├── middleware/
│   └── auth.js
├── routes/
│   ├── bookings.js
│   ├── services.js
│   ├── timeslots.js
│   └── webhooks.js
├── services/
│   ├── analytics.js
│   ├── calendar.js
│   ├── email.js
│   ├── events.js
│   ├── reservekit.js
│   ├── sms.js
│   ├── templates.js
│   └── webhooks.js
├── templates/
│   ├── booking-cancellation.hbs
│   └── booking-confirmation.hbs
└── utils/
    └── error-handler.js
```

## Best Practices for Custom Integrations

1. **Module Organization**: Keep your custom integrations organized in separate modules.

2. **Error Handling**: Implement proper error handling for each integration to prevent one failing integration from affecting others.

3. **Event-Driven Architecture**: Use an event-driven approach to decouple core functionality from integrations.

4. **Configuration**: Make integrations configurable through environment variables.

5. **Logging**: Add comprehensive logging for debugging integration issues.

6. **Testing**: Write tests for each integration to ensure they function correctly.

7. **Graceful Degradation**: Design your application to work even if integrations fail.

8. **Rate Limiting & Retries**: Implement rate limiting and retry mechanisms for external API calls.

9. **Abstraction**: Create abstraction layers for each integration to make it easier to switch providers.

10. **Documentation**: Document how to configure and use each integration.

By following this guide, you'll have a robust Express.js application that integrates with ReserveKit and provides extensive customization options for notifications, webhooks, calendar integration, and analytics.
