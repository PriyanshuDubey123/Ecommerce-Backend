const express = require('express');
const server = express();
const mongoose = require('mongoose');
const cors = require('cors')

const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');

//jwt
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');


const productsRouter = require('./routes/Products');
const categoriesRouter = require('./routes/Categories');
const brandsRouter = require('./routes/Brands');
const usersRouter = require('./routes/Users');
const authRouter = require('./routes/Auth');
const cookieParser = require('cookie-parser');
const cartRouter = require('./routes/Cart');
const ordersRouter = require('./routes/Order');
const { User } = require('./model/User');
const { isAuth, sanitizeUser, cookieExtractor } = require('./services/common');

const SECRET_KEY = 'SECRET_KEY';

const opts = {}
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = SECRET_KEY;

//middlewares

server.use(express.static('build'));
server.use(cookieParser());

server.use(session({
    secret: 'keyboard cat',
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
  }));
  
  server.use(passport.authenticate('session'))



server.use(cors({
    exposedHeaders:['X-Total-Count']
}))
server.use(express.raw({type:'application/json'}));
server.use(express.json()); // to parse req.body
server.use('/products', isAuth(), productsRouter.router);
server.use('/categories', isAuth(), categoriesRouter.router)
server.use('/brands', isAuth(), brandsRouter.router)
server.use('/users', isAuth(), usersRouter.router)
server.use('/auth', authRouter.router)
server.use('/cart', isAuth(), cartRouter.router)
server.use('/orders', isAuth(), ordersRouter.router)


passport.use('local',new LocalStrategy( {usernameField:'email'},
   async function(email, password, done) {
        try {
            const user = await User.findOne(
              { email: email },
            ).exec();
            if (!user) {
              done(null,false,{ message: 'no such user email'});
          }

            crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', async function (err, hashedPassword) {

            console.log({user})
            if (crypto.timingSafeEqual(user.password, hashedPassword)) {
              const token = jwt.sign(sanitizeUser(user), SECRET_KEY);
              done(null,sanitizeUser(user));
            } else {
              done(null,false,{ message: 'invalid credentials' });
            }})
          } catch (err) {
            done(err);
          }
    }
  ));


  passport.use('jwt',new JwtStrategy(opts, async function(jwt_payload, done) {
    try{
      const user = await User.findById(jwt_payload.id);
     
        if (user) {
            return done(null, sanitizeUser(user));
        } else {
            return done(null, false);
            // or you could create a new account
        }}
        catch(err){
          return done(err,false);
        }
}));


  passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, {
        id: user.id,
        role:user.role
      });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });


  // payment


// This is your test secret API key.
const stripe = require("stripe")('sk_test_51OHvRgSIiPYAQKAunGfnlLXfuums3GhiqwbYM9ULCiyfScNA9FKa8vLgGRrNSTZdihjbj4tXbN66xXmexRJmC1Wf00PhIfYxeJ');


server.post("/create-payment-intent", async (req, res) => {
  const { totalAmount } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount*100,
    currency: "inr",
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

//WebHook


const endpointSecret = "whsec_2a29c983200283cd68b2cda1ab64c1e31eb608925c08de9bb0bda8cab3ffa271";

server.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      // Then define and call a function to handle the event payment_intent.succeeded
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});


main().catch(err=> console.log(err));

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/ecommerce');
    console.log('database connected')
}

server.get('/',(req, res)=>{
    res.json({status:'success'})
})



server.listen(8080, ()=>{
    console.log('server started')
})
