import { autoinject } from "aurelia-framework";
import { ArcService, ContractWrapperInfo, TruffleContract, SchemePermissions } from './ArcService';
import { DaoService } from '../services/DaoService';
import { SchemeInfo } from "../entities/SchemeInfo";
import { EventAggregator } from 'aurelia-event-aggregator';
import { EventConfigException } from '../entities/GeneralEvents';

@autoinject
export class SchemeService {

  /**
   * The Arc scheme contracts that we make available to the user
   */
  public availableSchemes: Array<ContractWrapperInfo>;

  constructor(
    private arcService: ArcService
    , private daoService: DaoService
    , private eventAggregator: EventAggregator
  ) {
    this.availableSchemes = this.arcService.arcSchemes;
  }

  /**
   * Schemes in the given DAO, as SchemeInfos.
   * If not from Arc, then name and friendlyName will be empty.
   * 
   * @param daoAddress
   */
  private async _getSchemesInDao(daoAddress: string): Promise<Array<SchemeInfo>> {
    let dao = await this.daoService.daoAt(daoAddress);
    let schemes = await dao.allSchemes()
    return schemes;
  }

  /**
   * Return all Arc schemes, whether or not in the DAO, as SchemeInfos.
   * 
   * SchemeInfo.isRegistered will indicate whether the scheme is in the DAO.
   * If not from Arc, then name and friendlyName will be empty.
   * 
   * @param daoAddress
   * @param excludeNonArcSchemes Default is false
   */
  public async getSchemesForDao(daoAddress: string, excludeNonArcSchemes: boolean = false): Promise<Array<SchemeInfo>> {

    let schemes = (await this._getSchemesInDao(daoAddress)).filter((s) => !excludeNonArcSchemes || s.inArc);

    let schemesMap = new Map<string, SchemeInfo>();

    for (let scheme of schemes) {
      schemesMap.set(scheme.address, scheme);
    }

    /**
     * Now merge the list of schemes that the org has with the available Arc schemes that it doesn't have
     * so that the returned list contains all the schemes both contained and not contained by the Dao.
     */
    // let availableSchemes = this.availableSchemes;
    // for (let availableScheme of availableSchemes) {
    //   let isInDao = schemesMap.has(availableScheme.address);
    //   if (!isInDao) {
    //     schemes.push(SchemeInfo.fromContractWrapper(availableScheme, false));
    //   }
    // }

    return schemes;
  }

  public async getSchemePermissions(name: string, schemeAddress?: string): Promise<SchemePermissions> {
    try {
      const contract = await this.arcService.getContract(name, schemeAddress);
      const permissions = contract.getDefaultPermissions();
      return SchemePermissions.fromString(permissions);
    } catch (ex) {
      this.eventAggregator.publish("handleException", new EventConfigException(`Error getting scheme permissions`, ex));
      return null;
    }
  }
}

export { SchemeInfo } from "../entities/SchemeInfo";
