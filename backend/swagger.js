const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Gift Store API',
    description: 'Auto-generated API documentation',
  },
  host: 'localhost:5000', // Update port to match your app
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Enter JWT Token as: Bearer <your_token>',
    },
  },
};

const outputFile = './swagger-output.json';
const routes = ['./app.js']; // Points to your main server entry point

// Generate docs first, then optional script execution
swaggerAutogen(outputFile, routes, doc);