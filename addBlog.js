// {
//         "title": "Cloudflare www. subdomain struggles",
//         "tags": ["cloudflare", "DNS", "networking"],
//         "date": "23-12-2025",
//         "summary": "Trying to get www.blog.tinuslab.nl to work was a bit of a struggle.",
//         "url": "cloudflare-subdomain-struggles"
// }

const { argv } = require('node:process');
const cardData = require('./cardData.json');

const newBlogCard = {
    title: argv[2],
    tags: [argv[3], argv[4], argv[5]],
    date : argv[6],
    summary: argv[7],
    url: argv[8]
}

cardData.unshift(newBlogCard);