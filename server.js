const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const nodemailer = require('nodemailer');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize SQLite Database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err);
    } else {
        console.log('Connected to local SQLite database');
        // Create Bookings Table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            eventType TEXT,
            date TEXT,
            guests INTEGER,
            venue TEXT,
            totalAmount TEXT,
            firstName TEXT,
            lastName TEXT,
            email TEXT,
            phone TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating bookings table:', err);
            } else {
                console.log('Bookings table ready');
            }
        });
    }
});

// Create a new booking
app.post('/api/bookings/create', (req, res) => {
    const { eventType, date, guests, venue, totalAmount, firstName, lastName, email, phone } = req.body;
    
    const query = `INSERT INTO bookings 
                   (eventType, date, guests, venue, totalAmount, firstName, lastName, email, phone) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(query, [eventType, date, guests, venue, totalAmount, firstName, lastName, email, phone], function(err) {
        if (err) {
            console.error('Error inserting booking:', err);
            return res.status(500).json({ error: 'Failed to create booking' });
        }
        res.status(201).json({ message: 'Booking created successfully', bookingId: this.lastID });
    });
});

// Get all bookings (for admin panel)
app.get('/api/bookings', (req, res) => {
    const query = `SELECT * FROM bookings ORDER BY createdAt DESC`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching bookings:', err);
            return res.status(500).json({ error: 'Failed to fetch bookings' });
        }
        res.json(rows);
    });
});

// Send Contact Message Endpoint
app.post('/api/contact', async (req, res) => {
    const { name, phone, email, subject, message } = req.body;

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your_app_password_here') {
        console.error('Email credentials not configured completely in .env');
        return res.status(500).json({ error: 'Email sending not configured on server' });
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: `"${name}" <${email}>`,
        to: process.env.ADMIN_EMAIL,
        replyTo: email,
        subject: `New Planify Contact: ${subject}`,
        text: `You have received a new message from the Planify Contact form.\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

// Fallback to serve the main HTML file if route not found
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/event-management-app.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
