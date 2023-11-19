import express from 'express';
import cors from 'cors';
import { productRoutes } from './routes/products.js';
import * as dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(productRoutes);

const port = process.env.PORT;

app.listen(port, ()=> {
    console.log(`Server is running on ${port}`);
})
