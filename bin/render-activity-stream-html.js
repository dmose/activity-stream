 /* eslint-disable no-sync */
const fs = require("fs");
const path = require("path");

const BASE_FILE_PATH = path.resolve(__dirname, "../system-addon/data/content/");

// Note: this file is generated by webpack from system-addon/content-src/activity-stream-prerender.jsx
const prerender = require("./prerender");

const DEFAULT_OPTIONS = {
  baseUrl: "resource://activity-stream/",
  locale: "", // TODO: pass in options.locale. For now, we're just doing empty strings.
  title: ""
};

/**
 * templateHTML - Generates HTML for activity stream, given some options and
 * prerendered HTML if necessary.
 *
 * @param  {obj} options
 *         {str} options.locale         The locale to render in lang="" attribute
 *         {str} options.direction      The language direction to render in dir="" attribute
 *         {str} options.title          The title for the <title> element
 *         {str} options.baseUrl        The base URL for all local assets
 *         {bool} options.debug         Should we use dev versions of JS libraries?
 * @param  {str} html    The prerendered HTML created with React.renderToString (optional)
 * @return {str}         An HTML document as a string
 */
function templateHTML(options, html) {
  const isPrerendered = !!html;
  const debugString = options.debug ? "-dev" : "";
  const scripts = [
    "chrome://browser/content/contentSearchUI.js",
    `${options.baseUrl}vendor/react${debugString}.js`,
    `${options.baseUrl}vendor/react-dom${debugString}.js`,
    `${options.baseUrl}vendor/react-intl.js`,
    `${options.baseUrl}vendor/redux.js`,
    `${options.baseUrl}vendor/react-redux.js`,
    `${options.baseUrl}data/content/activity-stream.bundle.js`
  ];
  if (isPrerendered) {
    scripts.unshift(`${options.baseUrl}data/content/activity-stream-initial-state.js`);
  }
  return `<!doctype html>
<html lang="${options.locale}" dir="${options.direction}">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Security-Policy-Report-Only" content="script-src 'unsafe-inline'; img-src http: https: data: blob:; style-src 'unsafe-inline'; child-src 'none'; object-src 'none'; report-uri https://tiles.services.mozilla.com/v4/links/activity-stream/csp">
    <title>${options.title}</title>
    <link rel="icon" type="image/png" id="favicon" href="chrome://branding/content/icon32.png"/>
    <link rel="stylesheet" href="chrome://browser/content/contentSearchUI.css" />
    <link rel="stylesheet" href="${options.baseUrl}data/content/activity-stream.css" />
  </head>
  <body class="activity-stream">
    <div id="root">${isPrerendered ? html : ""}</div>
    <div id="snippets-container">
      <div id="snippets"></div>
    </div>
    <script>
// Don't directly load the following scripts as part of html to let the page
// finish loading to render the content sooner.
for (const src of ${JSON.stringify(scripts, null, 2)}) {
  // These dynamically inserted scripts by default are async, but we need them
  // to load in the desired order (i.e., bundle last).
  const script = document.body.appendChild(document.createElement("script"));
  script.async = false;
  script.src = src;
}
    </script>
  </body>
</html>
`;
}

/**
 * templateJs - Generates a js file that passes the initial state of the prerendered
 * DOM to the React version. This is necessary to ensure the checksum matches when
 * React mounts so that it can attach to the prerendered elements instead of blowing
 * them away.
 *
 * Note that this may no longer be necessary in React 16 and we should review whether
 * it is still necessary.
 *
 * @param  {obj} state  The
 * @return {str}        The js file as a string
 */
function templateJs(state) {
  return `// Note - this is a generated file.
  window.gActivityStreamPrerenderedState = ${JSON.stringify(state, null, 2)};
`;
}

/**
 * main - Parses command line arguments, generates html and js with templates,
 *        and writes files to their specified locations.
 */
function main() {
  // This code parses command line arguments passed to this script.
  // Note: process.argv.slice(2) is necessary because the first two items in
  // process.argv are paths
  const args = require("minimist")(process.argv.slice(2), {
    alias: {
      baseUrl: "b",
      title: "t",
      locale: "l",
      debug: false
    }
  });

  const options = Object.assign({}, DEFAULT_OPTIONS, args || {});
  const {html, state} = prerender(options.locale);
  options.direction = state.App.textDirection;

  fs.writeFileSync(path.join(BASE_FILE_PATH, "activity-stream.html"), templateHTML(options));
  fs.writeFileSync(path.join(BASE_FILE_PATH, "activity-stream-debug.html"),
    templateHTML(Object.assign({}, options, {debug: true})));
  fs.writeFileSync(path.join(BASE_FILE_PATH, "activity-stream-prerendered.html"), templateHTML(options, html));
  fs.writeFileSync(path.join(BASE_FILE_PATH, "activity-stream-prerendered-debug.html"),
    templateHTML(Object.assign({}, options, {debug: true}), html));
  fs.writeFileSync(path.join(BASE_FILE_PATH, "activity-stream-initial-state.js"), templateJs(state));

  console.log(`Done writing html and js to ${BASE_FILE_PATH}.`); // eslint-disable-line no-console
}

main();
