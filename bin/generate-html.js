"use strict";

// console.error("process.cwd()", process.cwd());
// const path = require("path");
// const absolute = relPath => path.join(__dirname, relPath);

const React = require("react");
const ReactDOMServer = require("react-dom/server");
const store = require("../content-src/store.js");

const {Provider} = require("react-redux");
const Routes = require("components/Routes/Routes");
const defaults = {
  baseUrl: "",
  title: "Loading...",
  csp: "on"
};

function template(rawOptions) {
  const options = Object.assign({}, defaults, rawOptions || {});
  const csp = options.csp === "on" ?
    "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; script-src 'self'; img-src http: https: data:; style-src 'self' 'unsafe-inline'; child-src 'self' https://*.youtube.com https://*.vimeo.com; frame-src 'self' https://*.youtube.com https://*.vimeo.com\">" :
    "";

  console.error("before createClass");
  const Root = React.createClass({
    render() {
      // return (
      //   React.createElement("Provider", {store},
      //     React.createElement("Routes")
      //   ));

      return (
        <Provider store={store}>
          <Routes />
        </Provider>
      );
    }
  });

  console.error("before string render");
  const preRenderedContent = ReactDOMServer.renderToString(React.createElement(Root));

  console.error("before return");
  return `<!doctype html>
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
`;
}

module.exports = template;

if (require.main === module) {
  // called from command line
  const args = require("minimist")(process.argv.slice(2), {alias: {baseUrl: "b", title: "t"}});
  process.stdout.write(template(args));
}
