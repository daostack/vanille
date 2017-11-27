import { ArcService, Organization, ContractInfo } from '../services/ArcService';
import { LogManager } from 'aurelia-framework';
import { includeEventsIn, Subscription  } from 'aurelia-event-aggregator';
import { SchemeInfo } from "../entities/SchemeInfo";
import { DaoSchemeInfo } from "../entities/DaoSchemeInfo";
import { Web3Service } from "../services/Web3Service";

export class DAO extends Organization {

  public address: string;
  public name: string;
  private schemesCache = new Map<string,SchemeInfo>();
  private registerSchemeEvent;
  private unRegisterSchemeEvent;
  public arcService: ArcService;
  private logger = LogManager.getLogger("Alchemy");
  /**
   * a Scheme has been added or removed from a DAO.
   */
  public static daoSchemeSetChangedEvent:string = "daoSchemeSetChanged";

  /* this is not meant to be instantiated here, only in Arc */
  private constructor() {
    super();
    includeEventsIn(this);
  }

  dispose() {
    this.registerSchemeEvent.stopWatching();
    this.unRegisterSchemeEvent.stopWatching();
  }

  public static async fromOrganization(
      org: Organization
      , arcService: ArcService
      , web3: Web3Service): Promise<DAO> {

    let newDAO = Object.assign(new DAO(), org);
    newDAO.arcService = arcService;
    newDAO.address = org.avatar.address;
    newDAO.name = await web3.bytes32ToUtf8(await org.avatar.orgName());
    await newDAO.getSchemes();
    return newDAO;
  }

  private async getSchemes()
  {
    /**
     * this is triggered right away for every scheme in the DAO, and thereafter
     * whenever a new scheme is registered
     */
    this.registerSchemeEvent = this.controller.RegisterScheme({}, {fromBlock: 0, toBlock: 'latest'});

    await new Promise((resolve,reject) => {
      this.registerSchemeEvent.get((err, eventsArray) => this.handleSchemeEvent(err, eventsArray, true).then(() => { resolve(); }));
      this.registerSchemeEvent = this.controller.RegisterScheme({});
      this.registerSchemeEvent.watch((err, eventsArray) => this.handleSchemeEvent(err, eventsArray, true));
    });

    this.unRegisterSchemeEvent = this.controller.UnregisterScheme({}, {fromBlock: 'latest'});

    await new Promise((resolve,reject) => {
      this.unRegisterSchemeEvent.get((err, eventsArray) => this.handleSchemeEvent(err, eventsArray, false).then(() => { resolve(); }));
      this.unRegisterSchemeEvent = this.controller.UnregisterScheme({});
      this.unRegisterSchemeEvent.watch((err, eventsArray) => this.handleSchemeEvent(err, eventsArray, false));
    });

    this.logger.debug(`Finished loading schemes for ${this.name}: ${this.address}`);
  }
  
  public get allSchemes(): Array<DaoSchemeInfo> {
    // return Array.from(this.schemesCache.values()).filter((s) => { return s.isInDao; }).map((s) => { return s.scheme; } );
    return Array.from(this.schemesCache.values());
  }

  private async handleSchemeEvent(err, eventsArray, adding:boolean) : Promise<void>
  {
    let newSchemesArray = [];
    if (!(eventsArray instanceof Array)) {
      eventsArray = [eventsArray];
    }
    let count = eventsArray.length;
    for (let i = 0; i < count; i++) {
      let schemeAddress =  eventsArray[i].args._scheme;
      let scheme = this.arcService.contractInfoFromAddress(schemeAddress) as any;

      // use if not in Arc or is one of the schemes we work with (ie, not GenesisScheme nor its ilk)
      // TODO: is an Arc scheme that is older or newer than the one Arc is telling us about
      let keeper = !scheme || this.arcService.arcSchemes.filter((s) => { return s.address === scheme.address; }).length;

      if (!scheme) {
        // then it is a non-arc scheme or TODO: is an Arc scheme that is older or newer than the one Arc is telling us about
        scheme = <any>{ address: schemeAddress };
      } 
      
      if (keeper) {
          
          // then this is a scheme we can work with (ie, not the GenesisScheme)
          //let permissions = await this.controller.getSchemePermissions(schemeAddress);

          // TODO: get unknown name from Arc
          if (adding) {
            this.logger.debug(`caching scheme: ${scheme.name ? scheme.name : "[unknown]"}: ${scheme.address}`);
            this.schemesCache.set(schemeAddress,scheme);
          } else if (this.schemesCache.has(schemeAddress)) {
              this.logger.debug(`uncaching scheme: ${scheme.name ? scheme.name : "[unknown]"}: ${scheme.address}`);
              this.schemesCache.delete(schemeAddress);
          }

          this.publish(DAO.daoSchemeSetChangedEvent, 
          {
            dao: this,
            scheme:  SchemeInfo.fromContractInfo(scheme, adding)
          });
        }
      }
  }
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
