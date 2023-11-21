const express = require('express');
const server = express();
const mongoose = require('mongoose');
const productsRouters = require('./routes/Product');
const brandsRouters = require('./routes/Brand');
const categoriesRouters = require('./routes/Category');
const cors = require('cors');

server.use(cors({
    exposedHeaders:['X-Total-Count']
}));


server.use(express.json());

server.use('/products',productsRouters.router)
server.use('/brands',brandsRouters.router)
server.use('/categories',categoriesRouters.router)

main().catch((err)=>console.log(err))

async function main(){
await mongoose.connect('mongodb://127.0.0.1:27017/ecommerce');
console.log('database connected');
}


server.get('/',(req,res)=>{
    res.json({status:'success'})
})



server.listen(8080,()=>{
console.log("Server is started on port 8080");
});