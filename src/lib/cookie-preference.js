// import dependencies
import CookieBanner from '../views/cookie-banner.html';
import CookieManagement from '../views/cookie-management.html';
import Handlebars from 'handlebars';


// return CookiePreference class
class CookiePreferenceClass {
  constructor(params) {
    this.params = params;
    this.initialized = false;
    this.hasAccepted = false;
    this.hasAccepted = this.getCookie('cookiesAccepted') ? true : false;
    this.hasAcceptedVersion = (this.getCookie('cookiesVersion') === this.params.version) ? true : false;
    this.categories = [];
    if (this.params.debug) {
      console.log('CookiePreferenceClass', this.params)
    }
    if (this.params) {
      this.init();
    }
  }

  // initialize plugin
  init() {
    const that = this;

    if (!this.initialized) {

      if (this.params.functional_enable) {
        this.categories.push('functional')
      }
      if (this.params.performance_enable) {
        this.categories.push('performance')
      }
      if (this.params.advertising_enable) {
        this.categories.push('advertising')
      }
      if (this.params.analytics_enable) {
        this.categories.push('analytics')
      }
      if (this.params.miscellaneous_enable) {
        this.categories.push('miscellaneous')
      }

      this.renderCookieContainer();

    }

    if (!this.hasAccepted || !this.hasAcceptedVersion) {
      // Render Cookie Banner if they have not previously accepted
      this.renderCookieBanner();
    }

    // or render cookie management for testing now
    this.renderCookieManagement();

    // bind global cookie management button
    document.getElementById('jscp__manageCookiesLink').onclick = function () {
      that.renderCookieManagement();
    }

    // set initialized to `true`
    this.initialized = true;
  }

  setDesign() {
    console.log(this.params);
    let root = document.documentElement;
    if (this.params.colour_bg) {
      root.style.setProperty('--jscp-bg', this.params.colour_bg);
    }
    if (this.params.colour_text) {
      root.style.setProperty('--jscp-text', this.params.colour_text);
    }
    if (this.params.colour_links) {
      root.style.setProperty('--jscp-links', this.params.colour_links);
    }
    if (this.params.colour_cta_text) {
      root.style.setProperty('--jscp-cta-text', this.params.colour_cta_text);
    }
    if (this.params.colour_cta_bg) {
      root.style.setProperty('--jscp-cta-bg', this.params.colour_cta_bg);
    }
    if (this.params.font_family) {
      root.style.setProperty('--jscp-font-family', this.params.font_family);
    }
  }

  removeDesign() {
    console.log(this.params);
    let root = document.documentElement;
    if (this.params.colour_bg) {
      root.style.removeProperty('--jscp-bg');
    }
    if (this.params.colour_text) {
      root.style.removeProperty('--jscp-text');
    }
    if (this.params.colour_links) {
      root.style.removeProperty('--jscp-links');
    }
    if (this.params.colour_cta_text) {
      root.style.removeProperty('--jscp-cta-text');
    }
    if (this.params.colour_cta_bg) {
      root.style.removeProperty('--jscp-cta-bg');
    }
    if (this.params.font_family) {
      root.style.removeProperty('--jscp-font-family');
    }
  }

  renderCookieContainer() {
    let that = this;
    let markup = document.createElement('div');
    markup.id = 'jscpDialog';
    document.body.appendChild(markup);
  }

  updateCookieContainer(markup, callback) {
    this.setDesign();
    if (markup) {
      document.getElementById('jscpDialog').innerHTML = markup;
    } else {
      document.getElementById('jscpDialog').innerHTML = '';
      document.body.style.removeProperty("overflow");
      this.removeDesign();
    }
    if (callback) {
      callback();
    }
  }

  // render entire users list
  renderCookieBanner() {
    const that = this;
    const template = Handlebars.compile(CookieBanner);
    const markup = template(that.params);
    that.updateCookieContainer(markup, function () {
      document.getElementById('jscp__manageCookies').onclick = function () {
        that.renderCookieManagement();
      }
      document.getElementById('jscp__acceptAllCookies').onclick = function () {
        that.acceptAllCookies();
      }
    });
  }

  // render entire users list
  renderCookieManagement() {
    const that = this;
    const template = Handlebars.compile(CookieManagement);
    const data = {
      translations: {
        mandatory: that.params.ui_translations_mandatory,
        accepted: that.params.ui_translations_accepted,
        declined: that.params.ui_translations_declined,
        toggle: that.params.ui_translations_toggle_cookies_cta,
        th_name: that.params.ui_translations_th_name,
        th_expires: that.params.ui_translations_th_expires,
        th_purpose: that.params.ui_translations_th_purpose,
        save_preferences_cta: that.params.ui_translations_save_preferences_cta,
        title: that.params.cookie_modal_title,
        introduction: that.params.cookie_modal_introduction
      },
      categories: [],
      primary_cta_class: that.params.primary_cta_class || 'jscp__btn jscp__btn-primary'
    };
    if (that.params.necessary_cookie_details.length > 0) {
      data.categories.push({
        name: that.params.necessary_title,
        slug: that.convertToSlug(that.params.necessary_title),
        mandatory: true,
        description: that.params.necessary_description,
        cookies: that.params.necessary_cookie_details
      })
    }
    that.categories.forEach(category => {
      data.categories.push({
        name: that.params[category + '_title'],
        slug: that.convertToSlug(that.params[category + '_title']),
        description: that.params[category + '_description'],
        cookies: that.params[category + '_cookie_details']
      })
    });

    const markup = template(data);
    that.updateCookieContainer(markup, function () {


      document.getElementById('jscp__cookie-management__modal').style.display = "block";
      document.getElementById('jscp__cookie-management__modal-backdrop').style.display = "block";
      document.body.style.setProperty("overflow", "hidden");
      setTimeout(function () {
        document.getElementById('jscp__cookie-management__modal').classList.add("show");
        document.getElementById('jscp__cookie-management__modal').focus();
        document.getElementById('jscp__cookie-management__modal-backdrop').classList.add("show");
      }, 150);

      // bind various events
      that.toggleCookieTables();
      that.setDefaultCookieRadios();
      that.updateRadioLabel();

      // save button clicked
      document.getElementById('jscp__setCookiePreferences').onclick = function () {
        that.savePreferences();
      }
      
      // close button clicked
      document.getElementById('jscp__cookie-management__close').onclick = function () {
        that.closeCookieManagement();
      }

      // escape button pressed
      document.addEventListener("keydown", function(event) {
        event = event || window.event;
        if (event.keyCode == 27) {
          that.closeCookieManagement();
        }
      });
      
    });
  }

  closeCookieManagement () {
    const that = this;
    document.getElementById('jscp__cookie-management__modal').classList.remove("show");
    document.getElementById('jscp__cookie-management__modal-backdrop').classList.remove("show");
    setTimeout(function () {
      that.updateCookieContainer(false, function () {
        document.getElementById('jscp__manageCookiesLink').focus();
      });            
    }, 150);
  }

  toggleCookieTables() {
    const toggleButtons = document.getElementsByClassName('jscp__btn-toggle');

    [].forEach.call(toggleButtons, function (toggleButtons) {
      toggleButtons.addEventListener('click', function (event) {
        const openElements = document.querySelectorAll(".jscp__btn-toggle.jscp-active");
        const currentlyActive = toggleButtons.classList.contains("jscp-active");
        console.log('openElements', openElements);
        console.log('currentlyActive', currentlyActive);
        [].forEach.call(openElements, function (openElement) {
          openElement.classList.remove("jscp-active");
          document.getElementById(openElement.getAttribute("data-target")).classList.remove("jscp-active");
        });

        if (!currentlyActive) {
          event.target.classList.add("jscp-active");
          document.getElementById(event.target.getAttribute("data-target")).classList.add("jscp-active");
        }
      });
    });
  }

  updateRadioLabel() {
    const that = this;
    const radios = document.getElementsByClassName('jscp__input-radio');
    [].forEach.call(radios, function (radio) {
      const label = document.getElementById(radio.getAttribute("id") + '-label-text');
      radio.addEventListener('change', (event) => {
        label.innerHTML = event.target.checked ? that.params.ui_translations_accepted : that.params.ui_translations_declined;
      });
      label.innerHTML = radio.checked ? that.params.ui_translations_accepted : that.params.ui_translations_declined;
    });
  }

  savePreferences() {
    const that = this;

    // set generic accepted cookie so we dont show the banner again.
    this.setCookie('cookiesAccepted', 'true');
    // set cookie version
    this.setCookie('cookiesVersion', this.params.version);

    this.categories.forEach(category => {
      console.log('cookie' + that.capitalize(category), document.querySelector('input[name="jscp-input-' + category + '"]').checked)
      that.setCookie('cookie' + that.capitalize(category), document.querySelector('input[name="jscp-input-' + category + '"]').checked);
    });

    this.reloadPage();

  }

  reloadPage() {
    window.scrollTo(0,0);
    document.location.reload(true);
  }

  setDefaultCookieRadios() {
    const that = this;

    that.categories.forEach(category => {
      if (that.getCookie('cookie' + that.capitalize(category)) === 'true') {
        document.querySelector('input[name="jscp-input-' + category + '"]').checked = true;
      }
    });
  }

  setDefaultCookieRadio(cookieName, name) {
    const that = this;
    if (!that.getCookie(cookieName)) {
      document.querySelector('input[name="jscp-input-' + name + '"]').checked = false;
    } else {
      if (that.getCookie(cookieName) === 'true') {
        document.querySelector('input[name="jscp-input-' + name + '"]').checked = true;
      }
    }
  }


  acceptAllCookies() {
    const that = this;
    // set generic accepted cookie so we dont show the banner again.
    this.setCookie('cookiesAccepted', 'true');
    // set cookie version
    this.setCookie('cookiesVersion', this.params.version);

    that.categories.forEach(element => {
      that.setCookie('cookie' + that.capitalize(element), 'true');
    });

    this.reloadPage();
  }

  // add new user
  addUser(user) {
    let fullname = this.getUserFullName(user);
    let li = this.getUserLi(fullname);

    this.appendLi(li);
  }

  setCookie(name, value, domain = document.domain, path = '/') {
    var date = new Date();
    date.setTime(date.getTime() + (356 * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value}; expires=${date.toGMTString()}; path=${path}; domain=${domain};SameSite=None Secure`;
  }

  getCookie(a) {
    var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
  }

  convertToSlug(Text) {
    return Text
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '')
      ;
  }

  capitalize(s) {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

}

export function CookiePreference(params) {
  new CookiePreferenceClass(params);
}