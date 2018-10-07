import {
  ArcService,
  DAO,
  DaoSchemeInfo,
  DaoGlobalConstraintInfo
} from '../services/ArcService';
import { LogManager } from 'aurelia-framework';
import { includeEventsIn, Subscription } from 'aurelia-event-aggregator';
import { SchemeInfo } from "../entities/SchemeInfo";
import { Web3Service, BigNumber } from "../services/Web3Service";
import { GlobalConstraintInfo } from "../entities/GlobalConstraintInfo";

export class VanilleDAO extends DAO {

  public address: string;
  public name: string;
  private schemesCache: Map<string, SchemeInfo>;
  private constraintsCache: Map<string, GlobalConstraintInfo>;
  private registerSchemeEvent;
  private unRegisterSchemeEvent;
  private addConstraintEvent;
  private removeConstraintEvent;
  public arcService: ArcService;
  private logger = LogManager.getLogger("Vanille");
  public omega: BigNumber; // in wei
  /**
   * a Scheme has been added or removed from a DAO.
   */
  public static daoSchemeSetChangedEvent: string = "daoSchemeSetChanged";
  public static daoConstraintSetChangedEvent: string = "daoConstraintSetChanged";

  /* this is not meant to be instantiated here, only in Arc */
  private constructor() {
    super();
    includeEventsIn(this);
  }

  dispose() {
    this.registerSchemeEvent.stopWatching();
    this.unRegisterSchemeEvent.stopWatching();
  }

  public static async fromArcJsDao(
    org: DAO
    , arcService: ArcService
    , web3: Web3Service): Promise<VanilleDAO> {

    let newDAO = Object.assign(new VanilleDAO(), org);
    newDAO.arcService = arcService;
    newDAO.address = org.avatar.address;
    newDAO.name = org.name;
    newDAO.omega = await newDAO.reputation.getTotalSupply();
    return newDAO;
  }

  private async _getCurrentSchemes(): Promise<Array<SchemeInfo>> {
    return (await super.getSchemes()).map((s: DaoSchemeInfo) => SchemeInfo.fromOrganizationSchemeInfo(s));
  }

  /**
   * returns all the schemes in the Dao.
   * Keeps them cached and always up-to-date.  Do not confuse with super.schemes().
   */
  public async allSchemes(): Promise<Array<SchemeInfo>> {
    if (!this.schemesCache) {
      this.schemesCache = new Map<string, SchemeInfo>();
      let schemes = await this._getCurrentSchemes();
      for (let scheme of schemes) {
        this.schemesCache.set(scheme.address, scheme);
      }
      this.watchSchemes();
      this.logger.debug(`Finished loading schemes for ${this.name}: ${this.address}`);
    }

    return Array.from(this.schemesCache.values());
  }

  private watchSchemes(): void {
    this.registerSchemeEvent = this.controller.RegisterScheme({ _avatar: this.address }, { fromBlock: "latest" });
    this.registerSchemeEvent.watch((err, eventsArray) => this.handleSchemeEvent(err, eventsArray, true));

    this.unRegisterSchemeEvent = this.controller.UnregisterScheme({ _avatar: this.address }, { fromBlock: "latest" });
    this.unRegisterSchemeEvent.watch((err, eventsArray) => this.handleSchemeEvent(err, eventsArray, false));
  }

  private async handleSchemeEvent(err, eventsArray, adding: boolean): Promise<void> {
    let newSchemesArray = [];
    if (!(eventsArray instanceof Array)) {
      eventsArray = [eventsArray];
    }
    let count = eventsArray.length;
    for (let i = 0; i < count; i++) {
      let schemeAddress = eventsArray[i].args._scheme;
      let contractWrapper = this.arcService.contractWrapperFromAddress(schemeAddress) as any;

      if (!contractWrapper) {
        // then it is a non-arc scheme or TODO: is an Arc scheme that is older or newer than the one Arc is telling us about
        contractWrapper = <any>{ address: schemeAddress };
      }

      let schemeInfo = SchemeInfo.fromContractWrapper(contractWrapper, adding);
      let changed = false;
      // TODO: get unknown name from Arc
      if (adding && !this.schemesCache.has(schemeAddress)) {
        changed = true;
        this.logger.debug(`caching scheme: ${contractWrapper.name ? contractWrapper.name : "[unknown]"}: ${contractWrapper.address}`);
        this.schemesCache.set(schemeAddress, schemeInfo);
      } else if (!adding && this.schemesCache.has(schemeAddress)) {
        changed = true;
        this.logger.debug(`uncaching scheme: ${contractWrapper.name ? contractWrapper.name : "[unknown]"}: ${contractWrapper.address}`);
        this.schemesCache.delete(schemeAddress);
      }

      if (changed) {
        this.publish(VanilleDAO.daoSchemeSetChangedEvent,
          {
            dao: this,
            scheme: schemeInfo
          });
      }
    }
  }

  private async _getCurrentConstraints(): Promise<Array<SchemeInfo>> {
    return (await super.getGlobalConstraints()).map((s: DaoGlobalConstraintInfo) => GlobalConstraintInfo.fromOrganizationGlobalConstraintInfo(s));
  }

  /**
   * returns all global constraints in this DAO
   */
  public async allGlobalConstraints(): Promise<Array<GlobalConstraintInfo>> {
    if (!this.constraintsCache) {
      this.constraintsCache = new Map<string, GlobalConstraintInfo>();
      let constraints = await this._getCurrentConstraints();
      for (let gc of constraints) {
        this.constraintsCache.set(gc.address, gc);
      }
      this.watchConstraints();
      this.logger.debug(`Finished loading global constraints for ${this.name}: ${this.address}`);
    }

    return Array.from(this.constraintsCache.values());
  }

  private watchConstraints(): void {
    this.addConstraintEvent = this.controller.AddGlobalConstraint({}, { fromBlock: "latest", toBlock: "latest" });
    this.addConstraintEvent.watch((err, eventsArray) => this.handleConstraintEvent(err, eventsArray, true));

    this.removeConstraintEvent = this.controller.RemoveGlobalConstraint({}, { fromBlock: "latest", toBlock: "latest" });
    this.removeConstraintEvent.watch((err, eventsArray) => this.handleConstraintEvent(err, eventsArray, false));
  }

  private async handleConstraintEvent(err, eventsArray, adding: boolean): Promise<void> {
    let newConstraintsArray = [];
    if (!(eventsArray instanceof Array)) {
      eventsArray = [eventsArray];
    }
    let count = eventsArray.length;
    for (let i = 0; i < count; i++) {
      // work-around: https://github.com/daostack/daostack/issues/263
      let constraintAddress = eventsArray[i].args._globalconstraint || eventsArray[i].args._globalConstraint;
      let constraintParamsHash = eventsArray[i].args._params;
      let contractWrapper = this.arcService.contractWrapperFromAddress(constraintAddress) as any;

      if (!contractWrapper) {
        // then it is a non-arc scheme or TODO: is an Arc scheme that is older or newer than the one Arc is telling us about
        contractWrapper = <any>{ address: constraintAddress };
      }

      //let permissions = await this.controller.getSchemePermissions(schemeAddress);

      let constraintInfo = GlobalConstraintInfo.fromContractWrapper(contractWrapper, adding);
      let changed = false;
      // TODO: get unknown name from Arc
      if (adding && !this.constraintsCache.has(constraintAddress)) {
        changed = true;
        this.logger.debug(`caching gc: ${contractWrapper.name ? contractWrapper.name : "[unknown]"}: ${contractWrapper.address}`);
        this.constraintsCache.set(constraintAddress, constraintInfo);
      } else if (!adding && this.constraintsCache.has(constraintAddress)) {
        changed = true;
        this.logger.debug(`uncaching gc: ${contractWrapper.name ? contractWrapper.name : "[unknown]"}: ${contractWrapper.address}`);
        this.constraintsCache.delete(constraintAddress);
      }

      if (changed) {
        this.publish(VanilleDAO.daoConstraintSetChangedEvent,
          {
            dao: this,
            gc: constraintInfo
          });
      }
    }
  }

  /**
    * Publishes a message.
    * @param event The event or channel to publish to.
    * @param data The data to publish on the channel.
    */
  public publish(event: string | any, data?: any): void { }

  /**
    * Subscribes to a message channel or message type.
    * @param event The event channel or event data type.
    * @param callback The callback to be invoked when when the specified message is published.
    */
  public subscribe(event: string | Function, callback: Function): Subscription { return null; }

  /**
    * Subscribes to a message channel or message type, then disposes the subscription automatically after the first message is received.
    * @param event The event channel or event data type.
    * @param callback The callback to be invoked when when the specified message is published.
    */
  public subscribeOnce(event: string | Function, callback: Function): Subscription { return null; }
}
