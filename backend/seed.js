const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Plan = require('./src/models/Plan');

dotenv.config({ path: '../.env' });

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding');

    await Plan.deleteMany(); // Clear existing plans to avoid duplicates
    console.log('Cleared existing plans');

    const plans = [
      {
        name: 'Basic Starter',
        priceINR: 499,
        billingCycle: 'monthly',
        features: ['1 Website', '500MB Storage', 'Basic Support', 'Free SSL'],
        maxWebsites: 1,
        storageLimitMB: 500
      },
      {
        name: 'Pro Hosting',
        priceINR: 999,
        billingCycle: 'monthly',
        features: ['5 Websites', '2GB Storage', 'Priority Support', 'Daily Backups', 'Free SSL'],
        maxWebsites: 5,
        storageLimitMB: 2000
      },
      {
        name: 'Enterprise Cloud',
        priceINR: 2499,
        billingCycle: 'monthly',
        features: ['Unlimited Websites', '10GB Storage', '24/7 Dedicated Support', 'AI Analysis Included', 'Free SSL'],
        maxWebsites: 999, // practically unlimited
        storageLimitMB: 10000
      }
    ];

    await Plan.insertMany(plans);
    console.log('Plans seeded successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding plans:', error);
    process.exit(1);
  }
};

seedPlans();
