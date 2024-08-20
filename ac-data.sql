CREATE SEQUENCE member_seq START WITH 1 INCREMENT BY 1;
CREATE TABLE members(
    member_id CHAR(10) PRIMARY KEY DEFAULT 'M-' || lpad(nextval('member_seq')::text, 2, '0'),
    surname VARCHAR(50) NOT NULL,
    firstname VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL,
    tel CHAR(15) NOT NULL,
    joined DATE NOT NULL,
    weeks_paid SMALLINT
);

CREATE TABLE tracker (
    cash_bal INT,
    week_count INT
);

CREATE SEQUENCE t_seq START WITH 1 INCREMENT BY 1;
CREATE TABLE transactions(
    TID CHAR(10) PRIMARY KEY DEFAULT 'TR-' || lpad(nextval('t_seq')::text, 3, '0'),
    amount INT NOT NULL,
    t_date DATE NOT NULL,
    member_id CHAR(10) REFERENCES members(member_id)

);

CREATE SEQUENCE lo_seq START WITH 1 INCREMENT BY 1;
CREATE TABLE loans(
    loan_id CHAR(10) PRIMARY KEY DEFAULT 'LO-' || lpad(nextval('lo_seq')::text, 3, '0'),
    m_id CHAR(10) REFERENCES members(member_id) NOT NULL,
    TID CHAR(10) REFERENCES transactions(TID) NOT NULL,
    i_rate SMALLINT NOT NULL,
    completed CHAR(10) REFERENCES transactions(TID),
    interest INT
);

CREATE SEQUENCE li_seq START WITH 1 INCREMENT BY 1;
CREATE TABLE loan_pay(
    pay_id CHAR(10) PRIMARY KEY DEFAULT 'LI-' || lpad(nextval('li_seq')::text, 3, '0'),
    loan_id CHAR(10) REFERENCES loans(loan_id) NOT NULL,
    TID CHAR(10) REFERENCES transactions(TID) NOT NULL,
    amount INT NOT NULL,
    bal INT NOT NULL,
    interested BOOL NOT NULL
);

CREATE TABLE weekly (
    WID SERIAL PRIMARY KEY,
    TID  CHAR(10) REFERENCES transactions(TID),
    m_id CHAR(10) REFERENCES members(member_id) NOT NULL,
    weeks_paid INT NOT NULL
);

CREATE SEQUENCE fl_seq START WITH 1 INCREMENT BY 1;
CREATE TABLE files(
    fid CHAR(10) PRIMARY KEY DEFAULT 'FL-' || lpad(nextval('fl_seq')::text, 3, '0'),
    f_name VARCHAR(150) NOT NULL,
    filepath TEXT NOT NULL,
    dt_upload DATE NOT NULL
);

CREATE SEQUENCE in_seq START WITH 1 INCREMENT BY 1;
CREATE TABLE investments(
    invest_id CHAR(10) PRIMARY KEY DEFAULT 'IN-' || lpad(nextval('in_seq')::text, 2, '0'),
    startd  DATE NOT NULL,
    Iname VARCHAR(100) NOT NULL,
    manager CHAR(10) REFERENCES members(member_id),
    describe TEXT NOT NULL,
    fid CHAR(10)
);

CREATE SEQUENCE ex_seq START WITH 1 INCREMENT BY 1;
CREATE TABLE expenses(
    exp_id CHAR(10) PRIMARY KEY DEFAULT 'EX-' || lpad(nextval('ex_seq')::text, 3, '0'),
    TID  CHAR(10) REFERENCES transactions(TID) NOT NULL,
    invest_id CHAR(10) REFERENCES investments(invest_id),
    describe TEXT NOT NULL
);

CREATE SEQUENCE gn_seq START WITH 1 INCREMENT BY 1;
CREATE TABLE gains(
    gain_id CHAR(10) PRIMARY KEY DEFAULT 'GN-' || lpad(nextval('gn_seq')::text, 3, '0'),
    TID  CHAR(10) REFERENCES transactions(TID) NOT NULL,
    invest_id CHAR(10) REFERENCES investments(invest_id),
    describe TEXT NOT NULL
);

INSERT INTO members (surname, firstname, email, tel, joined) values ('Jjuuko', 'amruh', 'amjuuko@gmail.com', '0701568945', '1/1/2024');
INSERT INTO members (surname, firstname, email, tel, joined) values ('Ainebyoona', 'Marvin', 'marvinaine@gmail.com', '0701465985', '5/1/2024');
INSERT INTO members (surname, firstname, email, tel, joined) values ('Esabu', 'Robert', 'robabu@gmail.com', '0773464589', '3/1/2024');
INSERT INTO members (surname, firstname, email, tel, joined) values ('mohammed', 'mbarak', 'amjuuko@gmail.com', '0701568945', '1/1/2024');
INSERT INTO members (surname, firstname, email, tel, joined) values ('Mulungi', 'Jonathan', 'marvinaine@gmail.com', '0701465985', '5/1/2024');
INSERT INTO members (surname, firstname, email, tel, joined) values ('ariko', 'shaun', 'robabu@gmail.com', '0773464589', '3/1/2024');
INSERT INTO members (surname, firstname, email, tel, joined) values ('ssekyondwa', 'edwin', 'marvinaine@gmail.com', '0701465985', '5/1/2024');
INSERT INTO members (surname, firstname, email, tel, joined) values ('lakara', 'eliud', 'robabu@gmail.com', '0773464589', '3/1/2024');