const React = require("react");
const ReactDOM = require("react-dom");
const {Provider} = require("react-redux");
const Base = require("components/Base/Base");
const createStore = require("common/create-store");
const {ADDON_TO_CONTENT, CONTENT_TO_ADDON} = require("common/event-constants");
const Raven = require("raven-js");

function dataCallback(data) {
  // if (data.exception.values && data.exception.values instanceof Array) {
  //   data.exception.values.forEach((currentValue, index, array) => {
  //
  //   });
  // }
}

// Do this first so all possible subsequent errors are captured and sent
const ravenOptions = {
  environment: ENV, // defined by webpack
  dataCallback
};
Raven.config(__CONFIG__.SENTRY_DSN, ravenOptions).install();

const store = createStore({
  incoming: ADDON_TO_CONTENT,
  outgoing: CONTENT_TO_ADDON,
  logger: __CONFIG__.LOGGING,
  rehydrate: true
});

const Root = React.createClass({
  render() {
    return (<Provider store={store}>
      <Base />
    </Provider>);
  }
});

function renderRootWhenAddonIsReady() {
  if (window.navigator.activity_streams_addon || __CONFIG__.USE_SHIM) {
    ReactDOM.render(<Root />, document.getElementById("root"));
  } else {
    // If the content bridge to the addon isn't set up yet, try again soon.
    setTimeout(renderRootWhenAddonIsReady, 50);
  }
}

renderRootWhenAddonIsReady();
