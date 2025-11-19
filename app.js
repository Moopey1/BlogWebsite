const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const hljs = require('highlight.js');
const md = require('markdown-it')({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre><code class="hljs">' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>';
      } catch (__) {}
    }

    return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});
const app = express();
const port = 3000;

const cardDataPath = path.join(__dirname, 'cardData.json');

const loadCardData = () => {
  try {
    return JSON.parse(fs.readFileSync(cardDataPath, 'utf8'));
  } catch (err) {
    console.error('Failed to load cardData.json:', err);
    return [];
  }
}

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
    cardData: loadCardData()
  });
});

// Sorts blog cards by tag from the URL parameter and renders the filtered list on the homepage.
const cardSorter = (req, res, next) => {
  const sortedArray = [];
  const parsedTag = req.params.param.split('=')[1];
  const cardData = loadCardData();
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
}

// Loads a markdown blog post based on the URL parameter, parses frontmatter, and renders it as HTML.
const mdLoader = (req, res, next) => {
  const cardData = loadCardData();
  const blog = cardData.find(b => b.url === req.params.param);
  if (!blog) {
    res.status(404).render('notFound');
    return;
  }

  const file = matter.read(__dirname + '/blogs/' + req.params.param + '.md');  
  let content = file.content;
  const result = md.render(content);
  // console.log('result in mdLoader: ' + result);

  res.render('blogPage', {
    post: result,
    title: blog.title,
    description: blog.summary
  });
  next();
}

// Checks if the URL parameter is a tag or a blog post, and calls the appropriate handler.
const checker = (req, res, next) => {
  if (req.params.param.includes('tag')) {
    cardSorter(req, res, next);
  } else {
    mdLoader(req, res, next);
  }
}

app.get('/:param', checker, (req, res) => {
  console.log(req.params.param);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});