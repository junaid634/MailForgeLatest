# Email Service API

A robust email service API built with Node.js, TypeScript, and Express that provides email sending, receiving, templating, scheduling, and campaign management capabilities.

## Features

- 📧 Email sending and receiving
- 📝 Email templates with variables
- ⏰ Email scheduling
- 📊 Email analytics
- 📈 Campaign management
- 🔒 Authentication & Authorization
- ⚡ Rate limiting
- 📝 Comprehensive logging

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- SMTP Server credentials
- IMAP Server credentials

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=3000
JWT_SECRET=your-secret-key-here

# MongoDB
MONGODB_URI=mongodb://localhost:27017/email-service

# SMTP Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password

# IMAP Configuration
IMAP_HOST=imap.example.com
IMAP_PORT=993
IMAP_USER=your-email@example.com
IMAP_PASS=your-password
```

## Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start

# Start development server
npm run dev
```

## API Documentation

### Authentication

All API endpoints (except registration and login) require authentication using JWT token.

Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### User Management

##### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response: {
  "success": true,
  "token": "jwt-token"
}
```

##### Login
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response: {
  "success": true,
  "token": "jwt-token"
}
```

##### Update Email Configuration
```http
PUT /api/users/email-config
Content-Type: application/json

{
  "smtp": {
    "host": "smtp.example.com",
    "port": 587,
    "secure": true,
    "user": "user@example.com",
    "pass": "password"
  },
  "imap": {
    "host": "imap.example.com",
    "port": 993,
    "user": "user@example.com",
    "pass": "password",
    "tls": true
  }
}

Response: {
  "success": true,
  "emailConfig": {
    "smtp": {...},
    "imap": {...}
  }
}
```

#### Email Operations

##### Send Email
```http
POST /api/emails/send
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Hello",
  "text": "Plain text content",
  "html": "<p>HTML content</p>"
}

Response: {
  "success": true,
  "messageId": "unique-message-id"
}
```

##### Get Emails
```http
GET /api/emails?folder=INBOX&limit=10

Response: {
  "success": true,
  "emails": [
    {
      "id": "email-id",
      "subject": "Email Subject",
      "from": "sender@example.com",
      "date": "2023-12-20T10:00:00Z",
      "text": "Email content",
      "html": "<p>HTML content</p>"
    }
  ]
}
```

##### Mark Email as Read
```http
PATCH /api/emails/:id/read?folder=INBOX

Response: {
  "success": true
}
```

#### Email Templates

##### Create Template
```http
POST /api/templates
Content-Type: application/json

{
  "name": "welcome",
  "content": "Welcome {{name}}!",
  "subject": "Welcome to our service"
}

Response: {
  "success": true,
  "template": {
    "name": "welcome",
    "content": "Welcome {{name}}!"
  }
}
```

#### Email Scheduling

##### Schedule Email
```http
POST /api/schedule
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Scheduled Email",
  "text": "Content",
  "sendAt": "2023-12-25T10:00:00Z",
  "recurring": {
    "frequency": "weekly",
    "endDate": "2024-01-25T10:00:00Z"
  }
}

Response: {
  "success": true,
  "scheduleId": "schedule-id"
}
```

#### Campaigns

##### Create Campaign
```http
POST /api/campaigns
Content-Type: application/json

{
  "name": "Newsletter Campaign",
  "subject": "Monthly Newsletter",
  "content": "Newsletter content",
  "recipients": ["user1@example.com", "user2@example.com"]
}

Response: {
  "success": true,
  "campaignId": "campaign-id"
}
```

##### Start Campaign
```http
POST /api/campaigns/:id/start

Response: {
  "success": true,
  "status": "running"
}
```

#### Analytics

##### Get Email Statistics
```http
GET /api/analytics/email/:id

Response: {
  "success": true,
  "stats": {
    "sent": 100,
    "delivered": 98,
    "opened": 75,
    "clicked": 25,
    "bounced": 2
  }
}
```

## Error Handling

All endpoints return error responses in the following format:
```json
{
  "success": false,
  "error": "Error message"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Testing

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e

# Generate test coverage
npm run test:coverage
```

## License

MIT