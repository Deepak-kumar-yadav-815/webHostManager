const User = require('../models/User');
const bcrypt = require('bcryptjs');

const initAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@webhostmanager.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    const adminName = process.env.ADMIN_NAME || 'Super Admin';

    let adminUser = await User.findOne({ role: 'Admin' });

    if (!adminUser) {
      console.log('No admin found. Creating singleton admin...');
      adminUser = new User({
        name: adminName,
        email: adminEmail,
        password: 'Deepaky@2005', // explicitly set
        role: 'Admin'
      });
      await adminUser.save();
      console.log('Singleton Admin created successfully.');
    } else {
      // console.log('Admin already exists. Enforcing Deepaky@2005 password.');
      adminUser.password = 'Deepaky@2005';
      await adminUser.save();
    }
  } catch (error) {
    console.error('Error initializing admin:', error.message);
  }
};

module.exports = initAdmin;
