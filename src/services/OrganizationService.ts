import { autoinject } from "aurelia-framework";
import { ArcService, TruffleContract } from './ArcService';
import { Web3Service } from "../services/Web3Service";
import  { Organization, getContract } from 'emergent-arc';
import { EventAggregator, includeEventsIn, Subscription  } from 'aurelia-event-aggregator';

@autoinject
export class OrganizationService {

  constructor(
    private arcService: ArcService
    , private web3: Web3Service
  ) {
    includeEventsIn(this);
  }

  private cache = new Map<string,Organization>();

  public async getDAOStackAddress() {
    const schemeRegistrar = await this.arcService.getContract("SchemeRegistrar");
    return await schemeRegistrar.beneficiary();
  }

  public async getDAOStackOrganization() {
      const avatarAddress = await this.getDAOStackAddress();
      const org = await this.organizationAt(avatarAddress);
      return org;
  }


  public async createOrganization(config: OrganizationCreateConfig): Promise<Organization> {
    const org = await Organization.new(config);
    // this.cache.set(org.avatar.address,org);
    return org;
  }

  public async organizationAt(avatarAddress: string, fromCache: boolean = true): Promise<Organization> {
    let org: Organization;
    if (!fromCache || !(org = this.cache.get(avatarAddress)) ) {
        org = await Organization.at(avatarAddress);
        // this.cache.set(avatarAddress,org);
    }
    return org;
  }

  // TODO: move this into the organization class.
  public async organizationName(org: Organization) {
    return this.web3.bytes32ToUtf8(await org.avatar.orgName());     
  }

  public get allOrganizations(): Promise<Array<Organization>> {
    if (!this.myEvent) {
      return this.getAllOrganizations();
    } 
    else 
    {
      return Promise.resolve(Array.from(this.cache.values()));
    }
  }

  private myEvent:any;
  public static daoSetChangedEvent:string = "daoSetChanged";

  private async getAllOrganizations() : Promise<Array<Organization>>
    {
      // let orgRegister = await this.arcService.getContract("OrganizationRegister");
      let genesisScheme = await this.arcService.getContract("GenesisScheme");
      
      this.myEvent = genesisScheme.NewOrg({}, { fromBlock: 0 });

      return new Promise<Array<Organization>>((resolve,reject) => {
        this.myEvent.get(async (err, eventsArray) => {
          if (!err) {
              let newOrganizationArray = [];
              let counter = 0;
              let count = eventsArray.length;
              for (let i = 0; i < eventsArray.length; i++) {
                  let promotedAmount = 0;
                  let avatarAddress =  eventsArray[i].args._avatar;
                  let organization = await this.organizationAt(avatarAddress);
                  organization.name =await this.organizationName(organization);
                  organization.address = avatarAddress;

                  this.cache.set(organization.address,organization);

                  // var org = await this.arcService.organizationAt(avatarAddress);

                  /**
                   * note that orderList.call is asynchronous, and that
                   * the results may not come back in the order invoked.
                   */
                // promotedAmount = Number(this.web3.fromWei(eventsArray[i]));
                  
                  // promotedAmount = i;

                  // newOrganizationArray.push({
                  //     rank: i + 1,
                  //     name: avatarName,
                  //     members: 3,
                  //     tokens: 300000,
                  //     reputation: 30000,
                  //     promotedAmount: promotedAmount,
                  //     address: avatarAddress,
                  // });
                  ++counter;

                  if (counter == count) { // then we're done
                      // newOrganizationArray = newOrganizationArray.sort((a, b) => {
                      //     return b.promotedAmount - a.promotedAmount;
                      // });

                      let orgs = Array.from(this.cache.values());

                      console.log("Firing Daos changed");
                      this.publish("daoSetChanged", orgs);

                      resolve(orgs);
                  }
              }
          }
      });
    });
  }

  /*****
   * The following three event methods will be replaced by the event aggregator
   */

  /**
    * Publishes a message.
    * @param event The event or channel to publish to.
    * @param data The data to publish on the channel.
    */
    public publish(event: string | any, data?: any): void {}
    
    /**
      * Subscribes to a message channel or message type.
      * @param event The event channel or event data type.
      * @param callback The callback to be invoked when when the specified message is published.
      */
      public subscribe(event: string | Function, callback: Function): Subscription  { return null; }
    
    /**
      * Subscribes to a message channel or message type, then disposes the subscription automatically after the first message is received.
      * @param event The event channel or event data type.
      * @param callback The callback to be invoked when when the specified message is published.
      */
      public subscribeOnce(event: string | Function, callback: Function): Subscription  { return null; }
}

export interface Founder {
  address: string;
  tokens: number;
  reputation: number;
}

export interface OrganizationCreateConfig {
  orgName: string;
  tokenName: string;
  tokenSymbol: string;
  founders: Array<Founder>;
}

// export class Organization extends ArcOrganization {
  
//   constructor() {
//     super();
//   }

//   public name: string;
//   /**
//    * the avatar's address
//    */
//   public address: string;
// }

export { Organization } from 'emergent-arc';

// export default class Organization {
//   /**
//    * includes static `new` and `at`
//    */
//   // Avatar truffle contract
//   avatar: TruffleContract; 
//   /**
//    * Controller truffle contract
//    */ 
//   controller: TruffleContract; 
//   /**
//    * DAOToken truffle contract
//    */ 
//   token: TruffleContract; 
//   /**
//    * Reputation truffle contract
//    */ 
//   reputation: TruffleContract; 
//   /**
//    * AbsoluteVote truffle contract
//    */ 
//   votingMachine: TruffleContract; 

//   schemes(contractName:string);
//   scheme(contractName:string);
//   checkSchemeConditions(contractName:string);
//   proposeScheme(options?);
//   proposeGlobalConstraint(options?);
//   vote(proposalId, choice, params);
// }
