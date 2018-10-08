import { PageObject_Home } from './home.po';
import { browser, element, by, By, $, $$, ExpectedConditions } from 'aurelia-protractor-plugin/protractor';
import { config } from '../protractor.conf';

describe('DutchX Bootstrapper app', function () {
  let poHome: PageObject_Home;

  beforeEach(async () => {
    poHome = new PageObject_Home();

    await browser.loadAndWaitForAureliaPage(`http://localhost:${config.port}`);
  });

  it('should load the page and display the initial page title', async () => {
    await expect(poHome.getCurrentPageTitle()).toBe('Dashboard | DutchX Bootstrapper');
  });

  it('should display greeting', async () => {
    await expect(poHome.getGreeting()).toBe('Creating DAOs for a Collective Intelligence');
  });

  // it('should automatically write down the fullname', async () => {
  //   await poHome.setFirstname('John');
  //   await poHome.setLastname('Doe');

  //   // binding is not synchronous,
  //   // therefore we should wait some time until the binding is updated
  //   await browser.wait(
  //     ExpectedConditions.textToBePresentInElement(
  //       poHome.getFullnameElement(), 'JOHN DOE'
  //     ), 200
  //   );
  // });

  // it('should show alert message when clicking submit button', async () => {
  //   await expect(poHome.openAlertDialog()).toBe(true);
  // });

  // it('should navigate to the page', async () => {
  //   await poAnotherPage.navigateTo('#/anotherPage');
  //   await expect(poAnotherPage.getCurrentPageTitle()).toBe('..whatever it is...');
  // });
});
