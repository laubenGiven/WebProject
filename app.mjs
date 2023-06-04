import express from 'express';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import mongoose from 'mongoose';
import * as AdminJSMongoose from '@adminjs/mongoose';
import bcrypt from 'bcrypt';

AdminJS.registerAdapter(AdminJSMongoose);

const app = express();

async function connectToDatabase() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/rentaldb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

connectToDatabase();

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
});

// Hash the password before saving the user
UserSchema.pre('save', async function (next) {
  try {
    if (this.isModified('password') || this.isNew) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(this.password, salt);
      this.password = hash;
    }
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', UserSchema);

const createDefaultUser = async () => {
  try {
    const user = await User.findOne({ email: 'lourdel@example.com' });

    if (!user) {
      const newUser = new User({
        email: 'lourdel@example.com',
        password: 'password123',
      });

      await newUser.save();

      console.log('Default user created');
    }
  } catch (error) {
    console.error('Error creating default user:', error);
  }
};

const admin = new AdminJS({
  resources: [User],
  rootPath: '/admin',
});

const authenticate = async (email, password) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return null; // User not found
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null; // Invalid password
    }

    return {
      email: user.email,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, {
  authenticate,
  cookieName: 'AdminJS',
  cookiePassword: 'Secret',
});

app.use(admin.options.rootPath, adminRouter);

createDefaultUser()
  .then(() => {
    const port = 3000;
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Error creating default user:', error);
  });
