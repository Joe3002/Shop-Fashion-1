import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '.env') })
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRoute from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import authRoute from './routes/authRoute.js'
import categoryRouter from './routes/categoryRoute.js'


//App config

const app = express()
const port = process.env.PORT || 4000 
connectDB()
connectCloudinary()

//middlewares

app.use(express.json())
app.use(cors())

// debug: log mọi request
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`)
  next()
})

//api
app.use('/api/user',userRoute)
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/order',orderRouter)
app.use('/api/auth', authRoute)
app.use('/api/category', categoryRouter)


// Route test để kiểm tra luồng Express
app.post('/api/test', (req, res) => {
  console.log('Test route hit', req.body);
  res.json({ ok: true });
});

app.post('/api/auth/google-test', (req, res) => {
  console.log('debug body', req.body)
  res.json({ ok: true })
})

app.get('/',(req,res)=>{
    res.send("HELLO")
})

app.listen(port,()=> console.log('Server started on PORT:' + port))