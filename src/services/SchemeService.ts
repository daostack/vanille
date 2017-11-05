import { autoinject } from "aurelia-framework";
import { ArcService, ContractInfo } from './ArcService';
import { OrganizationService, DaoSchemeInfo } from '../services/OrganizationService';

@autoinject
export class SchemeService {
   
  /**
   * The Arc scheme contracts that we make available to the user
   */
  public availableSchemes: Array<ContractInfo>;

  constructor(
    private arcService: ArcService
    , private organizationService: OrganizationService
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
}

/**
 * can be any scheme, in the DAO, not in the DAO, not even in Arc
 * In the DAO: has key, isRegistered is true
 * In Arc but not in the DAO:  has key, isRegistered is true
 * Not in Arc:  has no key, nor a name
 */
export class SchemeInfo extends DaoSchemeInfo {

  public static fromDaoSchemeInfo(daoSchemeInfo) {
    let schemeInfo = new SchemeInfo();
    Object.assign(schemeInfo, daoSchemeInfo);
    schemeInfo.isRegistered = true;
    return schemeInfo;
  }

  public static fromContractInfo(contractInfo, isRegistered: boolean) {
    let schemeInfo = new SchemeInfo();
    // note this will include a contract property that is the TruffleContract, technically not part of SchemeInfo
    Object.assign(schemeInfo, contractInfo);
    schemeInfo.isRegistered = isRegistered;
    return schemeInfo;
  }

  public isRegistered: boolean;
  public get inDao() { return this.isRegistered; }
  public get inArc() { return !!this.key; }
}
