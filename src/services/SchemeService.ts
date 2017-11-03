import { autoinject } from "aurelia-framework";
import { ArcService, ContractInfo } from './ArcService';
import { OrganizationService, DaoSchemeInfo } from '../services/OrganizationService';
import { Permissions } from '../services/ControllerService';

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
      this.availableSchemes = [
        this.arcService.arcSchemes.SchemeRegistrar
        , this.arcService.arcSchemes.UpgradeScheme
        , this.arcService.arcSchemes.GlobalConstraintRegistrar
        , this.arcService.arcSchemes.SimpleContributionScheme
      ];
    }

  /**
   * Schemes, both Arc and otherwise, that are in the given DAO.
   * If not from Arc, then name and key will be empty.
   * @param daoAddress
   */
  public async getSchemesInDao(daoAddress: string): Promise<Array<SchemeInfo>> {
    return (await this.organizationService.getSchemesInOrganization(daoAddress)).map((daoSchemeInfo: DaoSchemeInfo) => {
          return SchemeInfo.fromDaoSchemeInfo(daoSchemeInfo);
        });
    // console.log('getSchemesInDao from scheme() permissions: ' + arcSchemeInfos.filter((s) => s.contract === "GlobalConstraintRegistrar")[0].permissions);
  }

  public contractInfoToSchemeInfo(contractInfo: ContractInfo, isRegistered:boolean, permissions: Permissions=Permissions.None): SchemeInfo {
    let schemeInfo = SchemeInfo.fromDaoSchemeInfo(<SchemeInfo>this.organizationService.contractInfoToDaoSchemeInfo(contractInfo, permissions));
    schemeInfo.isRegistered = isRegistered;
    return schemeInfo;
  }
}

/**
 * can be any scheme, in the DAO, not in the DAO, not even in Arc
 * In the DAO: has key, isRegistered is true
 * In Arc but not in the DAO:  has key, isRegistered is true
 * Not in Arc:  has no key, 
 */
export class SchemeInfo extends DaoSchemeInfo {

  public static fromDaoSchemeInfo(daoSchemeInfo) {
    let schemeInfo = new SchemeInfo();
    Object.assign(schemeInfo, daoSchemeInfo);
    schemeInfo.isRegistered = true;
    return schemeInfo;
  }

  public isRegistered: boolean;
  public get inDao() { return this.isRegistered; }
  public get inArc() { return !!this.key; }
}
