import {bootstrap} from 'aurelia-bootstrapper';
import {StageComponent} from 'aurelia-testing';
import {PLATFORM} from 'aurelia-pal';

describe('Home Page', () => {
  let component;

  beforeEach(async () => {
    component = StageComponent
      .withResources(PLATFORM.moduleName('home'))
      .inView('<home></home>');
    await component.create(bootstrap);
  });

  // only jest supports creating snapshot:
  if (jest) {
    it('should render correctly', () => {
      expect(document.body.outerHTML).toMatchSnapshot();
    });
  }

  it('should render heading', () => {
    const headerElement = document.querySelector('h1') as HTMLElement;
    expect(headerElement).not.toBeFalsy();
    expect(headerElement.innerHTML).toBe('DAOs for an Emergent Future');
  });

  // it('should render first name', () => {
  //   const nameElement = document.querySelector('#fn') as HTMLInputElement;
  //   expect(nameElement.value).toBe('John');
  // });

  afterEach(() => {
    component.dispose();
  });
});
