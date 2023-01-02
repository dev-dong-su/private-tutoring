require('./src/config/conn');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { swaggerUi, specs } = require('./src/docs/docs.swagger');
const { connect } = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(fileUpload());
app.use(cors());

app.use(express.static(path.join(__dirname, '/uploads')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const authRoute = require('./src/routes/auth.routes');
const fileRoute = require('./src/routes/file.routes');
const userRoute = require('./src/routes/user.routes');

app.use('/user', userRoute);
app.use('/file', fileRoute);
app.use('/auth', authRoute);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/src/view/serverRunning.html'));
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log('Server is Running on ' + port);
});
