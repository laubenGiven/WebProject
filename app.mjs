import express from 'express';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import mongoose from 'mongoose';
import  * as AdminJSMongoose  from '@adminjs/mongoose';

// Create an Express.js app
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/rentaldb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Register the Mongoose adapter with AdminJS
AdminJS.registerAdapter(AdminJSMongoose);

// Define AdminJS resources
const adminJsOptions = {
  resources: [ ],
  rootPath: '/admin',
};

// Create an AdminJS instance
const admin = new AdminJS(adminJsOptions);

// Mount AdminJS to a specific route
const adminRouter = AdminJSExpress.buildRouter(admin);
app.use(adminJsOptions.rootPath, adminRouter);

// Start the Express.js server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});