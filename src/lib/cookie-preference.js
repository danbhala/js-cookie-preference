// import dependencies
import { concat } from '../util/string';
import CookieBanner from '../views/cookie-banner.html';
import Handlebars from 'handlebars';


// return CookiePreference class
export class CookiePreference {
  constructor(elem, params) {
    this.elem = elem;
    this.params = params;

    console.log('params', params)

    this.initialized = false;

    this.init();
  }

  // initialize plugin
  init() {

    // Render Cookie Banner
    this.renderCookieBanner();

    // set initialized to `true`
    this.initialized = true;
  }

  // get fullname of the user
  getUserFullName(user) {
    return concat(user.firstname, user.lastname);
  }

  // get list of users with fullname
  getUsers() {
    return this.users.map(user => this.getUserFullName(user));
  }

  // return `li` element with user fullname
  getUserLi(fullname) {
    let li = document.createElement('li');
    li.innerText = fullname;

    return li;
  }

  // append `li` element to the users `ul` element
  appendLi(li) {
    this.ul.appendChild(li);
  }

  // render entire users list
  renderCookieBanner() {
    let that = this;
    let markup = document.createElement('div');
    var template = Handlebars.compile(CookieBanner);
    markup.innerHTML = template(that.params.cookieBanner)
    this.elem.appendChild(markup);
  }

  // add new user
  addUser(user) {
    let fullname = this.getUserFullName(user);
    let li = this.getUserLi(fullname);

    this.appendLi(li);
  }
}