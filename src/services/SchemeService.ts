import { autoinject } from "aurelia-framework";
import { ArcService, TruffleContract, ContractInfo } from './ArcService';
import { OrganizationService, DAO, ArcSchemeInfo } from '../services/OrganizationService';
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
    let arcSchemeInfos = await this.organizationService.getSchemesInOrganization(daoAddress);
    // console.log('getSchemesInDao from scheme() permissions: ' + arcSchemeInfos.filter((s) => s.contract === "GlobalConstraintRegistrar")[0].permissions);

    return arcSchemeInfos.map((schemeInfo) => {
    // console.log('schemeInfo in loop: ' + schemeInfo.permissions);
    // console.log('ToPermissionsEnum in loop: ' + ToPermissionsEnum(schemeInfo.permissions));
      return {
        address: schemeInfo.address,
        permissions: ToPermissionsEnum(schemeInfo.permissions),
        name: this.arcService.convertKeyToFriendlyName(schemeInfo.contract),
        key: schemeInfo.contract
      }
    });
  }
}

export interface SchemeInfo {
  address: string;
  permissions: Permissions,
  name: string;
  key: string;
}
