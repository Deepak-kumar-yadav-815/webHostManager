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
  
  // Aggregate locations
  const locationsMap = new Map();
  if (visitors) {
    for (const data of visitors.values()) {
      const locStr = `${data.geo.city !== 'Unknown' ? data.geo.city + ', ' : ''}${data.geo.country}`;
      locationsMap.set(locStr, (locationsMap.get(locStr) || 0) + 1);
    }
  }
  
  // Convert map to sorted array of objects [{ location, count }]
  const topLocations = Array.from(locationsMap.entries())
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 locations

  // Realistic resource usage for static HTML
  // Base usage is very low (e.g. Nginx serving static files)
  let maxCpu = 2; // 2% max for basic
  let maxRam = 30; // 30 MB max for basic
  
  if (planTier.includes('Pro')) {
    maxCpu = 5;
    maxRam = 60;
  } else if (planTier.includes('Enterprise')) {
    maxCpu = 10;
    maxRam = 120;
  }

  // CPU usage: ~0.05% to 0.1% per active visitor
  let cpuUsage = (Math.random() * 0.5) + (activeCount * 0.1);
  cpuUsage = Math.min(maxCpu, parseFloat(cpuUsage.toFixed(2)));

  // RAM usage: Base 10MB + ~0.5MB per visitor
  let ramUsage = 10 + (Math.random() * 2) + (activeCount * 0.5);
  ramUsage = Math.min(maxRam, parseFloat(ramUsage.toFixed(1)));
  
  // If zero visitors, idle baseline
  if (activeCount === 0) {
    cpuUsage = parseFloat((Math.random() * 0.2).toFixed(2));
    ramUsage = parseFloat((10 + Math.random() * 2).toFixed(1));
  }

  return {
    activeVisitors: activeCount,
    cpuUsage,
    ramUsage,
    topLocations,
    timestamp: Date.now()
  };
};

module.exports = {
  logVisit,
  getWebsiteMetrics
};
