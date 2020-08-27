// import dependencies
import { concat } from '../util/string';
import CookieBanner from '../views/cookie-banner.html';
import CookieManagement from '../views/cookie-management.html';
import Handlebars from 'handlebars';


// return CookiePreference class
export class CookiePreference {
  constructor() {
    this.params = window.CookiePreferenceData;
    console.log('params', this.params)
    this.initialized = false;
    this.categories = [];
    if(this.params) {
      this.init();
    }
  }

  // initialize plugin
  init() {
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

      this.renderCookieContainer();
      
    }

    if (!this.getCookie('cookiesAccepted')) {
      // Render Cookie Banner if they have not previously accepted
      this.renderCookieBanner();
    }

    // or render cookie management for testing now
    // this.renderCookieManagement();

    // set initialized to `true`
    this.initialized = true;
  }

  renderCookieContainer() {
    let that = this;
    let markup = document.createElement('div');
    markup.id = 'jscpDialog';
    document.body.appendChild(markup);
  }

  updateCookieContainer(markup, callback) {
    document.getElementById('jscpDialog').innerHTML = markup;
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
        th_purpose: that.params.ui_translations_th_purpose
      },
      categories: []
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
    document.body.style.overflow = "hidden";
    that.updateCookieContainer(markup, function () {
      // bind various events
      that.toggleCookieTables();      
      that.setDefaultCookieRadios();
      that.updateRadioLabel();

      // save button clicked
      document.getElementById('jscp__setCookiePreferences').onclick = function () {
        that.savePreferences();
      }
    });
  }
  
  toggleCookieTables() {
    Array.from(document.getElementsByClassName('jscp__btn-toggle')).forEach(function(element) {
      element.addEventListener('click', function(event) {
        event.target.classList.toggle("jscp-active");
        document.getElementById(event.target.getAttribute("data-target")).classList.toggle("jscp-active");
      });
    });    
  }

  updateRadioLabel() {
    const that = this;
    Array.from(document.getElementsByClassName('jscp__input-radio')).forEach(function(element) {
      if (element.checked) {
        document.getElementById(element.getAttribute("id") + '-label-text').innerHTML = that.params.ui_translations_accepted;
      }
    });
  }

  savePreferences() {
    const that = this;

    that.setCookie('cookiesAccepted', 'true');

    that.categories.forEach(category => {
      that.setCookie('cookie' + that.capitalize(category), document.querySelector('input[name="jscp-input-' + category + '"]').checked);
    });

    // reload the page
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
    that.setCookie('cookiesAccepted', 'true');

    that.categories.forEach(element => {
      that.setCookie('cookie' + that.capitalize(element), 'true');
    });

    // reload the page
    document.location.reload(true);
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
    document.cookie = `${name}=${value}; expires=${date.toGMTString()}; path=${path}; domain=${domain};`;
    document.cookie = name + '=' + value + '; expires=' + date.toGMTString();
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

  capitalize (s) {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
  
}