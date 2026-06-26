/**
 * Centralized Error Logging System
 * 
 * This replaces external error monitoring services with a local logging system
 * that provides structured error tracking, deduplication, and rate limiting.
 */

const ERROR_LOG = [];
const MAX_ERROR_LOG_SIZE = 1000;
const ERROR_DEDUP_WINDOW = 5 * 60 * 1000; // 5 minutes
const ERROR_RATE_LIMIT = {
    count: 0,
    window: 60 * 1000, // 1 minute
    maxPerMinute: 50
};

/**
 * Get error signature for deduplication
 */
function getErrorSignature(error) {
    const message = error?.message || String(error);
    const stack = error?.stack || '';
    const signature = `${message}:${stack.split('\n')[0]}`; // Use first stack frame
    return signature;
}

/**
 * Check if error should be logged (rate limiting + deduplication)
 */
function shouldLogError(error) {
    const now = Date.now();
    const signature = getErrorSignature(error);
    
    // Rate limiting check
    if (now - ERROR_RATE_LIMIT.window > ERROR_RATE_LIMIT.count) {
        ERROR_RATE_LIMIT.count = 0;
        ERROR_RATE_LIMIT.window = now;
    }
    
    if (ERROR_RATE_LIMIT.count >= ERROR_RATE_LIMIT.maxPerMinute) {
        return false; // Rate limited
    }
    
    // Deduplication check
    const recentError = ERROR_LOG.find(
        e => e.signature === signature && (now - e.timestamp) < ERROR_DEDUP_WINDOW
    );
    
    if (recentError) {
        recentError.count++;
        recentError.lastSeen = now;
        return false; // Duplicate error
    }
    
    return true;
}

/**
 * Log error with structured data
 */
function logError(error, context = {}) {
    if (!shouldLogError(error)) {
        return;
    }
    
    const now = Date.now();
    const signature = getErrorSignature(error);
    
    const errorEntry = {
        id: crypto.randomUUID(),
        timestamp: now,
        signature,
        message: error?.message || String(error),
        stack: error?.stack,
        count: 1,
        lastSeen: now,
        context: {
            ...context,
            environment: process.env.NODE_ENV,
            path: context?.path,
            method: context?.method,
            userId: context?.userId,
            ip: context?.ip,
        }
    };
    
    ERROR_LOG.push(errorEntry);
    
    // Maintain log size limit
    if (ERROR_LOG.length > MAX_ERROR_LOG_SIZE) {
        ERROR_LOG.shift();
    }
    
    ERROR_RATE_LIMIT.count++;
    
    // Console output with appropriate severity
    const logLevel = context?.severity === 'critical' ? 'error' : 'warn';
    console[logLevel](`[${errorEntry.id}] ${errorEntry.message}`, {
        context: errorEntry.context,
        stack: errorEntry.stack
    });
}

/**
 * Get recent errors for debugging
 */
function getRecentErrors(limit = 50) {
    return ERROR_LOG.slice(-limit).reverse();
}

/**
 * Get error statistics
 */
function getErrorStats() {
    const now = Date.now();
    const lastHour = ERROR_LOG.filter(e => now - e.timestamp < 60 * 60 * 1000);
    
    return {
        total: ERROR_LOG.length,
        lastHour: lastHour.length,
        topErrors: getTopErrors(10),
        rateLimited: ERROR_RATE_LIMIT.count >= ERROR_RATE_LIMIT.maxPerMinute
    };
}

/**
 * Get most frequent errors
 */
function getTopErrors(limit = 10) {
    const errorCounts = {};
    
    ERROR_LOG.forEach(e => {
        if (!errorCounts[e.signature]) {
            errorCounts[e.signature] = {
                signature: e.signature,
                message: e.message,
                count: 0,
                lastSeen: e.lastSeen
            };
        }
        errorCounts[e.signature].count += e.errorLog?.count || 1;
    });
    
    return Object.values(errorCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

/**
 * Clear old errors (called periodically)
 */
function cleanupOldErrors(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    const now = Date.now();
    const initialSize = ERROR_LOG.length;
    
    for (let i = ERROR_LOG.length - 1; i >= 0; i--) {
        if (now - ERROR_LOG[i].timestamp > maxAge) {
            ERROR_LOG.splice(i, 1);
        }
    }
    
    const cleaned = initialSize - ERROR_LOG.length;
    if (cleaned > 0) {
        console.log(`Cleaned up ${cleaned} old error entries`);
    }
}

// Clean up errors every hour
setInterval(cleanupOldErrors, 60 * 60 * 1000);

export { logError, getRecentErrors, getErrorStats, getTopErrors, shouldLogError };