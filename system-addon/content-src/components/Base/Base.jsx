import {actionCreators as ac, actionTypes as at} from "common/Actions.jsm";
import {addLocaleData, injectIntl, IntlProvider} from "react-intl";
import {ConfirmDialog} from "content-src/components/ConfirmDialog/ConfirmDialog";
import {connect} from "react-redux";
import {ErrorBoundary} from "content-src/components/ErrorBoundary/ErrorBoundary";
import {ManualMigration} from "content-src/components/ManualMigration/ManualMigration";
import {MessageCenterAdmin} from "content-src/components/MessageCenterAdmin/MessageCenterAdmin";
import {PrerenderData} from "common/PrerenderData.jsm";
import React from "react";
import {Search} from "content-src/components/Search/Search";
import {Sections} from "content-src/components/Sections/Sections";

const PrefsButton = injectIntl(props => (
  <div className="prefs-button">
    <button className="icon icon-settings" onClick={props.onClick} title={props.intl.formatMessage({id: "settings_pane_button_label"})} />
  </div>
));

// Add the locale data for pluralization and relative-time formatting for now,
// this just uses english locale data. We can make this more sophisticated if
// more features are needed.
function addLocaleDataForReactIntl(locale) {
  addLocaleData([{locale, parentLocale: "en"}]);
}

export class _Base extends React.PureComponent {
  componentWillMount() {
    const {App, locale} = this.props;
    this.sendNewTabRehydrated(App);
    addLocaleDataForReactIntl(locale);
  }

  componentDidMount() {
    // Request state AFTER the first render to ensure we don't cause the
    // prerendered DOM to be unmounted. Otherwise, NEW_TAB_STATE_REQUEST is
    // dispatched right after the store is ready.
    if (this.props.isPrerendered) {
      this.props.dispatch(ac.AlsoToMain({type: at.NEW_TAB_STATE_REQUEST}));
      this.props.dispatch(ac.AlsoToMain({type: at.PAGE_PRERENDERED}));
    }
  }

  componentWillUpdate({App}) {
    this.sendNewTabRehydrated(App);
  }

  // The NEW_TAB_REHYDRATED event is used to inform feeds that their
  // data has been consumed e.g. for counting the number of tabs that
  // have rendered that data.
  sendNewTabRehydrated(App) {
    if (App && App.initialized && !this.renderNotified) {
      this.props.dispatch(ac.AlsoToMain({type: at.NEW_TAB_REHYDRATED, data: {}}));
      this.renderNotified = true;
    }
  }

  render() {
    const {props} = this;
    const {App, locale, strings} = props;
    const {initialized} = App;

    if (props.Prefs.values.messageCenterExperimentEnabled && window.location.hash === "#message-center-admin") {
      return (<MessageCenterAdmin />);
    }

    if (!props.isPrerendered && !initialized) {
      return null;
    }

    return (<IntlProvider locale={locale} messages={strings}>
        <ErrorBoundary className="base-content-fallback">
          <BaseContent {...this.props} />
        </ErrorBoundary>
      </IntlProvider>);
  }
}

export class BaseContent extends React.PureComponent {
  constructor(props) {
    super(props);
    this.openPreferences = this.openPreferences.bind(this);
  }

  openPreferences() {
    this.props.dispatch(ac.OnlyToMain({type: at.SETTINGS_OPEN}));
    this.props.dispatch(ac.UserEvent({event: "OPEN_NEWTAB_PREFS"}));
  }

  // XXX turn me into a functional component?
  render() {
    const {props} = this;
    const {App, Theme} = props;
    const {initialized} = App;
    const prefs = props.Prefs.values;

    const shouldBeFixedToTop = PrerenderData.arePrefsValid(name => prefs[name]);

    const outerClassName = [
      "outer-wrapper",
      Theme.className,
      shouldBeFixedToTop && "fixed-to-top",
      prefs.enableWideLayout ? "wide-layout-enabled" : "wide-layout-disabled"
    ].filter(v => v).join(" ");

    return (
        <div className={outerClassName}>
          <main>
            {prefs.showSearch &&
              <div className="non-collapsible-section">
                <ErrorBoundary>
                  <Search />
                </ErrorBoundary>
              </div>
            }
            <div className={`body-wrapper${(initialized ? " on" : "")}`}>
              {!prefs.migrationExpired &&
                <div className="non-collapsible-section">
                  <ManualMigration />
                </div>
                }
              <Sections />
              <PrefsButton onClick={this.openPreferences} />
            </div>
            <ConfirmDialog />
          </main>
        </div>);
  }
}

export const Base = connect(state => ({App: state.App, Prefs: state.Prefs, Theme: state.Theme}))(_Base);
