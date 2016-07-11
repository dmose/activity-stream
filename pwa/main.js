// const PwaActivityStreams = require("pwa/PwaActivityStreams");

const React = require("react");
const ReactDOM = require("react-dom");
const {Provider} = require("react-redux");

const Routes = require("components/Routes/Routes");
const store = require("content-src/store");

require("lib/shim")();

// new PwaActivityStreams();
const Root = React.createClass({
  render() {
    return (<Provider store={store}>
      <Routes />
    </Provider>);
  }
});

ReactDOM.render(<Root />, document.getElementById("root"));
