// const express = require('express');
// const bodyParser = require('body-parser');
// const { Sequelize, DataTypes } = require('sequelize');
// const multer = require('multer');
// const xlsx = require('xlsx');
// const cors = require('cors');
// const fs = require('fs');
// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const sendEmail = require('./emailService'); // Import the email service
// require('dotenv').config();

// // Initialize the app
// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(cors({ origin: '*' }));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // Setup Google OAuth
// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: 'http://localhost:3000/auth/google/callback'
//   },
//   async (accessToken, refreshToken, profile, done) => {
//     try {
//       // Save user profile or handle logic to find/create user in DB
//       // For this example, we save the user's Google ID and email
//       const user = await JobApplication.findOrCreate({
//         where: { email: profile.emails[0].value },
//         defaults: {
//           name: profile.displayName,
//           email: profile.emails[0].value,
//           status: 'pending',  // You can customize this logic
//         }
//       });
//       return done(null, user[0]); // Done callback for passport
//     } catch (error) {
//       done(error, false);
//     }
//   }
// ));

// app.use(passport.initialize());

// // Setup Sequelize connection using environment variables
// const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
//     host: 'localhost',
//     dialect: 'postgres'
// });

// // Test database connection
// sequelize.authenticate()
//     .then(() => console.log('Database connection established.'))
//     .catch(err => console.error('Unable to connect to the database:', err));

// // Define the Job Application model
// const JobApplication = sequelize.define('JobApplication', {
//     name: { type: DataTypes.STRING, allowNull: false },
//     email: { 
//         type: DataTypes.STRING, 
//         allowNull: false,
//         validate: {
//             isEmail: { msg: 'Invalid email address' }
//         }
//     },
//     resume: { type: DataTypes.STRING, allowNull: true },
//     status: { type: DataTypes.STRING, defaultValue: 'pending' }
// });

// // Sync the database
// sequelize.sync().then(() => console.log('Database & tables created!'));

// // Test route
// app.get('/', (req, res) => {
//     res.send('API is working!');
// });

// // Configure multer for file uploads
// const upload = multer({ dest: 'uploads/' });

// // Import data from Excel file to the database
// app.post('/api/import', upload.single('file'), async (req, res) => {
//     try {
//         const file = req.file;
//         if (!file) return res.status(400).json({ error: 'No file uploaded' });

//         const workbook = xlsx.readFile(file.path);
//         const sheet = workbook.Sheets[workbook.SheetNames[0]];
//         const rows = xlsx.utils.sheet_to_json(sheet);

//         for (const row of rows) {
//             await JobApplication.create({
//                 name: row.name,
//                 email: row.email,
//                 resume: row.resume,
//                 status: row.status || 'pending'
//             });
//         }

//         fs.unlinkSync(file.path);
//         res.status(200).json({ message: 'Data imported successfully' });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // CRUD Operations

// // Create a new job application
// app.post('/api/applications', async (req, res) => {
//     try {
//         const { name, email, resume, status } = req.body;
//         if (!name || !email) {
//             return res.status(400).json({ error: 'Name and Email are required' });
//         }

//         const application = await JobApplication.create({ name, email, resume, status });
//         res.status(201).json(application);
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });

// // Get all job applications
// app.get('/api/applications', async (req, res) => {
//     try {
//         const applications = await JobApplication.findAll();
//         res.status(200).json(applications);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Get a single job application
// app.get('/api/applications/:id', async (req, res) => {
//     try {
//         const application = await JobApplication.findByPk(req.params.id);
//         if (!application) return res.status(404).json({ error: 'Application not found' });
//         res.status(200).json(application);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Update a job application status and send email notification
// app.put('/api/applications/:id', async (req, res) => {
//     try {
//         const application = await JobApplication.findByPk(req.params.id);
//         if (!application) return res.status(404).json({ error: 'Application not found' });

//         const { status } = req.body; 
//         const updatedApplication = await application.update({ status });

//         // Send email notification based on the status
//         if (status === 'rejected') {
//             await sendEmail(
//                 application.email,
//                 'Application Declined',
//                 `Dear ${application.name},\n\nWe regret to inform you that your application has been declined. While this is a no for now, it may not be forever. We believe you could be a good fit for future openings and will reach out if a suitable opportunity arises. Thank you for your time and interest.\n\nBest regards, Your Company`
//             );
//         } else if (status === 'reviewed') {
//             await sendEmail(
//                 application.email,
//                 'Application Reviewed',
//                 `Dear ${application.name},\n\nYour application has been reviewed. Please await further communication about the next stage of the process.\n\nBest regards, Your Company`
//             );
//         }
//         else if (status === 'accepted') {
//             await sendEmail(
//                 application.email,
//                 'Application Accepted',
//                 `Dear ${application.name},\n\nCongratulations! We have reviewed your application and are excited to move forward with the interview process. You will soon receive an invitation for a group interview with other candidates. We look forward to discussing your skills and qualifications.\n\nBest regards, Your Company`
//             );
//         }

//         res.status(200).json(updatedApplication);
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });

// // Delete a job application
// app.delete('/api/applications/:id', async (req, res) => {
//     try {
//         const application = await JobApplication.findByPk(req.params.id);
//         if (!application) return res.status(404).json({ error: 'Application not found' });
//         await application.destroy();
//         res.status(204).send();
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Google OAuth login route
// app.get('/auth/google', passport.authenticate('google', {
//     scope: ['profile', 'email']
// }));

// // Google OAuth callback route
// app.get('/auth/google/callback',
//     passport.authenticate('google', { failureRedirect: '/' }),
//     (req, res) => {
//         // Successful authentication, redirect to the dashboard or home page
//         res.redirect('/dashboard'); // You can modify this route as needed
//     }
// );

// // Start the server
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });




const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
const multer = require('multer');
const xlsx = require('xlsx');
const cors = require('cors');
const fs = require('fs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const sendEmail = require('./emailService'); // Import the email service
require('dotenv').config();

// Initialize the app
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Setup Google OAuth
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await JobApplication.findOrCreate({
        where: { email: profile.emails[0].value },
        defaults: {
          name: profile.displayName,
          email: profile.emails[0].value,
          status: 'pending',
        }
      });
      return done(null, user[0]);
    } catch (error) {
      done(error, false);
    }
  }
));

app.use(passport.initialize());

// Setup Sequelize connection
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres'
});

// Test database connection
sequelize.authenticate()
    .then(() => console.log('Database connection established.'))
    .catch(err => console.error('Unable to connect to the database:', err));

// Define the Job Application model
const JobApplication = sequelize.define('JobApplication', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { 
        type: DataTypes.STRING, 
        allowNull: false,
        validate: {
            isEmail: { msg: 'Invalid email address' }
        }
    },
    resume: { 
        type: DataTypes.STRING, 
        allowNull: true,
        validate: {
            is: /\.(pdf|doc|docx)$/i // Validate file extension
        }
    },
    status: { type: DataTypes.STRING, defaultValue: 'pending' }
});

// Sync the database
sequelize.sync().then(() => console.log('Database & tables created!'));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Destination folder
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname); // Unique filename
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.includes('msword') || file.mimetype.includes('officedocument')) {
        cb(null, true);
    } else {
        cb(new Error('Only .pdf, .doc, and .docx formats are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
});

// Routes

// Test route
app.get('/', (req, res) => {
    res.send('API is working!');
});

// Import data from Excel file
app.post('/api/import', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'No file uploaded' });

        const workbook = xlsx.readFile(file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = xlsx.utils.sheet_to_json(sheet);

        for (const row of rows) {
            await JobApplication.create({
                name: row.name,
                email: row.email,
                resume: row.resume,
                status: row.status || 'pending'
            });
        }

        fs.unlinkSync(file.path);
        res.status(200).json({ message: 'Data imported successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new job application with CV upload
app.post('/api/applications', upload.single('resume'), async (req, res) => {
    try {
        const { name, email, status } = req.body;
        if (!name || !email) return res.status(400).json({ error: 'Name and Email are required' });

        const resumePath = req.file ? req.file.path : null;

        const application = await JobApplication.create({ name, email, resume: resumePath, status });
        res.status(201).json(application);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all job applications
app.get('/api/applications', async (req, res) => {
    try {
        const applications = await JobApplication.findAll();
        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific job application
app.get('/api/applications/:id', async (req, res) => {
    try {
        const application = await JobApplication.findByPk(req.params.id);
        if (!application) return res.status(404).json({ error: 'Application not found' });
        res.status(200).json(application);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch CV for a specific application
app.get('/api/applications/:id/resume', async (req, res) => {
    try {
        const application = await JobApplication.findByPk(req.params.id);
        if (!application || !application.resume) return res.status(404).json({ error: 'Resume not found' });
        res.sendFile(application.resume, { root: '.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update application status and send email
app.put('/api/applications/:id', async (req, res) => {
    try {
        const application = await JobApplication.findByPk(req.params.id);
        if (!application) return res.status(404).json({ error: 'Application not found' });

        const { status } = req.body;
        const updatedApplication = await application.update({ status });

        if (status === 'rejected') {
                        await sendEmail(
                            application.email,
                            'Application Declined',
                            `Dear ${application.name},\n\nWe regret to inform you that your application has been declined. While this is a no for now, it may not be forever. We believe you could be a good fit for future openings and will reach out if a suitable opportunity arises. Thank you for your time and interest.\n\nBest regards, mwaistevetechs`
                        );
                    } else if (status === 'reviewed') {
                        await sendEmail(
                            application.email,
                            'Application Reviewed',
                            `Dear ${application.name},\n\nYour application has been reviewed. Please await further communication about the next stage of the process.\n\nBest regards, mwaistevetechs`
                        );
                    }
                    else if (status === 'accepted') {
                        await sendEmail(
                            application.email,
                            'Application Accepted',
                            `Dear ${application.name},\n\nCongratulations! We have reviewed your application and are excited to move forward with the interview process. You will soon receive an invitation for a group interview with other candidates. We look forward to discussing your skills and qualifications.\n\nBest regards, mwaistevetechs`
                        );
                    }
            
        res.status(200).json(updatedApplication);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a job application
app.delete('/api/applications/:id', async (req, res) => {
    try {
        const application = await JobApplication.findByPk(req.params.id);
        if (!application) return res.status(404).json({ error: 'Application not found' });
        await application.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Google OAuth login route
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/dashboard');
    }
);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Multer error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        res.status(400).json({ error: err.message });
    } else if (err) {
        res.status(500).json({ error: err.message });
    } else {
        next();
    }
});
