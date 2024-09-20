const express = require('express');
const app = express();
const cors = require("cors");
const { Pool } = require('pg');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const path = require('path');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5011'], // Allow requests from frontend origins
    credentials: true, // Allow cookies to be sent with the request
    methods: ['GET', 'POST', 'OPTIONS']
}));

app.use(bodyParser.urlencoded({ extended: true }));  // To handle form submissions
app.use(bodyParser.json());

app.set('view engine', 'ejs'); // Set EJS as the view engine
app.set('views', path.join(__dirname, 'views')); // Set the directory where your views are located

// // Serve static files from 'authentication_js' directory
// app.use('/authentication_js', express.static(path.join(__dirname, 'authentication_js')));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// PostgreSQL pool setup
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tic_test2',
    password: 'dorilla123',
    port: 5432,
});

app.use(session({
    store: new pgSession({
        pool: pool,  // Use existing PostgreSQL pool for session store
        tableName: 'session'  // Optional: customize session table name
    }),
    secret: 'MySecretKey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        path: '/',
        sameSite: 'none',
        secure: false,  // Should be true if using HTTPS in production
        httpOnly: true,  // Helps mitigate XSS attacks
        maxAge: 12 * 60 * 60 * 1000 // 12 hours
    }
}));

app.use((req, res, next) => {
    console.log('New request received');
    console.log('Session ID:', req.sessionID);
    console.log('Session Data:', req.session);
    console.log('Cookies:', req.headers.cookie);
    next(); 
  });

// Serve the signup page (static HTML file)
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'm-signup.html'));
});

// Serve the login page (static HTML file)
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'm-login.html'));
});

// Route to render the login page
app.get('/login', (req, res) => {
    res.render('m-login');  // Render the m-login.ejs file
});

// Sign Up endpoint
app.post('/api/signup', async (req, res) => {
    const { surname, firstname, tel, email, pwd } = req.body;
    const hashpwd = await bcrypt.hash(pwd, 10);

    try {
        const newmem = await pool.query(
            'INSERT INTO members (surname, firstname, email, tel, weeks_paid, joined, password) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [surname, firstname, email, tel, 0, new Date('2024-01-01'), hashpwd]);

        if (newmem.rowCount === 0) {
            console.log('Member ' + surname + ' NOT added');
            return res.status(409).json({ message: 'Couldn\'t register member' });
        }

        console.log('Member ' + surname + ' added');
        res.status(200).json({ message: 'Signup successful, please login.' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Sign In endpoint
app.post('/api/signin', async (req, res) => {
    const { email, pwd } = req.body;

    try {
        const result = await pool.query('SELECT * FROM members WHERE email = $1', [email]);

        if (result.rowCount === 0) {
            return res.status(401).json({ message: 'User not found.' });
        }

        const user = result.rows[0];
        const isPasswordCorrect = await bcrypt.compare(pwd, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Incorrect password.' });
        }

        // Set session or JWT token
        req.session.email = email; // If you're using sessions
        req.session.save((err) => {
            // if (err) console.error('Session save error:', err);
            // res.cookie('sessionId', req.sessionID, {
            //     maxAge: 24 * 60 * 60 * 1000,
            //     httpOnly: true,
            //     secure: false, // Set to true if using HTTPS
            //     sameSite: 'lax'
            //   });   ====>>> this is the test cookie that we can use to resolve this issue.
            // Respond with redirect URL
        res.status(200).json({ message: 'Login successful', redirectUrl: '/member.html' }); // Adjust the redirect URL
          });
          console.log('Session after signin:', req.session);
        console.log('Response headers:', res.getHeaders());

        
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// Member endpoint
app.get('/api/member', async (req, res) => {

    const email = req.session.email;
    console.log(email);

    if (!email) {
        return res.status(401).json({ message: 'Unauthorized: No session email found' });
    }

    try {
        const member_info = await pool.query('SELECT member_id, surname, firstname, weeks_paid FROM members WHERE email=$1', [email]);
        
        if (member_info.rowCount === 0) {
            console.log('No members found');
            return res.status(404).json({ message: 'Member not found' });
        }

        const member = member_info.rows[0].member_id;

        const loans = await pool.query('SELECT loans.interest, transactions.t_date, transactions.amount, loans.loan_id FROM loans JOIN transactions ON loans.t_id=transactions.t_id WHERE loans.m_id=$1 AND loans.completed IS NULL', [member]);

        const payments = [];
        for (const row of loans.rows) {
            const paid = await pool.query('SELECT bal FROM loan_pay WHERE loan_id=$1 ORDER BY pay_id DESC LIMIT 1', [row.loan_id]);

            if (paid.rowCount === 0) {
                payments.push('__');
            } else {
                payments.push(paid.rows[0].bal);
            }
        }

        loans.rows.forEach((loan, index) => {
            loan.balance = payments[index];
        });

        // Send member information and loan data as JSON to the client
        res.status(200).json({
            member_info: member_info.rows[0],
            loans: loans.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});




// Start server
app.listen(5011, () => {
    console.log(`Server is running on port 5011`);
});
