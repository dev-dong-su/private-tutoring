const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  swaggerDefinition: {
    info: {
      title: 'Dong-su API', version: '1.0.0',
    }, host: 'localhost:3000', basePath: '/',
  }, apis: ['./routes/*.js', './swagger/*'],
};

const specs = swaggerJsdoc(options);
module.exports = {
  swaggerUi, specs,
};