const {CONTENT_TO_ADDON} = require("common/event-constants");
const {ADDON_TO_CONTENT} = require("common/event-constants");

function dispatch(action) {
  window.dispatchEvent(
    new CustomEvent(ADDON_TO_CONTENT, {detail: action})
  );
}

module.exports = class PwaActivityStreams {
	constructor() {
		this._setupActionListeners();
	}

  _setupActionListeners() {
    window.addEventListener(CONTENT_TO_ADDON, (event) => {
      const action = JSON.parse(event.detail);
      switch (action.type) {
        case "TOP_FRECENT_SITES_REQUEST":
          this._topFrecentSites(action);
          break;
        case "RECENT_BOOKMARKS_REQUEST":
          this._recentBookmarks(action);
          break;
        case "RECENT_LINKS_REQUEST":
          this._recentLinks(action);
          break;
        case "HIGHLIGHTS_LINKS_REQUEST":
          this._highlightsLinks(action);
          break;
        case "NOTIFY_HISTORY_DELETE":
          this._historyDelete(action);
          break;
        case "NOTIFY_BOOKMARK_ADD":
          this._bookmarkAdd(action);
          break;
        case "NOTIFY_BOOKMARK_DELETE":
          this._bookmarkDelete(action);
          break;
        case "NOTIFY_BLOCK_URL":
          this._blockUrl(action);
          break;
        case "NOTIFY_UNBLOCK_ALL":
          this._unblockAll(action);
          break;
        case "NOTIFY_OPEN_WINDOW":
          this._openNewWindow(action);
          break;
        case "SEARCH_SUGGESTIONS_REQUEST":
          this._searchSuggestions(action);
          break;
        case "NOTIFY_PERFORM_SEARCH":
          this._performSearch(action);
          break;
        case "SEARCH_STATE_REQUEST":
          this._searchState();
          break;
      }
    }, false);
  }

  _topFrecentSites(action) {
    const rows = [];
    dispatch({type: "TOP_FRECENT_SITES_RESPONSE", data:rows});
  }

  _recentBookmarks(action) {
    const rows = [];
    dispatch({type: "RECENT_BOOKMARKS_RESPONSE", data: rows});
  }

  _recentLinks(action) {
    const rows = [];
    dispatch({type: "RECENT_LINKS_RESPONSE", data: rows});
  }

  _highlightsLinks(action) {
    const rows = [];
    dispatch({type: "HIGHLIGHTS_LINKS_RESPONSE", data: rows});
  }

  _blockUrl(action) {
    // TODO
  }

  _unblockAll(action) {
    // TODO
  }

  _historyDelete(action) {
    // TODO
  }

  _bookmarkAdd(action) {
    // TODO
  }

  _bookmarkDelete(action) {
    // TODO
  }

  _openNewWindow(action) {
    // TODO
  }

  _searchState() {
    // TODO
  }

  _searchSuggestions(action) {
    // TODO
  }

  _performSearch(action) {
    // TODO
  }
};

