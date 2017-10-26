import { autoinject } from "aurelia-framework";
import { ArcService, TruffleContract } from '../services/ArcService';
import { OrganizationService, Organization } from '../services/OrganizationService';
// import { DaoSchemeDashboard } from "../daoSchemeDashboards/daoSchemeDashboard";

@autoinject
export class DaoSchemeRepositoryService {

  private cache = new Map<string,Array<SchemeInfo>>();

  constructor(
    private organizationService: OrganizationService
    , private arcService: ArcService
  ) {      
  }

  public async getSchemesInDao(daoAddress: string): Promise<Array<SchemeInfo>> {
    let org = await this.organizationService.organizationAt(daoAddress);
    let schemes = this.cache.get(org.address);
    if (!schemes) {
      let controller = org.controller;
      let schemeInfos: Array<ArcSchemeInfo> = await org.schemes();
      schemes = schemeInfos.map((schemeInfo) => {
        return {
          // contract: await this.arcService.getContract(schemeInfo.contract, schemeInfo.address),
          address: schemeInfo.address,
          permissions: schemeInfo.permissions,
          name: this.arcService.convertKeyToFriendlyName(schemeInfo.contract),
          key: schemeInfo.contract
        }
      });
      
      this.cache.set(org.address, schemes);  
    }
    return schemes;
    
    // this.registerSchemaEvent = controller.RegisterScheme({}, { fromBlock: 0 });

    // this.registerSchemaEvent.get((err, eventsArray) => (err, eventsArray) => {

    //   if (!(eventsArray instanceof Array)) {
    //     eventsArray = [eventsArray];
    //   }

    //   let counter = 0;
    //   let count = eventsArray.length;
    //   for (let i = 0; i < eventsArray.length; i++) {
    //       // let sender =  eventsArray[i].args._sender;
    //       let schemeAddress =  eventsArray[i].args._scheme;
    //       this.arcService.getContract(schemeAddress)
          
    //       // schemes.push({
    //       //   contract: 
    //       // });

    //       ++counter;

    //       if (counter == count) { // then we're done
    //           // this.publish(OrganizationService.daoSetChangedEvent, this.allOrganizations);
    //         this.cache.set(org.address, schemes);  
    //       }
    //     }
    //   });
  }

  public registerScheme(orgAddress: string, schemeAddress: string) {
    // this.schemes.push(scheme);
  }
  
  public dashboardForScheme(schemeKey: string) {

  }
}


export interface ArcSchemeInfo {
  contract: string; // is the contract key
  address: string;
  permissions: string,
}

export interface SchemeInfo {
  /**
   * ready-to-use TruffleContract
   */
  // contract: TruffleContract;
  address: string;
  permissions: string,
  /**
   * Pretty name
   */
  name: string;
  /**
   * short name (used by ArcService.getContract())
   */
  key: string;
}
