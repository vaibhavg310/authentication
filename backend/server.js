const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoute = require('./routes/userRoute');
const errorHandler = require('./middleWare/errorMiddleWare');

const app = express();

const PORT = process.env.PORT;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false  }));
app.use(bodyParser.json())


// Routes Middlewares
app.use('/api/users', userRoute); 

//Routes
app.get('/', (req, res) => {
    res.send('Home Page');
});

//Error Middleware
app.use(errorHandler);

// Connect  to DB and start server

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port: ${PORT}`);
        });
    })
    .catch((error) => {
        console.log(error.message);
    }
    ) 
