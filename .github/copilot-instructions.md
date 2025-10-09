# Copilot Instructions for BlogWebsite

## Project Overview
This is a simple Node.js/Express web application serving static blog content. The main entry point is `app.js`, which configures Express to serve files from the `public/` directory. The site currently consists of static HTML files styled with embedded CSS.

## Architecture & Data Flow
- **Express Server (`app.js`)**: Serves static files from the `public/` directory. No dynamic routing or API endpoints are currently implemented.
- **Static Content**: All user-facing pages are HTML files in `public/`. Example files: `index.html` (main page), `firstBlog.html` (blog post), and assets like `foto.jpg`.
- **No Database**: There is no backend data storage or dynamic content generation at present.

## Developer Workflows
- **Start Server**: Run `node app.js` from the project root. The server listens on port 3000 by default.
- **Dependencies**: Managed via `package.json`. Key dependencies: `express` (web server), `ejs` (not currently used in code).
- **Testing**: No test framework or scripts are set up. The default `npm test` command is a placeholder.
- **Static Assets**: Place all HTML, CSS, JS, and image files in the `public/` directory for serving.

## Project-Specific Conventions
- **Styling**: CSS is embedded directly in HTML files. No external stylesheets or CSS frameworks are used.
- **Routing**: Only static file serving is enabled. To add new pages, create new HTML files in `public/`.
- **Port**: The server runs on port 3000. Change the `port` variable in `app.js` to modify.
- **Unused Dependencies**: `ejs` is listed in `package.json` but not used in code. Remove if unnecessary.

## Integration Points
- **Express Middleware**: Only `express.static` is used. No custom middleware or API endpoints.
- **No External APIs**: The app does not communicate with external services.

## Examples
- To add a new blog post, create a new HTML file in `public/` and link it from `index.html`.
- To change the homepage, edit `public/index.html`.
- To update server behavior, modify `app.js`.

## Key Files
- `app.js`: Express server setup
- `public/index.html`: Main landing page
- `public/firstBlog.html`: Example blog post
- `package.json`: Dependency management

---

**For AI agents:**
- Focus on static site generation and Express configuration.
- No dynamic data or user authentication is present.
- Follow the pattern of serving static files for new content.
- If adding dynamic features, document new endpoints and update this file.
