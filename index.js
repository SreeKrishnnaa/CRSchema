const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('./User.js');
const { Service } = require('./Service.js'); // Ensure this is correctly imported
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const jwt=require("jsonwebtoken");

dotenv.config();  // Load environment variables

const port = process.env.PORT || 3001;  // Ensure port is correctly set
const app = express();

// CORS configuration
const corsOptions = {
  origin: 'https://crschema-2.onrender.com/', // Allow requests from origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};

app.use(cors(corsOptions));  
app.use(bodyParser.json());



// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });

// Define routes
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users', error });
    }
});


//addservice
app.post('/addservice', async (req, res) => {
    try {
        const { name, email, phoneNo, serviceName, details } = req.body;

        // Basic validation
        if (!name || !email || !phoneNo || !serviceName || !details) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create a new service
        const service = new Service({
            name,
            email,
            phoneNo,
            serviceName,
            details
        });

        // Save service to the database
        const savedService = await service.save();

        // Send confirmation email
        const mailOptions = {
            from: {
               
                address: process.env.USER
            },
            to: email, // list of receiver
            subject: "Your order has been placed!!",
            
            html: `Type of service: ${serviceName}<br><b>Welcome to John Bike Services, wait for the delivery, we will contact you soon.</b>`,
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: 'Service added successfully', service: savedService });
    } catch (error) {
        console.error('Error adding service:', error);
        res.status(500).json({ message: 'Error adding service', error });
    }
});

//get service for admin
app.get('/services', async (req, res) => {
    try {
      const services = await Service.find({});
      res.status(200).json(services);
    } catch (error) {
      console.error('Error fetching service details:', error);
      res.status(500).json({ message: 'Error fetching service details', error });
    }
  });



  //delete service by admin
 
app.delete('/services/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await Service.findByIdAndDelete(id);
      if (!result) {
        return res.status(404).json({ message: 'Service not found' });
      }
      res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
      console.error('Error deleting service:', error);
      res.status(500).json({ message: 'Error deleting service', error });
    }
  });
  
// Signup route
app.post('/signup', async (req, res) => {
    const { emailID, password, user_name, role, mobilenumber } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ emailID });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            emailID,
            password: hashedPassword,
            user_name,
            role,
            mobilenumber,
        });

        // Save user to the database
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user', error });
    }
});
// Example backend route in Node.js/Express
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ emailID: email });
        if(user.emailID=="johnbikeservices@gmail.com"){
            const token=jwt.sign(
                {email:user.emailID,username:user.user_name},
                "hdkjge$##",
                {
                    expiresIn:"10d"
                }
            )
            
        res.json({ message: 'Login successful!',token,role:"admin"});

        }
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Respond with a success message or user data
        const token=jwt.sign(
            {email:email,username:user.user_name},
            "hdkjge$##",
            {
                expiresIn:"10d"
            }
        )
        
        res.json({ message: 'Login successful!',token,role:"user"});
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error during login', error });
    }
});
  

const connectdb = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGOAPI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connection successful:", connection.connection.host);
        
        app.listen(port, () => {  // Ensure port number is correctly set
            console.log(`App is listening on port ${port}`);
        });
    } catch (err) {
        console.error('Error connecting to database:', err);
    }
};

connectdb();
