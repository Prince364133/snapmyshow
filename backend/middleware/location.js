const geoip = require('geoip-lite');

/**
 * Middleware to detect user location based on IP address
 * Adds req.location = { lat, lng, source: 'ip'|'header' }
 */
const detectLocation = (req, res, next) => {
    // 1. Check for coordinates in headers (if frontend already has GPS and sends it)
    const latHeader = req.headers['x-user-lat'];
    const lngHeader = req.headers['x-user-lng'];

    if (latHeader && lngHeader) {
        req.location = {
            lat: parseFloat(latHeader),
            lng: parseFloat(lngHeader),
            source: 'header'
        };
        return next();
    }

    // 2. Fallback to IP-based detection
    // In development, req.ip might be ::1 (localhost).
    let ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    
    // If it's a loopback address, geoip-lite won't find it.
    // We only use fallback coordinate logic if no IP geo is found later.

    const geo = geoip.lookup(ip);

    if (geo) {
        req.location = {
            lat: geo.ll[0],
            lng: geo.ll[1],
            city: geo.city,
            country: geo.country,
            source: 'ip'
        };
    } else {
        // Default fallback (center of India or global default)
        req.location = {
            lat: 28.6139,
            lng: 77.2090, 
            source: 'fallback'
        };
    }

    next();
};

module.exports = { detectLocation };
