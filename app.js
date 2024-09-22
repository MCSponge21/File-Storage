const { PrismaClient } = require('@prisma/client');
const express = require('express');
const session = require('express-session');
const passport = require('passport')
const app = express();
const Router = require('./routes/router')
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
require('./auth/passport')
require('dotenv').config();

app.set("view engine", "ejs");
app.use(
  session({
    cookie: {
     maxAge: 7 * 24 * 60 * 60 * 1000 // ms
    },
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(
      new PrismaClient(),
      {
        checkPeriod: 2 * 60 * 1000,  //ms
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      }
    )
  })
);

app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use('/public', express.static('public'));
app.use('/', Router);

app.listen(3000, () =>{
  console.log(`Listening on port 3000`);
})