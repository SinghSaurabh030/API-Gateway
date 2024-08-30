const express=require('express');
const axios=require('axios');
const app=express();
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const {rateLimit} = require('express-rate-limit');
const PORT=3005;
const limiter = rateLimit({
	windowMs: 2 * 60 * 1000, // 15 minutes
	limit: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
});


//logger to log requests
app.use(morgan('combined'));
//limiter to limit the incomming req from same ip
app.use(limiter);
//setting up middleware for authentication before booking so first authetication is done and if done then next will
//forward the req to next middleware setup for /bookings
app.use(
  '/bookings',
  async (req,res,next)=>{
    try {
      
      const response=await axios.get('http://localhost:3000/api/v1/isAuthenticated',{
        headers:{
          'x-access-token':req.headers['x-access-token']
        }
      })
      next();
      
    } catch (error) {
      res.status(401).json({
        message:"unauthorised"
      });
    }
    
  }
);
//reverse proxy for /bookings in the url /booking will be replaced by 'http://localhost:3002/'
app.use(
    '/bookings',
    createProxyMiddleware({
      target: 'http://localhost:3002/',
      changeOrigin: true
    })
  );
app.get('/home',(req,res)=>{
    return res.json({
        message:"success"
    });
});

app.listen(PORT,()=>{
    console.log(`server started at ${PORT}`);
})