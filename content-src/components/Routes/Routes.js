const React = require("react");
const {Router, Route, IndexRoute, useRouterHistory} = require("react-router");
const {connect} = require("react-redux");
const {actions} = require("common/action-manager");

// This stuff needs a DOM to work with
let customHistory;
if (!PRERENDER) {
  const {createHashHistory} = require("history");
  customHistory = useRouterHistory(createHashHistory)({queryKey: false});
}

let isFirstLoad = true;

const RouteList = (
  <Route path="/" component={require("components/Base/Base")}>
    <IndexRoute title="Home" component={require("components/NewTabPage/NewTabPage")} />
    <Route title="DebugPage" path="debug" component={require("components/DebugPage/DebugPage")} />
    <Route title="Activity Stream" path="timeline" component={require("components/TimelinePage/TimelinePage")}>
      <IndexRoute title="History" component={require("components/TimelinePage/TimelineHistory")} />
      <Route title="History" path="bookmarks" component={require("components/TimelinePage/TimelineBookmarks")} />
    </Route>
  </Route>
);

const Routes = React.createClass({
  componentDidMount() {
    this.unlisten = customHistory.listen(location => {
      this.props.dispatch(actions.NotifyRouteChange(Object.assign({}, location, {isFirstLoad})));
      if (isFirstLoad) {
        isFirstLoad = false;
      }
      window.scroll(0, 0);
    });
  },
  componentWillUnmount() {
    this.unlisten();
  },
  render() {
    let routerProps = {};
    if (!PRERENDER) {
      routerProps.history = customHistory;
    }
    return (
      <Router {...routerProps}>
        { RouteList }
      </Router>);
  }
});

module.exports = connect(() => ({}))(Routes);
module.exports.RouteList = RouteList;
