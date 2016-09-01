"use strict";

// console.error("process.cwd()", process.cwd());
// const path = require("path");
// const absolute = relPath => path.join(__dirname, relPath);

const React = require("react");
const ReactDOMServer = require("react-dom/server");
const store = require("../content-src/store.js");

const {Provider} = require("react-redux");
const {match, RouterContext} = require("react-router");
const Routes = require("components/Routes/Routes");
const defaults = {
  baseUrl: "",
  title: "Loading...",
  csp: "off"
};

let Root;

function promiseMatch() {
  return new Promise((resolve, reject) => {
    console.error("about to call match");
    // console.error(Routes.RouteList);
    match({routes: Routes.RouteList, location: "/"},
      (error, redirectLocation, renderProps) => {
        console.error("match callback called");
        console.error(error, redirectLocation, renderProps);
        if (renderProps) {
          const Root = React.createClass({
            render() {
              const content = (
                <Provider store={store}>
                  <RouterContext {...renderProps} />
                </Provider>
              );
              return content;
            }
          });
          console.error("about to resolve");
          resolve(Root);
        } else {
          console.error("this should never happen", error, redirectLocation);
          reject("this should never happen");
        }
      });
    console.error("match called");
  });
}

function promiseTemplate(rawOptions) {
  return new Promise((resolve, reject) => {
    const options = Object.assign({}, defaults, rawOptions || {});
    const csp = options.csp === "on" ?
    "<meta http-equiv=\"Content-Security-Policy\"" +
      " content=\"default-src 'none';" +
      " script-src 'self'; img-src http: https: data:;" +
      " style-src 'self' 'unsafe-inline';" +
      " child-src 'self' https://*.youtube.com https://*.vimeo.com;" +
      " frame-src 'self' https://*.youtube.com https://*.vimeo.com\">" :
    "";

    promiseMatch().then(Root => {
      console.error("Root in thenable", Root);
      const preRenderedContent = ReactDOMServer.renderToString(<Root />);
      resolve(`<!doctype html>
<html lang="en-us">
  <head>
    <meta charset="utf-8">
    ${csp}
    <title>${options.title}</title>
    <link rel="stylesheet" href="${options.baseUrl}main.css" />
    <link rel="icon" type="image/svg+xml" href="${options.baseUrl}img/newtab-icon.svg">
  </head>
  <body>
    <div id="root">${preRenderedContent}</div>
    <script src="${options.baseUrl}vendor.bundle.js"></script>
    <script src="${options.baseUrl}bundle.js"></script>
  </body>
</html>
`);
    });
  });
}

module.exports = promiseTemplate;

if (require.main === module) {
  // called from command line
  const args = require("minimist")(process.argv.slice(2), {alias: {baseUrl: "b", title: "t"}});
  promiseTemplate(args).then(html => {
    process.stdout.write(html);
  });
}
