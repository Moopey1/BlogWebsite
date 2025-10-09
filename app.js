const express = require('express');
const path = require('path');
const cardData = require('./cardData.json');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname + '/public')));

app.engine('html', require('ejs').__express);

app.set('view engine', 'html');

app.get('/', (req, res) => {

  res.render('home', {
    cardData: cardData
  });

});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});