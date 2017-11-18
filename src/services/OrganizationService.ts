import { autoinject } from "aurelia-framework";
import { ArcService, TruffleContract, Organization, ContractInfo } from './ArcService';
import { Web3Service } from "../services/Web3Service";
import { includeEventsIn, Subscription  } from 'aurelia-event-aggregator';
import { LogManager } from 'aurelia-framework';
import { DAO, DaoSchemeInfo } from '../entities/DAO';
import { DaoSchemeDashboard } from "schemeDashboards/schemeDashboard";

@autoinject
export class OrganizationService {

  constructor(
    private arcService: ArcService
    , private web3: Web3Service
    //, private votingMachineService: VotingMachineService
  ) {
    includeEventsIn(this);
  }

  private daoCache = new Map<string,DAO>();
  logger = LogManager.getLogger("Alchemy");

  /**
   * a DAO has been added or removed
   */
  public static daoAddedEvent:string = "daoSetChanged";

  public async initialize()
  {
    return new Promise(async (resolve,reject) => {

      let genesisScheme = await this.arcService.getContract("GenesisScheme");
      let myEvent = genesisScheme.NewOrg({}, { fromBlock: 0 });
      /**
       * get():  fires once for all the DAOs in the system; resolve() will be called properly.
       * watch(): fires whenever a new DAO is created thereafter
       */
      myEvent.get((err, eventsArray) => this.handleNewOrg(err, eventsArray).then(() => { this.logger.debug("Finished loading daos"); resolve(); }));
      myEvent = genesisScheme.NewOrg({});
      myEvent.watch((err, eventsArray) => this.handleNewOrg(err, eventsArray));
    });
  }

  public async getDAOStackAddress() {
    const schemeRegistrar = await this.arcService.getContract("SchemeRegistrar");
    return await schemeRegistrar.beneficiary();
  }

  public async getDAOStackOrganization() {
    const avatarAddress = await this.getDAOStackAddress();
    return await this.organizationAt(avatarAddress);
  }

  public async createOrganization(config: OrganizationCreateConfig): Promise<DAO> {
    let dao = <DAO>(await Organization.new(config) as any);
    this.daoCache.set(dao.address,dao);
    return dao;
  }

  public async organizationAt(avatarAddress: string, takeFromCache: boolean = true): Promise<DAO> {
    let dao: DAO;
    let cachedDao = this.daoCache.get(avatarAddress);

    if (!takeFromCache || !cachedDao) {
        let org = <DAO>(await Organization.at(avatarAddress) as any);
        org.name = await this.organizationName(org);
        org.address = avatarAddress;
        dao = await DAO.fromOrganization(org, this.arcService);
    } else {
      dao = cachedDao;
    }

    if (!cachedDao) {
      // this.logger.debug(`caching dao: ${dao.name ? `${dao.name}: ` : ""}${dao.address}`);
      this.daoCache.set(dao.address,dao);
    }

    return dao;
  }

  public async organizationName(org: DAO) {
    return this.web3.bytes32ToUtf8(await org.avatar.orgName());     
  }

  public get allOrganizations(): Array<DAO> {
    return Array.from(this.daoCache.values());
  }

  private async handleNewOrg(err, eventsArray) : Promise<void>
  {
    let newOrganizationArray = [];
    if (!(eventsArray instanceof Array)) {
      eventsArray = [eventsArray];
    }
    let counter = 0;
    let count = eventsArray.length;
    for (let i = 0; i < count; i++) {
        let promotedAmount = 0;
        let avatarAddress =  eventsArray[i].args._avatar;
        // this has side-effect of initializing and caching the dao
        let dao = await this.organizationAt(avatarAddress);
        this.logger.debug(`loaded org ${dao.name}: ${dao.avatar.address}`);
        ++counter;

        if (counter == count) { // then we're done
            this.publish(OrganizationService.daoAddedEvent, dao);
        }
      }
  }

  public async getSchemesInOrganization(daoAddress: string): Promise<Array<DaoSchemeInfo>> {
    let org = await this.organizationAt(daoAddress);
    return org.allSchemes;
  }

  /*****
   * The following three event methods will be replaced by the event aggregator.
   * See OrganizationService.daoAddedEvent
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
  tokens: number; // in Wei
  reputation: number;
}

export interface OrganizationCreateConfig {
  orgName: string;
  tokenName: string;
  tokenSymbol: string;
  founders: Array<Founder>;
  votingMachine: string, // address
  votePrec: Number,
  ownerVote: boolean,
  schemes: Array<{ contract: string, address: string }>
}


/**
 * returned by Organization.schemes()
 */
interface OrganizationSchemeInfo {
  contract: string; // is the contract key!!!
  address: string;
  permissions: string;
}

export { DAO, DaoSchemeInfo } from '../entities/DAO';
