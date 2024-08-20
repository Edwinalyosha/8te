const express= require('express');
const app =express();
const cors=require("cors");
const{Pool}=require('pg');
const bodyParser=require("body-parser");
const bcrypt = require('bcrypt');
const path=require('path');
const session = require('express-session');

app.use(cors({
    origin: 'http://127.0.0.1:5500', // Allow requests from your frontend
    credentials: true, // Allow cookies to be sent with the request
}));

app.options('*', cors({
    origin: 'http://localhost:5011',
    credentials: true,
}));

app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: 'MySecretKey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        path: '/',
        sameSite: 'none', // 'lax' or 'strict' based on your requirements
        secure:'none',
        httpOnly: true // Helps mitigate XSS attacks
    }
}));

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tic_test2',
    password: '********',
    port: 5432,
});

app.post('/api/signup', async (req,res)=>{
    const [surname, firstname, tel, email, pwd]=req.body;
    const hashpwd=await bcrypt.hash(pwd,10);

    try{//insert the new member info into the database
        const newmem= await pool.query(
            'INSERT INTO members (surname, firstname, email, tel, weeks_paid, joined, password) VALUES ($1, $2, $3, $4, $5, $6, $7)', [surname, firstname, email, tel, 0, new Date('2024-01-01'), hashpwd]);
        if (newmem.rowCount === 0) {
            return res.status(409).json({ message: 'Couldn\'t register member' });
            console.log('member'+surname +' NOT added');
        }
        console.log('member'+surname +'added');
        res.status(200).json({ message: 'Signup successful, please login.' });
    }catch (error){
        console.error(error);
        res.status(500).send('Server Error');
    }
});


//the logic would be that the signin endpoint redirects to the member endpoint on successfull login. it seems however
// that the session is not storing the email value as needed to pass it from the sign in api to the member api. 
app.post('/api/signin', async (req, res) => {
    const { email, pwd } = req.body;

    console.log('server-side reached');
    console.log(email, pwd);// for debugging
    try {
        const memlog = await pool.query(
            'SELECT password FROM members WHERE email=$1', [email]);
        if (memlog.rowCount === 0) {
            return res.status(409).json({ message: 'Couldn\'t find member' });
        }
    //    console.log('on signin', req.session);
        const isPasswordCorrect = await bcrypt.compare(pwd, memlog.rows[0].password);
        if (isPasswordCorrect) {
            req.session.email = email;// try to store the email in session and log it on the next line
            console.log('on signin ', req.session);
            req.session.save(err => {
                if (err) {
                    console.error('Session save error:', err);
                    return res.status(500).send('Server Error');
                }
                return res.json({ redirectUrl: 'http://localhost:5011/api/member' });
            });
        } else {
            res.status(401).json({ message: 'Invalid password' });
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.get('/api/member', async (req, res) => {
    const email = req.session.email;//try to retrieve the email from seesion. this is where it goes wrong for me
    console.log('on memmber:', req.session.email);
    // Fetch the member info and loans
    const member_info = await pool.query('SELECT member_id, surname, firstname, weeks_paid FROM members WHERE email=$1', [email]);
    if(member_info.rowCount===0) console.log('no members found')
    console.log(member_info.rows);
    const member = member_info.rows[0].member_id;

    const loans = await pool.query('SELECT loans.interest, transactions.t_date, transactions.amount, loans.loan_id FROM loans JOIN transactions ON loans.tid= transactions.tid where loans.m_id =$1 AND loans.completed IS NULL', [member]);

    const payments = [];// create the array to be filled later

    for (const row of loans.rows) {
        const paid = await pool.query('SELECT bal FROM loan_pay WHERE loan_id=$1 ORDER BY pay_id DESC LIMIT 1', [row.loan_id]);

        if (paid.rowCount === 0) {
            payments.push('__');
        } else {
            payments.push(paid.rows[0].bal);
        }
    }

    loans.rows.forEach((loan, index) => {//add the loan balance to the table sinceit is gotten from another table in the database
        loan.balance = payments[index];
    });
    console.log('server-side reached 2S');//ogged to console

    // Render the member page immediately; or so i had hoped. this bish is not redirecting, it stays at the login page or gives me an error page. 
    res.render('member', { member_info: member_info.rows[0], loans: loans.rows });
});


app.listen(5011, () => {
    console.log(`Server is running on port 5011`);
});