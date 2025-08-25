import express from 'express';
import dbconnection from './config/dbconfig.js';

const app = express();
app.use(express.json());

dbconnection();

// app.use('/api', )

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});