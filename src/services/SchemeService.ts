import { autoinject } from "aurelia-framework";
import { ArcService, ContractInfo, TruffleContract, OrganizationSchemeInfo } from './ArcService';
import { OrganizationService, DaoSchemeInfo } from '../services/OrganizationService';
import { Permissions, ToPermissionsEnum } from '../services/ControllerService';
import { SchemeInfo } from "../entities/SchemeInfo";
import { EventAggregator  } from 'aurelia-event-aggregator';
import  { EventConfigException } from '../entities/GeneralEvents';

@autoinject
export class SchemeService {
   
  /**
   * The Arc scheme contracts that we make available to the user
   */
  public availableSchemes: Array<ContractInfo>;

  constructor(
    private arcService: ArcService
    , private organizationService: OrganizationService
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
    let dao = await this.organizationService.organizationAt(daoAddress);
    let schemes = await dao.allSchemes()
    // console.log('getSchemesInDao from scheme() permissions: ' + arcSchemeInfos.filter((s) => s.contract === "GlobalConstraintRegistrar")[0].permissions);
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
  public async getSchemesForDao(daoAddress: string, excludeNonArcSchemes:boolean = false): Promise<Array<SchemeInfo>> {

    let schemes = (await this._getSchemesInDao(daoAddress)).filter((s) => !excludeNonArcSchemes || s.inArc);

    let schemesMap = new Map<string,SchemeInfo>();

    for (let scheme of schemes) {
        schemesMap.set(scheme.address, scheme);
    }

    /**
     * Now merge the list of schemes that the org has with the available Arc schemes that it doesn't have
     * so that the returned list contains all the schemes both contained and not contained by the Dao.
     */
    let availableSchemes = this.availableSchemes;
    for (let availableScheme of availableSchemes) {
      let isInDao = schemesMap.has(availableScheme.address);
      if (!isInDao) {
        schemes.push(SchemeInfo.fromContractInfo(availableScheme, false));
      }
    }

    return schemes;
  }
  
  public async getSchemePermissions(name: string, schemeAddress?: string): Promise<Permissions> {
      try {
        const contract = await this.arcService.getContract(name, schemeAddress);
        const permissions = contract.getDefaultPermissions();
        return ToPermissionsEnum(permissions);
      } catch(ex) {
        this.eventAggregator.publish("handleException", new EventConfigException(`Error getting scheme permissions`, ex));
        return null; 
      }
    }
    
    public async getSchemeNativeToken(name: string, schemeAddress?: string): Promise<TruffleContract> {
      try {
        const contract = await this.arcService.getContract(name, schemeAddress);
        return await contract.nativeToken();
      }
      catch(ex) {
        this.eventAggregator.publish("handleException", new EventConfigException(`Error getting scheme native token`, ex));        
        return null; 
      }
    }

    public async getSchemeFee(name: string, schemeAddress?: string): Promise<Number> {
      try {
      const contract = await this.arcService.getContract(name, schemeAddress);
      return await contract.fee();
      }
      catch(ex) {
        this.eventAggregator.publish("handleException", new EventConfigException(`Error getting scheme fee`, ex));        
        return null; 
      }
    }
}

export { ContractInfo } from "./ArcService";
export { SchemeInfo } from "../entities/SchemeInfo";
