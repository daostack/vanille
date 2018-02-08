import { Subscription } from 'aurelia-event-aggregator';
import { autoinject, singleton } from "aurelia-framework";
import { Web3Service } from "../services/Web3Service";
import { ArcService } from "../services/ArcService";
import { DaoService, DAO } from "../services/DaoService";

@singleton(false) // meaning true
@autoinject
export class OrganizationsList {

  list: HTMLElement;
  daoChangedSubscription: Subscription;
  listIsLoaded: boolean = false;

  constructor(
    private web3: Web3Service
    , private arcService: ArcService
    , private daoService: DaoService
  ) {
    /** 
     * Call this before the DAOs have begun being fetched, or you'll miss some.
     * The idea here is that we fetch the DAOs visibly.
     */
    this.initialize();
  }

  organizationArray: Array<any> = [];

  // async attached() {
  //   this.initialize();
  // }

  // detached() {
  //   this.daoChangedSubscription.dispose();
  //   this.daoChangedSubscription = null;
  //   this.organizationArray = [];
  // }

  initialize() {
    if (!this.daoChangedSubscription) {
      this.daoChangedSubscription = this.daoService.subscribe(DaoService.daoAddedEvent,
        (dao) => { this.organizationArray.push(dao); });
    }
  }
}
