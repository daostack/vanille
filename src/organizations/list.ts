import { Subscription  } from 'aurelia-event-aggregator';
import { autoinject, singleton } from "aurelia-framework";
import { Web3Service } from "../services/Web3Service";
import { ArcService } from "../services/ArcService";
import { OrganizationService, DAO } from "../services/OrganizationService";

@singleton(false)
@autoinject
export class OrganizationsList {

  list: HTMLElement;
  daoChangedSubscription: Subscription;

    constructor(
        private web3: Web3Service
        , private arcService: ArcService
        , private organizationService: OrganizationService
    ) {
    }

    organizationArray: Array<any> = [];

    async activate() {
        this.organizationArray = this.organizationService.allOrganizations;
        this.daoChangedSubscription = this.organizationService
          .subscribe(OrganizationService.daoAddedEvent,
              (dao) => {this.organizationArray.push(dao);} );
    }

    deactivate() {
      this.daoChangedSubscription.dispose();
    }
    // attached() {
    //   $(this.list).find('.tooltipped').tooltip({delay: 50});
    // }
}
