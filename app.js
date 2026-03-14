require("dotenv").config();
require("express-async-errors");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const csrf = require("host-csrf");
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')


// connect DB import
const MongoDBStore = require("connect-mongodb-session")(session);
const url = process.env.MONGO_URI;
const connectDB = require("./db/connect");

// middleware import
const passportInit = require("./passport/passportInit");
const auth = require("./middleware/auth");

// router import
const secretWordRouter = require("./routes/secretWord");
const jobRouter = require("./routes/jobs");

const app = express();

// -------Body +cookie parsers -----------------
app.use(require("body-parser").urlencoded({ extended: true }));
app.use(cookieParser(process.env.SESSION_SECRET));

// -------Session store -----------------------
const store = new MongoDBStore({
  // may throw an error, which won't be caught
  uri: url,
  collection: "mySessions",
});

store.on("error", function (error) {
  console.log(error);
});

const sessionParms = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: { secure: false, sameSite: "lax" },
};

// check if the app is in production mode
if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessionParms.cookie.secure = true; // serve secure cookies
}

app.use(session(sessionParms));

// ------------csrf----------------------
const csrfMiddleware = csrf.csrf();
app.use(csrfMiddleware);

app.use((req, res, next) => {
  res.locals._csrf = csrf.getToken(req, res);
  next();
});

// -----------Passport -------
passportInit();
app.use(passport.initialize());
app.use(passport.session());

// -----------Flash +Locals---------------
app.use(require("connect-flash")());
app.use(require("./middleware/storeLocals"));

// ----extra packages----
app.set('trust proxy', 1)
app.use(rateLimiter({
  windowMs:15*60*1000,  //15minutes
  max:100, 
}))
app.use(helmet())
app.use(xss())


// ---------Routes ------------------
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.use("/sessions", require("./routes/sessionRoutes"));

app.use("/secretWord", auth, secretWordRouter);

app.use("/jobs", auth, jobRouter);

app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res, next) => {
  res.status(500).send(err.message);
  console.log(err);
});

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(url);
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
