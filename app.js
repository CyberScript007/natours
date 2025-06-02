const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');

const tourRoutes = require('./routes/tourRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const viewRoutes = require('./routes/viewRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const AppError = require('./Utils/AppError');
const errorFunc = require('./Controller/errorController');

const app = express();

// how to set a pug in express
app.set('view engine', 'pug');
+(
  // set views directory for any templates
  app.set('views', path.join(__dirname, 'Views'))
);

// get access to the public folder
app.use(express.static(path.join(__dirname, 'public')));

// get access to leaflet css
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// secure http headers
app.use(helmet());

console.log(process.env.NODE_ENV);

// enable content security policy to grant access to some url
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
      "connect-src 'self' http://localhost:4000 http://127.0.0.1:4000 ws://localhost:* ws://127.0.0.1:*; " +
      "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' https://a.tile-cyclosm.openstreetmap.fr data:;",
  );
  next();
});

// logging  the req in the terminal
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// create limiter options
const limiter = rateLimit({
  limit: 100,
  windowMs: 60 * 60 * 1000,
  standardHeaders: true,
  message:
    'Too many requests from this  IP address, please try again after 1 hour ',
});

app.use(limiter);

//  to get access to req.body and limit the size of the body
app.use(
  express.json({
    limit: '10kb',
  }),
);

// to access the form data
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// cors options
const corsOption = {
  origin: '*', // Allow both localhost and 127.0.0.1
  credentials: true, // Allow cookies/session tokens
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly allow OPTIONS
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// initialize cors
app.use(cors(corsOption));

// implementing cors for
app.options('*', cors(corsOption));

// to access the cookie
app.use(cookieParser());

// data sanitize from NOSQL INJECTION
app.use(mongoSanitize());

// data sanitization from XSS
app.use(xss());

// testing middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/', viewRoutes);
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/review', reviewRoutes);
app.use('/api/v1/booking', bookingRoutes);

app.all('*', (req, res, next) => {
  next(
    new AppError(
      `There is no page found with this route ${req.originalUrl}`,
      404,
    ),
  );
});

app.use(errorFunc);

module.exports = app;
