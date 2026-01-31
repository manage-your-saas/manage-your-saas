/**
 * Intent Detection Service
 *
 * Real-time analysis of user behavior to detect purchase intent without conversion.
 * Runs on Port 3002.
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for dev simplicity
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// IN-MEMORY STATE (Not persistent)
// Key: SessionID -> { lastSeen: timestamp, pageHistory: [], score: 0, hasConverted: false }
const sessions = new Map();

// SSE Clients
let clients = [];

// Configuration
const CONFIG = {
    HIGH_INTENT_PAGES: ['/pricing', '/checkout', '/signup'],
    INTENT_THRESHOLD_SCORE: 20, // Arbitrary score threshold
    SESSION_TIMEOUT: 10 * 60 * 1000, // 10 minutes
    PRUNING_INTERVAL: 60 * 1000 // Prune every minute
};

// --- LOGIC ---

function calculateIntentScore(session) {
    let score = 0;

    // Rule 1: Visits to high intent pages
    const highIntentVisits = session.pageHistory.filter(p =>
        CONFIG.HIGH_INTENT_PAGES.some(hip => p.path.includes(hip))
    ).length;
    score += highIntentVisits * 10;

    // Rule 2: Duration (simplified as number of events)
    if (session.pageHistory.length > 5) score += 5;
    if (session.pageHistory.length > 10) score += 10;

    return score;
}

function broadcastAlert(alert) {
    const data = `data: ${JSON.stringify(alert)}\n\n`;
    clients.forEach(client => client.res.write(data));
}

// --- ENDPOINTS ---

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', activeSessions: sessions.size }));

// Track User Activity
app.post('/track', (req, res) => {
    const { sessionId, userId, path, type, timestamp } = req.body;

    if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

    let session = sessions.get(sessionId);
    if (!session) {
        session = {
            id: sessionId,
            userId: userId || null, // Store User ID
            lastSeen: Date.now(),
            pageHistory: [],
            score: 0,
            hasConverted: false
        };
    }

    // Update User ID if it becomes available later in session
    if (userId && !session.userId) {
        session.userId = userId;
    }

    // Update Session
    session.lastSeen = Date.now();
    if (type === 'pageview') {
        session.pageHistory.push({ path, timestamp });

        // Check conversion
        if (path.includes('/success') || path.includes('/thank-you')) {
            session.hasConverted = true;
            // If they converted, we might want to clear any existing alerts for them or just mark them
            // For now, we just track it to suppress future alerts
        }
    }

    session.score = calculateIntentScore(session);
    sessions.set(sessionId, session);

    // Check for Alert Condition
    if (!session.hasConverted && session.score >= CONFIG.INTENT_THRESHOLD_SCORE) {
        // Basic throttle: don't alert if we just alerted? 
        // For simplicity, we broadcast every high intent hit. Frontend can debouce.
        console.log(`⚠️ HIGH INTENT DETECTED: ${sessionId} (Score: ${session.score})`);

        broadcastAlert({
            type: 'INTENT_ALERT',
            payload: {
                sessionId: sessionId.substring(0, 8),
                userId: session.userId || 'Anonymous',
                score: session.score,
                reason: 'High activity on pricing/checkout without conversion',
                timestamp: new Date().toISOString()
            }
        });

        // Reset score slightly to avoid spamming? Or just let it flow.
        // Let's keep it simple.
    }

    res.json({ success: true, score: session.score });
});

// SSE Stream for Dashboard
app.get('/stream', (req, res) => {
    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    res.writeHead(200, headers);

    const clientId = Date.now();
    const newClient = {
        id: clientId,
        res
    };
    clients.push(newClient);

    req.on('close', () => {
        clients = clients.filter(c => c.id !== clientId);
    });
});

// --- HOUSEKEEPING ---

// Prune old sessions
setInterval(() => {
    const now = Date.now();
    for (const [id, session] of sessions) {
        if (now - session.lastSeen > CONFIG.SESSION_TIMEOUT) {
            sessions.delete(id);
        }
    }
}, CONFIG.PRUNING_INTERVAL);

// Start
app.listen(PORT, () => {
    console.log(`🚀 Intent Service running on port ${PORT}`);
});
