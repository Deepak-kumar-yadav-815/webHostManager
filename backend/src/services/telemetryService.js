const geoip = require('geoip-lite');

// In-Memory cache for active visitors
// Key: websiteId, Value: Map of { ip -> { timestamp, geo } }
const activeVisitorsCache = new Map();

// Helper to clean up visitors older than 5 minutes
const cleanupStaleVisitors = () => {
  const fiveMinsAgo = Date.now() - 5 * 60 * 1000;
  
  for (const [websiteId, visitors] of activeVisitorsCache.entries()) {
    for (const [ip, data] of visitors.entries()) {
      if (data.timestamp < fiveMinsAgo) {
        visitors.delete(ip);
      }
    }
  }
};

// Run cleanup every minute
setInterval(cleanupStaleVisitors, 60 * 1000);

// Log a hit
const logVisit = (websiteId, ip) => {
  if (!activeVisitorsCache.has(websiteId)) {
    activeVisitorsCache.set(websiteId, new Map());
  }
  
  const visitors = activeVisitorsCache.get(websiteId);
  
  // Only process geo if new IP or updating timestamp
  const geo = geoip.lookup(ip);
  visitors.set(ip, {
    timestamp: Date.now(),
    geo: geo ? { country: geo.country, city: geo.city } : { country: 'Unknown', city: 'Unknown' }
  });
};

// Get current active metrics for a website
const getWebsiteMetrics = (websiteId, planTier = 'Basic Starter') => {
  const visitors = activeVisitorsCache.get(websiteId);
  const activeCount = visitors ? visitors.size : 0;
  
  // Base resource limits based on plan
  let maxCpu = 10;
  let maxRam = 128; // MB
  
  if (planTier.includes('Pro')) {
    maxCpu = 30;
    maxRam = 512;
  } else if (planTier.includes('Enterprise')) {
    maxCpu = 80;
    maxRam = 2048;
  }

  // Simulate CPU usage based on active visitors + randomness
  // E.g., each visitor adds ~1-3% CPU usage depending on plan
  let cpuUsage = Math.min(100, Math.floor(Math.random() * maxCpu) + (activeCount * 2));
  let ramUsage = Math.min(maxRam, Math.floor(Math.random() * (maxRam / 2)) + (activeCount * 15));
  
  // If zero visitors, keep a very low idle baseline
  if (activeCount === 0) {
    cpuUsage = Math.max(1, Math.floor(Math.random() * 3));
    ramUsage = Math.max(10, Math.floor(Math.random() * 20));
  }

  return {
    activeVisitors: activeCount,
    cpuUsage,
    ramUsage,
    timestamp: Date.now()
  };
};

module.exports = {
  logVisit,
  getWebsiteMetrics
};
