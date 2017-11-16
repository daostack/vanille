import { autoinject } from "aurelia-framework";
import { ArcService, ContractInfo, TruffleContract } from './ArcService';
import { OrganizationService, DaoSchemeInfo } from '../services/OrganizationService';
import { Permissions, ToPermissionsEnum } from '../services/ControllerService';

@autoinject
export class SchemeService {
   
  /**
   * The Arc scheme contracts that we make available to the user
   */
  public availableSchemes: Array<ContractInfo>;

  constructor(
    private arcService: ArcService
    , private organizationService: OrganizationService
    //, private controllerService: ControllerService
  ) {
      this.availableSchemes = this.arcService.arcSchemes;
    }

  /**
   * Schemes, both Arc and otherwise, that are in the given DAO.
   * If not from Arc, then name and key will be empty.
   * @param daoAddress
   */
  public async getSchemesInDao(daoAddress: string): Promise<Array<SchemeInfo>> {
    let schemes = (await this.organizationService.getSchemesInOrganization(daoAddress)).map((daoSchemeInfo: DaoSchemeInfo) => {
          return SchemeInfo.fromDaoSchemeInfo(daoSchemeInfo);
        });
    // console.log('getSchemesInDao from scheme() permissions: ' + arcSchemeInfos.filter((s) => s.contract === "GlobalConstraintRegistrar")[0].permissions);
    return schemes;
  }

  /**
   * Return all the schemes in the DAO, plus all the arc schemes not in the DAO
   * @param daoAddress
   * @param excludeNonArcSchemes
   */
  public async getSchemesForDao(daoAddress: string, excludeNonArcSchemes:boolean = false): Promise<Array<SchemeInfo>> {

    let schemes = (await this.getSchemesInDao(daoAddress)).filter((s) => !excludeNonArcSchemes || s.inArc);

    let schemesMap = new Map<string,SchemeInfo>();

    for (let scheme of schemes) {
        schemesMap.set(scheme.address, scheme);
    }

    /**
     * Now merge the list of schemes that the org has with the available Arc schemes that it doesn't have
     * so that schemesMap contains all the schemes both contained and not contained by the Dao.
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
  
  public async getSchemePermissions(schemeInfo: ContractInfo): Promise<Permissions> {
      const contract = await this.arcService.getContract(schemeInfo.key);
      const permissions = contract.getDefaultPermissions();
      return ToPermissionsEnum(permissions);
    }
    
    /**
     * Set the parameters on the scheme.  Returns hash.
     * @param params 
     */
    public async setSchemeParameters(schemeInfo: ContractInfo, params: any): Promise<string> {
      const contract = await this.arcService.getContract(schemeInfo.key);
      return await contract.setParams(params);
    }

    public async getSchemeNativeToken(schemeInfo: ContractInfo): Promise<TruffleContract> {
      const contract = await this.arcService.getContract(schemeInfo.key);
      return await contract.nativeToken();
    }

    public async getSchemeFee(schemeInfo: ContractInfo): Promise<Number> {
      const contract = await this.arcService.getContract(schemeInfo.key);
      return await contract.fee();
    }
}

/**
 * can be any scheme, in the DAO, not in the DAO, not even in Arc
 * In the DAO: has key, isRegistered is true
 * In Arc but not in the DAO:  has key, isRegistered is true
 * Not in Arc:  has no key, nor a name
 */
export class SchemeInfo extends DaoSchemeInfo {

  public static fromDaoSchemeInfo(daoSchemeInfo: DaoSchemeInfo): SchemeInfo {
    let schemeInfo = new SchemeInfo();
    Object.assign(schemeInfo, daoSchemeInfo);
    schemeInfo.isRegistered = true;
    return schemeInfo;
  }

  public static fromContractInfo(contractInfo: ContractInfo, isRegistered: boolean): SchemeInfo {
    let schemeInfo = new SchemeInfo();
    Object.assign(schemeInfo, contractInfo);
    schemeInfo.isRegistered = isRegistered;
    return schemeInfo;
  }

  public isRegistered: boolean;
  public get inDao() { return this.isRegistered; }
  public get inArc() { return !!this.key; }
}

export { ContractInfo } from "./ArcService";
