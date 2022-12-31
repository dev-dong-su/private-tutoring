require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const apiRouter = require('./routes/api');

const app = express();
const port = process.env.PROT || 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('DB connect success'))
  .catch(error => console.log(error));

app.use('/api/', apiRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
