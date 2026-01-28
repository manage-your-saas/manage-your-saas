/**
 * Dodo Payments API Service
 * 
 * A production-ready backend service for fetching and aggregating data from Dodo Payments API.
 * Handles authentication, rate limiting, retries, and revenue aggregation.
 */

const axios = require('axios');
const express = require('express');
const rateLimit = require('express-rate-limit');

// Configuration
const config = {
  // Use environment variables for API endpoints
  DODO_PAYMENTS_API_BASE: process.env.NODE_ENV === 'production' 
    ? process.env.DODO_PAYMENTS_LIVE_API || 'https://live.dodopayments.com'
    : process.env.DODO_PAYMENTS_TEST_API || 'https://test.dodopayments.com',
  
  // API timeout and retry configuration
  TIMEOUT: parseInt(process.env.DODO_PAYMENTS_TIMEOUT) || 30000, // 30 seconds
  MAX_RETRIES: parseInt(process.env.DODO_PAYMENTS_MAX_RETRIES) || 3,
  RETRY_DELAY: parseInt(process.env.DODO_PAYMENTS_RETRY_DELAY) || 1000, // 1 second
  
  // Rate limiting
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 100 requests per window
};

// Create Express app
const app = express();

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW,
  max: config.RATE_LIMIT_MAX,
  message: {
    error: 'Too many requests',
    retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW / 1000)
  }
});

app.use(limiter);
app.use(express.json());

/**
 * Dodo Payments API Client
 * 
 * Handles all interactions with the Dodo Payments API including authentication,
 * retries, and error handling.
 */
class DodoPaymentsClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = config.DODO_PAYMENTS_API_BASE;
    
    // Create axios instance with default configuration
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: config.TIMEOUT,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'DodoPaymentsService/1.0'
      }
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request error:', error.message);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log(`📥 ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        const status = error.response?.status;
        const url = error.config?.url;
        console.error(`❌ ${status || 'NETWORK'} ${url}: ${error.message}`);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Make API request with retry logic
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {object} params - Request parameters
   * @returns {Promise} API response
   */
  async makeRequest(method, endpoint, params = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= config.MAX_RETRIES; attempt++) {
      try {
        const response = await this.client.request({
          method,
          url: endpoint,
          [method.toLowerCase() === 'get' ? 'params' : 'data']: params
        });
        
        return response.data;
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx)
        if (error.response?.status >= 400 && error.response?.status < 500) {
          throw error;
        }
        
        // Don't retry on last attempt
        if (attempt === config.MAX_RETRIES) {
          throw error;
        }
        
        // Exponential backoff for retries
        const delay = config.RETRY_DELAY * Math.pow(2, attempt - 1);
        console.log(`🔄 Retry ${attempt}/${config.MAX_RETRIES} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  /**
   * Fetch all products from Dodo Payments
   * @returns {Promise<Array>} Array of products
   */
  async getProducts() {
    try {
      const response = await this.makeRequest('get', '/v1/products', { limit: 100 });
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch products:', error.message);
      throw new Error(`Products fetch failed: ${error.message}`);
    }
  }

  /**
   * Fetch all payments with pagination
   * @returns {Promise<Array>} Array of payments
   */
  async getPayments() {
    try {
      const allPayments = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const response = await this.makeRequest('get', '/v1/payments', {
          limit: 100,
          page: page
        });
        
        const payments = response.data || [];
        allPayments.push(...payments);
        
        // Check if there are more pages
        hasMore = payments.length === 100 && page < 50; // Safety limit of 50 pages
        page++;
        
        // Small delay between pages to avoid rate limiting
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      return allPayments;
    } catch (error) {
      console.error('Failed to fetch payments:', error.message);
      throw new Error(`Payments fetch failed: ${error.message}`);
    }
  }

  /**
   * Fetch account information
   * @returns {Promise<Object>} Account details
   */
  async getAccount() {
    try {
      const response = await this.makeRequest('get', '/v1/account');
      return response;
    } catch (error) {
      console.error('Failed to fetch account:', error.message);
      throw new Error(`Account fetch failed: ${error.message}`);
    }
  }
}

/**
 * Revenue Aggregator
 * 
 * Processes raw payment data and aggregates revenue by different dimensions
 */
class RevenueAggregator {
  constructor() {
    this.currencyRates = {
      'USD': 1.0,
      'EUR': 1.18,
      'GBP': 1.38,
      'JPY': 0.0091,
      'CAD': 0.79,
      'AUD': 0.73
    };
  }

  /**
   * Aggregate revenue from payments data
   * @param {Array} payments - Array of payment objects
   * @param {Array} products - Array of product objects
   * @returns {Object} Aggregated revenue data
   */
  aggregateRevenue(payments, products) {
    const aggregation = {
      totalRevenue: { USD: 0, EUR: 0, GBP: 0, JPY: 0, CAD: 0, AUD: 0 },
      revenueByProduct: {},
      revenueByCurrency: { USD: 0, EUR: 0, GBP: 0, JPY: 0, CAD: 0, AUD: 0 },
      successfulPayments: 0,
      failedPayments: 0,
      totalPayments: payments.length,
      paymentsByStatus: {},
      paymentsByProduct: {},
      summary: {
        totalRevenueUSD: 0,
        averagePaymentAmount: 0,
        successRate: 0,
        topProduct: null,
        topCurrency: null
      }
    };

    // Create product lookup map
    const productMap = new Map();
    products.forEach(product => {
      productMap.set(product.id, {
        id: product.id,
        name: product.name,
        price: product.price,
        currency: product.currency
      });
    });

    // Process each payment
    payments.forEach(payment => {
      const currency = payment.currency || 'USD';
      const amount = parseFloat(payment.amount) || 0;
      const status = payment.status || 'unknown';
      const productId = payment.product_id;
      
      // Track payment status
      aggregation.paymentsByStatus[status] = (aggregation.paymentsByStatus[status] || 0) + 1;
      
      if (status === 'succeeded' || status === 'completed') {
        aggregation.successfulPayments++;
        
        // Add to total revenue by currency
        aggregation.totalRevenue[currency] = (aggregation.totalRevenue[currency] || 0) + amount;
        aggregation.revenueByCurrency[currency] = (aggregation.revenueByCurrency[currency] || 0) + amount;
        
        // Revenue by product
        if (productId && productMap.has(productId)) {
          const product = productMap.get(productId);
          if (!aggregation.revenueByProduct[productId]) {
            aggregation.revenueByProduct[productId] = {
              productId: productId,
              productName: product.name,
              revenue: { USD: 0, EUR: 0, GBP: 0, JPY: 0, CAD: 0, AUD: 0 },
              payments: 0
            };
          }
          
          aggregation.revenueByProduct[productId].revenue[currency] = 
            (aggregation.revenueByProduct[productId].revenue[currency] || 0) + amount;
          aggregation.revenueByProduct[productId].payments++;
          
          // Track payments by product
          if (!aggregation.paymentsByProduct[productId]) {
            aggregation.paymentsByProduct[productId] = 0;
          }
          aggregation.paymentsByProduct[productId]++;
        }
      } else {
        aggregation.failedPayments++;
      }
    });

    // Calculate summary statistics
    const totalRevenueUSD = Object.entries(aggregation.revenueByCurrency).reduce((sum, [currency, amount]) => {
      return sum + (amount * (this.currencyRates[currency] || 1));
    }, 0);
    
    aggregation.summary.totalRevenueUSD = totalRevenueUSD;
    aggregation.summary.averagePaymentAmount = aggregation.successfulPayments > 0 
      ? totalRevenueUSD / aggregation.successfulPayments 
      : 0;
    aggregation.summary.successRate = aggregation.totalPayments > 0 
      ? (aggregation.successfulPayments / aggregation.totalPayments) * 100 
      : 0;

    // Find top product by revenue
    let topProductRevenue = 0;
    Object.entries(aggregation.revenueByProduct).forEach(([productId, data]) => {
      const productRevenueUSD = Object.entries(data.revenue).reduce((sum, [currency, amount]) => {
        return sum + (amount * (this.currencyRates[currency] || 1));
      }, 0);
      
      if (productRevenueUSD > topProductRevenue) {
        topProductRevenue = productRevenueUSD;
        aggregation.summary.topProduct = {
          productId,
          productName: data.productName,
          revenueUSD: productRevenueUSD
        };
      }
    });

    // Find top currency by revenue
    let topCurrencyAmount = 0;
    Object.entries(aggregation.revenueByCurrency).forEach(([currency, amount]) => {
      if (amount > topCurrencyAmount) {
        topCurrencyAmount = amount;
        aggregation.summary.topCurrency = {
          currency,
          amount,
          amountUSD: amount * (this.currencyRates[currency] || 1)
        };
      }
    });

    return aggregation;
  }
}

/**
 * API Routes
 */

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Main revenue aggregation endpoint
app.post('/api/revenue', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({
        error: 'API key is required',
        code: 'MISSING_API_KEY'
      });
    }

    console.log('🚀 Starting revenue aggregation...');
    const startTime = Date.now();

    // Initialize clients
    const dodoClient = new DodoPaymentsClient(apiKey);
    const aggregator = new RevenueAggregator();

    // Fetch data in parallel
    console.log('📊 Fetching products and payments...');
    const [products, payments] = await Promise.all([
      dodoClient.getProducts(),
      dodoClient.getPayments()
    ]);

    console.log(`✅ Fetched ${products.length} products and ${payments.length} payments`);

    // Aggregate revenue
    console.log('🔢 Aggregating revenue data...');
    const aggregatedData = aggregator.aggregateRevenue(payments, products);

    const processingTime = Date.now() - startTime;
    console.log(`🎉 Completed in ${processingTime}ms`);

    res.json({
      success: true,
      data: aggregatedData,
      metadata: {
        processingTime,
        productsCount: products.length,
        paymentsCount: payments.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Revenue aggregation failed:', error.message);
    
    // Handle specific error types
    if (error.response?.status === 401) {
      return res.status(401).json({
        error: 'Invalid API key',
        code: 'INVALID_API_KEY'
      });
    }
    
    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: error.response.headers['retry-after']
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Account information endpoint
app.post('/api/account', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({
        error: 'API key is required',
        code: 'MISSING_API_KEY'
      });
    }

    const dodoClient = new DodoPaymentsClient(apiKey);
    const account = await dodoClient.getAccount();

    res.json({
      success: true,
      data: account
    });

  } catch (error) {
    console.error('❌ Account fetch failed:', error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({
        error: 'Invalid API key',
        code: 'INVALID_API_KEY'
      });
    }
    
    res.status(500).json({
      error: 'Failed to fetch account information',
      code: 'ACCOUNT_FETCH_ERROR'
    });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Dodo Payments Service running on port ${PORT}`);
  console.log(`📡 API Base: ${config.DODO_PAYMENTS_API_BASE}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
