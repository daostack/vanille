import { autoinject } from "aurelia-framework";
import { ArcService, TruffleContract, ContractInfo } from './ArcService';
import { Web3Service } from "../services/Web3Service";
import { OrganizationService, Organization, ArcSchemeInfo } from '../services/OrganizationService';
import { Permissions } from '../services/ControllerService';

@autoinject
export class SchemeService {

  constructor(
    private arcService: ArcService
    , private web3: Web3Service
    , private organizationService: OrganizationService
  ) {
      this.availableSchemes = [
        this.arcService.deployedArcContracts.SchemeRegistrar
        , this.arcService.deployedArcContracts.UpgradeScheme
        , this.arcService.deployedArcContracts.GlobalConstraintRegistrar
        , this.arcService.deployedArcContracts.SimpleContributionScheme
      ].map((contractInfo) => {
        return {
          address: contractInfo.address,
          permissions: null,
          name: contractInfo.name,
          key: contractInfo.key
        }
      });      
    }

  /**
   * The Arc scheme contracts that we can present to the user
   */
  public availableSchemes: Array<SchemeInfo>;

  /**
   * Schemes, both Arc and otherwise, that are in the given DAO.
   * If not from Arc, then name and key will be empty.
   * @param daoAddress
   */
  public async getSchemesInDao(daoAddress: string): Promise<Array<SchemeInfo>> {
    let arcSchemeInfos = await this.organizationService.getSchemesInOrganization(daoAddress);

    return arcSchemeInfos.map((schemeInfo) => {
      return {
        address: schemeInfo.address,
        permissions: null, //schemeInfo.permissions,
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
