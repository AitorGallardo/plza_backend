const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

require('dotenv').config();

mongoose.connect(process.env.DATABASE_ATLAS_URL, {
  useNewUrlParser: true,
});

async function createAdminUser() {
  try {
    const user = await User.findOne({ role: 'admin' });
    if (!user) {
      const userBody = {
        username: 'Admin',
        password: await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD, 12),
        active: true,
        role: 'admin',
      };
      const newuser = new User(userBody);
      await newuser.save();
      console.log('✔ - Admin user created succesfully!');
    } else {
      console.log('❌ - Admin user already exists!');
    }
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
}
createAdminUser();
