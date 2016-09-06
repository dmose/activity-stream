const React = require("react");
const {connect} = require("react-redux");
const {selectNewTabSites} = require("selectors/selectors");
const TopSites = require("components/TopSites/TopSites");
const GroupedActivityFeed = require("components/ActivityFeed/ActivityFeed");
const Spotlight = require("components/Spotlight/Spotlight");
const Search = require("components/Search/Search");
const Loader = require("components/Loader/Loader");
const ContextMenu = require("components/ContextMenu/ContextMenu");
const {actions} = require("common/action-manager");
const {Link} = require("react-router");
const setFavicon = require("lib/set-favicon");
const classNames = require("classnames");
const PAGE_NAME = "NEW_TAB";

const {MAX_TOP_ACTIVITY_ITEMS} = require("common/constants");

const NewTabPage = React.createClass({
  getInitialState() {
    return {
      showSettingsMenu: false,
      renderedOnce: false,
      showRecommendations: true
    };
  },
  toggleRecommendation() {
    this.props.dispatch(actions.NotifyEvent({
      event: "TOGGLE_RECOMMENDATION",
      page: PAGE_NAME,
      showRecommendations: !this.state.showRecommendations
    }));
    this.props.dispatch(actions.NotifyToggleRecommendations());
    this.props.dispatch(actions.RequestHighlightsLinks());
    this.setState({showRecommendations: !this.state.showRecommendations});
  },
  componentDidMount() {
    document.title = "New Tab";
    setFavicon("newtab-icon.svg");
  },
  componentWillReceiveProps(nextProps) {
    if (nextProps.isReady && !this.state.renderedOnce) {
      this.props.dispatch(actions.NotifyPerf("NEWTAB_RENDER"));
      this.setState({renderedOnce: true});
    }
  },
  render() {
    const props = this.props;
    const recommendationLabel = "Show Trending Highlights";
    const recommendationIcon = props.Spotlight.recommendationShown ? "check" : "   ";
    const showRecommendationOption = props.showRecommendationOption;

    // XXX forcibly add # on the server side so that it makes the # added on the
    // client side by react-router's createHref() to make pre-rendered and
    // dynamically rendered html completely identical so that React doesn't try
    // to go to heroical measures to fix things up and (presumably) slow down
    // the pre-render.  If we decide to stick with this hack, we need to be
    // sure it's not necessary for any other <Link>s in the code.
    //
    // See https://github.com/reactjs/react-router/issues/2111 and
    // http://stackoverflow.com/questions/27928372/react-router-urls-dont-work-when-refreshing-or-writting-manually
    // for some relevant info.
    let debugLinkTo;
    let timelineLinkTo;
    if (PRERENDER) {
      debugLinkTo = "#/debug";
      timelineLinkTo = "#/timeline";
    } else {
      debugLinkTo = "/debug";
      timelineLinkTo = "/timeline";
    }

    return (<main className="new-tab">
      <div className="new-tab-wrapper">
        <section>
          <Search />
        </section>

        <Loader
          className="loading-notice"
          show={!this.props.isReady}
          label="Hang on tight! We are analyzing your history to personalize your experience"
          centered={true} />

        <div className={classNames("show-on-init", {on: this.props.isReady})}>
          <section>
            <TopSites page={PAGE_NAME} sites={props.TopSites.rows} />
          </section>

          <section>
            <Spotlight page={PAGE_NAME} showRating={props.Spotlight.metadataRating} sites={props.Spotlight.rows} />
          </section>

          <section>
            <h3 ref="title" className="section-title">Recent Activity</h3>
            <GroupedActivityFeed sites={props.TopActivity.rows} length={MAX_TOP_ACTIVITY_ITEMS} page={PAGE_NAME}
                                 maxPreviews={1} />
          </section>

          <section className="bottom-links-container">
            <Link className="bottom-link" to={timelineLinkTo}>
              <span className="icon icon-spacer icon-activity-stream" /> See all activity
            </Link>
            <span className="link-wrapper-right">
              <a
                ref="settingsLink"
                hidden={!showRecommendationOption}
                className={classNames("bottom-link expand", {active: this.state.showSettingsMenu})}
                onClick={() => this.setState({showSettingsMenu: !this.state.showSettingsMenu})} >
                  <span className="icon icon-spacer icon-settings" /> <span className="text">Settings</span>
              </a>
              <ContextMenu
                ref="settingsMenu"
                visible={this.state.showSettingsMenu}
                onUpdate={showSettingsMenu => this.setState({showSettingsMenu})}
                options={[
                  {icon: recommendationIcon, label: recommendationLabel, onClick: this.toggleRecommendation}
                ]} />
            </span>
          </section>
        </div>
      </div>

      <Link className="debug-link" to={debugLinkTo}>debug</Link>
    </main>);
  }
});

NewTabPage.propTypes = {
  TopSites: React.PropTypes.object.isRequired,
  Spotlight: React.PropTypes.object.isRequired,
  TopActivity: React.PropTypes.object.isRequired,
  dispatch: React.PropTypes.func.isRequired
};

module.exports = connect(selectNewTabSites)(NewTabPage);
module.exports.NewTabPage = NewTabPage;
