/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

ChromeUtils.defineModuleGetter(this, "DOMLocalization",
  "resource://gre/modules/DOMLocalization.jsm");
ChromeUtils.defineModuleGetter(this, "FxAccounts",
  "resource://gre/modules/FxAccounts.jsm");
ChromeUtils.defineModuleGetter(this, "Services",
  "resource://gre/modules/Services.jsm");

class _BookmarkPanelHub {
  constructor() {
    this._id = "BookmarkPanelHub";
    this._trigger = {id: "bookmark-panel"};
    this._handleMessageRequest = null;
    this._addImpression = null;
    this._initalized = false;
    this._response = null;
    this._l10n = null;

    this.messageRequest = this.messageRequest.bind(this);
    this.toggleRecommendation = this.toggleRecommendation.bind(this);
  }

  /**
   * @param {function} handleMessageRequest
   * @param {function} addImpression
   */
  init(handleMessageRequest, addImpression) {
    this._handleMessageRequest = handleMessageRequest;
    this._addImpression = addImpression;
    this._l10n = new DOMLocalization([
      "browser/branding/sync-brand.ftl",
      "browser/newtab/asrouter.ftl",
    ]);
    this._initalized = true;
  }

  uninit() {
    this._l10n = null;
    this._initalized = false;
    this._handleMessageRequest = null;
    this._addImpression = null;
    this._response = null;
  }

  /**
   * Checks if a similar cached requests exists before forwarding the request
   * to ASRouter. Caches only 1 request, unique identifier is `request.url`.
   * Caching ensures we don't duplicate requests and telemetry pings.
   * Return value is important for the caller to know if a message will be
   * shown.
   *
   * @returns {obj|null} response object or null if no messages matched
   */
  async messageRequest(target, win) {
    if (this._response && this._response.url === target.url) {
      return this.onResponse(this._response, target, win);
    }

    const response = await this._handleMessageRequest(this._trigger);

    return this.onResponse(response, target, win);
  }

  /**
   * If the response contains a message render it and send an impression.
   * Otherwise we remove the message from the container.
   */
  onResponse(response, target, win) {
    this._response = {
      ...response,
      target,
      win,
      url: target.url,
    };

    if (response && response.content) {
      this.showMessage(response.content, target, win);
      this.sendImpression();
    } else {
      this.hideMessage(target);
    }

    target.infoButton.disabled = !response;

    return !!response;
  }

  showMessage(message, target, win) {
    const createElement = elem => target.document.createElementNS("http://www.w3.org/1999/xhtml", elem);

    if (!target.container.querySelector("#cfrMessageContainer")) {
      const recommendation = createElement("div");
      recommendation.setAttribute("id", "cfrMessageContainer");
      recommendation.addEventListener("click", async e => {
        target.hidePopup();
        const url = await FxAccounts.config.promiseEmailFirstURI("bookmark");
        win.ownerGlobal.openLinkIn(url, "tabshifted", {
          private: false,
          triggeringPrincipal: Services.scriptSecurityManager.createNullPrincipal({}),
          csp: null,
        });
      });
      recommendation.style.color = message.color;
      recommendation.style.background = `-moz-linear-gradient(-45deg, ${message.background_color_1} 0%, ${message.background_color_2} 70%)`;
      const close = createElement("a");
      close.setAttribute("id", "cfrClose");
      close.setAttribute("aria-label", "close");
      this._l10n.setAttributes(close, message.close_button.tooltiptext);
      close.addEventListener("click", target.close);
      const title = createElement("h1");
      title.setAttribute("id", "editBookmarkPanelRecommendationTitle");
      this._l10n.setAttributes(title, message.title);
      const content = createElement("p");
      content.setAttribute("id", "editBookmarkPanelRecommendationContent");
      this._l10n.setAttributes(content, message.text);
      const cta = createElement("button");
      cta.setAttribute("id", "editBookmarkPanelRecommendationCta");
      this._l10n.setAttributes(cta, message.cta);
      recommendation.appendChild(close);
      recommendation.appendChild(title);
      recommendation.appendChild(content);
      recommendation.appendChild(cta);
      this._l10n.translateElements([...recommendation.children]);
      target.container.appendChild(recommendation);
    }

    this.toggleRecommendation(true);
  }

  toggleRecommendation(visible) {
    const {target} = this._response;
    target.infoButton.checked = visible !== undefined ? !!visible : !target.infoButton.checked;
    if (target.infoButton.checked) {
      target.recommendationContainer.removeAttribute("disabled");
    } else {
      target.recommendationContainer.setAttribute("disabled", "disabled");
    }
  }

  hideMessage(target) {
    const container = target.container.querySelector("#cfrMessageContainer");
    if (container) {
      container.remove();
    }
    this.toggleRecommendation(false);
  }

  _forceShowMessage(message) {
    this.showMessage(message.content, this._response.target, this._response.win);
    this._response.target.infoButton.disabled = false;
  }

  sendImpression() {
    this._addImpression(this._response);
  }
}

this._BookmarkPanelHub = _BookmarkPanelHub;

/**
 * BookmarkPanelHub - singleton instance of _BookmarkPanelHub that can initiate
 * message requests and render messages.
 */
this.BookmarkPanelHub = new _BookmarkPanelHub();

const EXPORTED_SYMBOLS = ["BookmarkPanelHub", "_BookmarkPanelHub"];