import {Aurelia, autoinject} from 'aurelia-framework';
import {Router, RouterConfiguration} from 'aurelia-router';
import {PLATFORM} from 'aurelia-pal';
import { Web3Service } from "./services/Web3Service";
import { ArcService } from "./services/ArcService";
import '../static/styles.css';

@autoinject
export class App {
  router: Router;
  private isConnected: boolean;
  
    constructor(
        private web3: Web3Service,
        private arcService: ArcService        
    ) {
    }
  
  configureRouter(config: RouterConfiguration, router: Router) {

    config.title = 'DAOStack Alchemy';
    // config.options.pushState = true;
    // config.options.root = '/';

        /**
         * can be connected 
         */
        const haveDAOStack = !!this.arcService.arcContracts;
        const isConnected = this.web3.isConnected;
        const isCorrectChain = this.web3.isCorrectChain;
        const noAccount = !this.web3.defaultAccount;

        this.isConnected = isConnected && isCorrectChain && haveDAOStack;
        
        /**
         * first set the landing page.
         * it is possible to be connected but have the wrong chain.
         */
        if (isConnected && noAccount) {
            config.map([
            {
                route: [''],
                name: 'noaccount',
                moduleId: PLATFORM.moduleName('./error-pages/noaccount/noaccount'),
                nav: false,
                title: 'No Account'
            }]);
        }
        else if (isConnected && !isCorrectChain) {
            config.map([
            {
                route: [''],
                name: 'wrongchain',
                moduleId: PLATFORM.moduleName('./error-pages/wrongchain/wrongchain'),
                nav: false,
                title: 'Wrong Chain'
            }]);
        }
        /**
         * not connected and/or couldn't get the daostack addresses, either way treat as not connected
         */
        else if (!haveDAOStack) { 
            console.log("contracts not found");
            config.map([
            {
                route: [''],
                name: 'notconnected',
                moduleId: PLATFORM.moduleName('./error-pages/notconnected/notconnected'),
                nav: false,
                title: 'Not Connected'
            }]);
        }
        else {
            config.map([
              { route: ['', 'home'],         name: 'home',        moduleId: PLATFORM.moduleName('./home'),        nav: true, title: 'Home' }
            //   {
            //     route: ['about' ],
            //     name: 'about',
            //     moduleId: PLATFORM.moduleName('../about/about'),
            //     nav: false,
            //     title: 'About DAOstack'
            // }
            // ,
            // {
            //     route: ['faucet' ],
            //     name: 'faucet',
            //     moduleId: PLATFORM.moduleName('../faucet/faucet'),
            //     nav: false,
            //     title: 'Faucet'
            // },
            // {
            //     route: ['collaborators' ],
            //     name: 'collaborators',
            //     moduleId: PLATFORM.moduleName('../collaborators/collaborators'),
            //     nav: false,
            //     title: 'Collaborators'
            // },
            // {
            //     route: ['presale' ],
            //     name: 'presale',
            //     moduleId: PLATFORM.moduleName('../presale/presale'),
            //     nav: false,
            //     title: 'Presale'
            // }
            , {
                route: ['organizations' ],
                name: 'organizations',
                moduleId: PLATFORM.moduleName('./organizations/list'),
                nav: true,
                title: 'Organizations'
            }
            // , {
            //     // 'address' will be present in the object passed to the 'activate' method of the viewmodel
            //     route: ['organization/:address' ],
            //     name: 'organization',
            //     moduleId: PLATFORM.moduleName('./organizations/organization/organization'),
            //     nav: false,
            //     title: 'Organization'
            // }
            , {
                route: ['deployDAO' ],
                name: 'deployDAO',
                moduleId: PLATFORM.moduleName('./organizations/deploy'),
                nav: true,
                title: 'Birth a New DAO'
            }
            , {
              // 'address' will be present in the object passed to the 'activate' method of the viewmodel
              route: ['daoDashboard/:address' ],
              name: 'daoDashboard',
              moduleId: PLATFORM.moduleName('./organizations/dashboard'),
              nav: false,
              title: 'DAO Dashboard'
          }
      ]);
    }

    this.router = router; 
  }
}
