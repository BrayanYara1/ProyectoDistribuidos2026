const createGatewayApp = require('./routes');

const PORT = process.env.PORT || 8080;
const app = createGatewayApp();

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`API Gateway corriendo en puerto ${PORT}`);
  });
}

module.exports = app;
