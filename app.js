const express = require('express');
const path = require('path');
const cardData = require('./cardData.json');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.engine('html', require('ejs').__express);

app.set('view engine', 'html');

const matter = require('gray-matter');

app.get('/', (req, res) => {
  res.render('home', {
    cardData: cardData
  });

  console.log('Rendering home page with card data:', cardData);
});

app.get('/:blog', (req, res) => {
  const blog = cardData.find(b => b.url === req.params.blog);
  if (!blog) {
    res.status(404).send("Sorry can't find that!");
  }
  
  const file = matter.read(__dirname + '/blogs/' + req.params.blog + '.md');
  console.log('dit is file' + file);

  const md = require('markdown-it')();
  let content = file.content;
  const result = md.render(content);

  res.render('blogPage', {
    post: result,
    title: file.data.title,
    description: file.data.description
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});