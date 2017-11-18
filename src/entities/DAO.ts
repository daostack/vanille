import { ArcService, Organization, ContractInfo } from '../services/ArcService';
import { LogManager } from 'aurelia-framework';
import { includeEventsIn, Subscription  } from 'aurelia-event-aggregator';
import { SchemeInfo } from "../entities/SchemeInfo";
import { DaoSchemeInfo } from "../entities/DaoSchemeInfo";

export class DAO extends Organization {

  private schemesCache = new Map<string,DaoSchemeInfo>();
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
      , arcService: ArcService): Promise<DAO> {

    let newDAO = Object.assign(new DAO(), org);
    newDAO.arcService = arcService;
    await newDAO.initialize();
    return newDAO;
  }

  public async initialize()
  {
    /**
     * this is triggered right away for every scheme in the DAO, and thereafter
     * whenever a new scheme is registered
     */
    this.registerSchemeEvent = this.controller.RegisterScheme({}, {fromBlock: 0});

    await new Promise((resolve,reject) => {
      this.registerSchemeEvent.get((err, eventsArray) => this.handleSchemeEvent(err, eventsArray, true).then(() => { resolve(); }));
      this.registerSchemeEvent = this.controller.RegisterScheme({});
      this.registerSchemeEvent.watch((err, eventsArray) => this.handleSchemeEvent(err, eventsArray, true));
    });

    this.unRegisterSchemeEvent = this.controller.UnregisterScheme({}, {fromBlock: 0});

    await new Promise((resolve,reject) => {
      this.unRegisterSchemeEvent.get((err, eventsArray) => this.handleSchemeEvent(err, eventsArray, false).then(() => { resolve(); }));
      this.unRegisterSchemeEvent = this.controller.UnregisterScheme({});
      this.unRegisterSchemeEvent.watch((err, eventsArray) => this.handleSchemeEvent(err, eventsArray, false));
    });

    this.logger.debug(`Finished loading schemes for ${this.name}: ${this.address}`);
  }
  
  public get allSchemes(): Array<DaoSchemeInfo> {
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
      let contractInfo:ContractInfo = this.arcService.contractInfoFromAddress(schemeAddress);
      if (!contractInfo) {
        // then it is a non-arc scheme
        contractInfo = <any>{ address: schemeAddress };
      }
      //let permissions = await this.controller.getSchemePermissions(schemeAddress);

      if (adding) {
        // this.logger.debug(`caching scheme: ${contractInfo.name}: ${contractInfo.address}`);
        this.schemesCache.set(schemeAddress,contractInfo);
      } else if (this.schemesCache.has(schemeAddress)) {
          // this.logger.debug(`uncaching scheme: ${contractInfo.name}: ${contractInfo.address}`);
          this.schemesCache.delete(schemeAddress);
      }

      this.publish(DAO.daoSchemeSetChangedEvent, 
      {
        dao: this,
        scheme:  SchemeInfo.fromContractInfo(contractInfo, adding)
      });
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
