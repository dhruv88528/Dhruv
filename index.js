import express from 'express';
import dbconnection from './config/dbconfig.js';
import authRoutes from './routes/authRoutes.js';
import dotenv from 'dotenv';
import cors from 'cors';

const app = express();
app.use(express.json());

dbconnection();
app.get('/', (req, res) => res.send("API Working"));
app.use("/api/auth", authRoutes);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});