const express = require('express');
const path = require('path');
const cardData = require('./cardData.json');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.engine('html', require('ejs').__express);

app.set('view engine', 'html');

const matter = require('gray-matter');

app.get('/', (req, res) => {
  res.render('home', {
    cardData: cardData
  });
});

const cardSorter = (req, res, next) => {
  const sortedArray = [];
  const parsedTag = req.params.param.split('=')[1];
  cardData.forEach((object) => {
    object.tags.forEach((tag) => {
      if (tag === parsedTag) {
        sortedArray.push(object);
      }
    });
  });

  res.render('home', {
    cardData: sortedArray
  });
  next();
};

const mdLoader = (req, res, next) => {
  const blog = cardData.find(b => b.url === req.params.param);
  if (!blog) {
    res.status(404).send("Sorry can't find that!");
  }

  const file = matter.read(__dirname + '/blogs/' + req.params.param + '.md');

  const md = require('markdown-it')();
  let content = file.content;
  const result = md.render(content);

  res.render('blogPage', {
    post: result,
    title: file.data.title,
    description: file.data.description
  });
  next();
};

const checker = (req, res, next) => {
  if (req.params.param.includes('tag')) {
    cardSorter(req, res, next);
  } else {
    mdLoader(req, res, next);
  }
};

app.get('/:param', checker, (req, res) => {
  console.log(req.params.param);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});