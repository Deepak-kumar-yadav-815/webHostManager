const cron = require('node-cron');
const Subscription = require('../models/Subscription');

// Assume io is passed or available globally, or we can use a singleton for Socket.io
// For this design, we will just export a function that takes `io` as an argument
// and sets up the cron jobs.

const setupCronJobs = (io) => {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily subscription cron job...');
    try {
      const now = new Date();
      const sevenDaysFromNow = new Date(now);
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      // 1. Notify users whose subscriptions are expiring in exactly 7 days
      // (For simplicity, we check if endDate is between day 6 and 7 from now)
      const sixDaysFromNow = new Date(now);
      sixDaysFromNow.setDate(sixDaysFromNow.getDate() + 6);

      const expiringSoon = await Subscription.find({
        status: 'active',
        endDate: { $gte: sixDaysFromNow, $lte: sevenDaysFromNow }
      }).populate('user');

      expiringSoon.forEach(sub => {
        // Emit socket notification to the specific user room
        // Assuming we will have users join rooms with their user._id on connection
        io.to(sub.user._id.toString()).emit('notification', {
          message: `Your plan "${sub.plan}" expires in 7 days. Please queue a renewal!`,
          type: 'warning'
        });
      });

      // 2. Handle expired plans and queued plans
      const expiredSubscriptions = await Subscription.find({
        status: 'active',
        endDate: { $lt: now }
      });

      for (let sub of expiredSubscriptions) {
        if (sub.queuedPlan) {
          // Activate queued plan
          sub.plan = sub.queuedPlan;
          sub.startDate = sub.queuedPlanStartDate;
          sub.endDate = sub.queuedPlanEndDate;
          sub.queuedPlan = undefined;
          sub.queuedPlanStartDate = undefined;
          sub.queuedPlanEndDate = undefined;
          sub.status = 'active';
          
          await sub.save();
          console.log(`Activated queued plan for user ${sub.user}`);
        } else {
          // No queued plan, just expire
          sub.status = 'expired';
          await sub.save();
          console.log(`Expired subscription for user ${sub.user}`);

          io.to(sub.user._id.toString()).emit('notification', {
            message: 'Your hosting plan has expired. Your websites have been suspended.',
            type: 'error'
          });
        }
      }

    } catch (error) {
      console.error('Error running cron job:', error.message);
    }
  });
};

module.exports = setupCronJobs;
