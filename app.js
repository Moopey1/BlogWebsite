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

const blogsPath = path.join(__dirname, 'blogs');
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.engine('html', require('ejs').__express);

app.set('view engine', 'html');

const matter = require('gray-matter');

// Turns a filename slug into a readable fallback title when frontmatter has no title.
const toTitleCase = (slug) => {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Supports both the existing DD-MM-YYYY dates and normal Date.parse-compatible strings.
const parseBlogDate = (date) => {
  if (!date) {
    return 0;
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
    const [day, month, year] = date.split('-');
    return new Date(`${year}-${month}-${day}`).getTime();
  }

  return new Date(date).getTime() || 0;
}

// Builds homepage card data from markdown frontmatter so cardData.json is no longer manual work.
const loadCardData = () => {
  try {
    return fs.readdirSync(blogsPath)
      .filter((fileName) => fileName.endsWith('.md'))
      .map((fileName) => {
        const url = path.basename(fileName, '.md');
        const file = matter.read(path.join(blogsPath, fileName));
        const data = file.data;

        // URL comes from filename: blogs/my-post.md becomes /my-post.
        return {
          title: data.title || toTitleCase(url),
          tags: Array.isArray(data.tags) ? data.tags : [],
          date: data.date || '',
          summary: data.summary || data.description || '',
          url: url
        };
      })
      .sort((a, b) => parseBlogDate(b.date) - parseBlogDate(a.date));
  } catch (err) {
    console.error('Failed to load blog metadata:', err);
    return [];
  }
}

const getYear = () => {
  const date = new Date();
  return date.getFullYear();
}

app.get('/', (req, res) => {
  res.render('home', {
    cardData: loadCardData(),
    year: getYear()
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
    year: getYear(),
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

  // Read same markdown file again for the post body; gray-matter strips frontmatter.
  const file = matter.read(__dirname + '/blogs/' + req.params.param + '.md');  
  let content = file.content;
  const result = md.render(content);
  // console.log('result in mdLoader: ' + result);

  res.render('blogPage', {
    year: getYear(),
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
  console.log(`Blog listening on port ${port}`);
});