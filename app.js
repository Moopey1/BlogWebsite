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

  console.log('Rendering home page with card data:', cardData);
});

app.get('/:blog', (req, res) => {
  console.log(req.params);
  const blogWithoutQuotes = JSON.stringify(req.params.blog).replace(/"/g, '');
  res.render('blogPage', {
    blog: blogWithoutQuotes
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});