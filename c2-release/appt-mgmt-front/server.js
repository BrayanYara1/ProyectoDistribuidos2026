const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 80;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Frontend Servidor Web corriendo en puerto ${PORT}`);
  });
}

module.exports = app;
