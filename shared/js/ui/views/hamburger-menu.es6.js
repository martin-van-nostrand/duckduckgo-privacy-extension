const Parent = window.DDG.base.View
const openOptionsPage = require('./mixins/open-options-page.es6.js')

function HamburgerMenu (ops) {
  this.model = ops.model
  this.template = ops.template
  Parent.call(this, ops)

  this._setup()
}

HamburgerMenu.prototype = window.$.extend({},
  Parent.prototype,
  openOptionsPage,
  {

    _setup: function () {
      this._cacheElems('.js-hamburger-menu', [
        'close',
        'options-link'
      ])
      this.bindEvents([
        [this.$close, 'click', this._closeMenu],
        [this.$optionslink, 'click', this.openOptionsPage],
        [this.model.store.subscribe, 'action:search', this._handleAction],
        [this.model.store.subscribe, 'change:site', this._handleSiteUpdate]
      ])
    },

    _handleAction: function (notification) {
      if (notification.action === 'burgerClick') this._openMenu()
    },

    _openMenu: function (e) {
      this.$el.removeClass('is-hidden')
    },

    _closeMenu: function (e) {
      if (e) e.preventDefault()
      this.$el.addClass('is-hidden')
    },

    _handleSiteUpdate: function (notification) {
      if (notification && notification.change.attribute === 'tab') {
        this.model.tabUrl = notification.change.value.url
        this._rerender()
        this._setup()
      }
    }
  }
)

module.exports = HamburgerMenu
