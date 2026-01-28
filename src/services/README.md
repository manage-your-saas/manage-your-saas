# Dodo Payments Backend Service

A production-ready backend service for integrating with the Dodo Payments API, featuring secure authentication, revenue aggregation, and comprehensive error handling.

## 🚀 Features

- **Secure API Authentication** using Bearer tokens
- **Revenue Aggregation** by total, product, and currency
- **Rate Limiting** and request throttling
- **Automatic Retries** with exponential backoff
- **Production-ready** error handling and logging
- **Environment-based** configuration (test/live)

## 📋 Requirements

- Node.js 16.0.0 or higher
- npm or yarn package manager

## 🛠️ Installation

```bash
cd src/services
npm install
```

## ⚙️ Configuration

Create a `.env` file based on `.env.example`:

```bash
# Environment
NODE_ENV=development

# Dodo Payments API Configuration
DODO_PAYMENTS_TEST_API=https://test.dodopayments.com
DODO_PAYMENTS_LIVE_API=https://live.dodopayments.com

# Service Configuration
PORT=3001
DODO_PAYMENTS_TIMEOUT=30000
DODO_PAYMENTS_MAX_RETRIES=3
DODO_PAYMENTS_RETRY_DELAY=1000

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

## 🏃‍♂️ Running the Service

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Revenue Aggregation
```
POST /api/revenue
Content-Type: application/json

{
  "apiKey": "your_dodo_payments_api_key_here"
}
```

### Account Information
```
POST /api/account
Content-Type: application/json

{
  "apiKey": "your_dodo_payments_api_key_here"
}
```

## 📊 Example API Requests

### Revenue Aggregation Request
```bash
curl -X POST http://localhost:3001/api/revenue \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "Q4JzDDZpCu2LT84J.Pu2OivrlaeDv-Mk-q45gLXISy0343M2GJmFT-1cvxbZimugC"
  }'
```

### Account Information Request
```bash
curl -X POST http://localhost:3001/api/account \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "Q4JzDDZpCu2LT84J.Pu2OivrlaeDv-Mk-q45gLXISy0343M2GJmFT-1cvxbZimugC"
  }'
```

## 📄 Example JSON Output

### Revenue Aggregation Response
```json
{
  "success": true,
  "data": {
    "totalRevenue": {
      "USD": 15420.50,
      "EUR": 2340.75,
      "GBP": 1250.00,
      "JPY": 850000,
      "CAD": 3200.00,
      "AUD": 2100.50
    },
    "revenueByProduct": {
      "prod_123": {
        "productId": "prod_123",
        "productName": "Pro Monthly Plan",
        "revenue": {
          "USD": 8500.00,
          "EUR": 1200.00,
          "GBP": 650.00,
          "JPY": 450000,
          "CAD": 1800.00,
          "AUD": 1200.00
        },
        "payments": 245
      },
      "prod_456": {
        "productId": "prod_456",
        "productName": "Team Annual Plan",
        "revenue": {
          "USD": 6920.50,
          "EUR": 1140.75,
          "GBP": 600.00,
          "JPY": 400000,
          "CAD": 1400.00,
          "AUD": 900.50
        },
        "payments": 89
      }
    },
    "revenueByCurrency": {
      "USD": 15420.50,
      "EUR": 2340.75,
      "GBP": 1250.00,
      "JPY": 850000,
      "CAD": 3200.00,
      "AUD": 2100.50
    },
    "successfulPayments": 334,
    "failedPayments": 12,
    "totalPayments": 346,
    "paymentsByStatus": {
      "succeeded": 334,
      "failed": 12,
      "pending": 0
    },
    "paymentsByProduct": {
      "prod_123": 245,
      "prod_456": 89
    },
    "summary": {
      "totalRevenueUSD": 15420.50,
      "averagePaymentAmount": 46.19,
      "successRate": 96.53,
      "topProduct": {
        "productId": "prod_123",
        "productName": "Pro Monthly Plan",
        "revenueUSD": 8500.00
      },
      "topCurrency": {
        "currency": "USD",
        "amount": 15420.50,
        "amountUSD": 15420.50
      }
    }
  },
  "metadata": {
    "processingTime": 2847,
    "productsCount": 2,
    "paymentsCount": 346,
    "timestamp": "2024-01-28T12:30:45.123Z"
  }
}
```

### Account Information Response
```json
{
  "success": true,
  "data": {
    "id": "acc_123456789",
    "name": "Acme Corporation",
    "email": "billing@acme.com",
    "country": "US",
    "currency": "USD",
    "created_at": "2023-01-15T10:30:00Z",
    "status": "active",
    "balance": 2547.89,
    "metadata": {
      "business_type": "corporation",
      "industry": "software"
    }
  }
}
```

## 🔒 Security Features

- **API Key Authentication**: Bearer token-based authentication
- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: Validates all incoming requests
- **Error Sanitization**: Prevents sensitive information leakage
- **HTTPS Ready**: Designed for HTTPS deployment

## 🛡️ Error Handling

The service handles various error scenarios:

- **401 Unauthorized**: Invalid API key
- **429 Rate Limited**: Too many requests
- **500 Internal**: Server errors
- **Network Errors**: Connection issues with Dodo Payments API

### Error Response Format
```json
{
  "error": "Invalid API key",
  "code": "INVALID_API_KEY"
}
```

## 📝 Logging

The service provides comprehensive logging:
- Request/response logging
- Error tracking
- Performance metrics
- Retry attempts

## 🔄 Retry Logic

- **Automatic Retries**: Up to 3 attempts for failed requests
- **Exponential Backoff**: Increasing delays between retries
- **Circuit Breaker**: Stops retrying on client errors (4xx)

## 🚦 Rate Limiting

- **Window**: 15 minutes (configurable)
- **Max Requests**: 100 per window (configurable)
- **Headers**: Includes `Retry-After` header when limited

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Lint code
npm run lint
```

## 📦 Deployment

### Docker Deployment
```bash
# Build image
docker build -t dodo-payments-service .

# Run container
docker run -p 3001:3001 --env-file .env dodo-payments-service
```

### Environment Variables
Ensure these are set in production:
- `NODE_ENV=production`
- `DODO_PAYMENTS_LIVE_API=https://live.dodopayments.com`
- `PORT=3001`

## 🤝 Support

For issues and questions:
1. Check the logs for detailed error information
2. Verify API key validity
3. Ensure network connectivity to Dodo Payments API
4. Review rate limiting configuration

## 📄 License

MIT License - see LICENSE file for details.
