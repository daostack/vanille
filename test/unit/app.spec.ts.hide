import {App} from 'app';

class RouterStub {
  routes;
  
  configure(handler) {
    handler(this);
  }

  map(routes) {
    this.routes = routes;
  }
}

describe('the App module', () => {
  let sut: any;
  let mockedRouter: any;

  beforeEach(() => {
    mockedRouter = new RouterStub();

    let fakeWeb3Service = {
      isConnected: true,
      isCorrectChain: true,
      noAccount: false
      // web3: {},
      // accounts: [],
      // defaultAccount: "",
      // currentProvider: {},
      // eth: {},
      // version: () => {}
    };

    let fakeArcService = {
      haveDAOStack: true
    };

    sut = new App(fakeWeb3Service as any, fakeArcService as any);
    sut.configureRouter(mockedRouter, mockedRouter);
  });

  it('contains a router property', () => {
    expect(sut.router).toBeDefined();
  });

  it('configures the router title', () => {
    expect(sut.router.title).toEqual('DAOStack Alchemy');
  });

  it('should have a home route', () => {
    expect(sut.router.routes).toContainEqual({ route: ['', 'home'], name: 'home',  moduleId: './home', nav: true, title: 'Home' });
  });

  // it('should have a child router route', () => {
  //   expect(sut.router.routes).toContainEqual({ route: 'child-router', name: 'child-router', moduleId: './child-router', nav: true, title: 'Child Router' });
  // });
});
