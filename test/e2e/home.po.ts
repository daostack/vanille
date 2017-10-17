import {browser, element, by, By, $, $$, ExpectedConditions} from 'aurelia-protractor-plugin/protractor';

export class PageObject_Home {
  getGreeting() {
    return element(by.tagName('h2')).getText();
  }


  getCurrentPageTitle() {
    return browser.getTitle();
  }

  async openAlertDialog() {
    // await this.pressSubmitButton();

    // await browser.wait(ExpectedConditions.alertIsPresent(), 5000);

    // try {
    //   await browser.switchTo().alert().accept();
    //   return true;
    // } catch (e) {
    //   return false;
    // }
  }
}
