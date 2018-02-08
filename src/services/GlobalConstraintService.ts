import { autoinject } from "aurelia-framework";
import { ArcService, TruffleContract, ContractInfo } from './ArcService';
import { DaoService, DAO } from './DaoService';
import { SchemeService } from '../services/SchemeService';
import { GlobalConstraintInfo } from "../entities/GlobalConstraintInfo";

@autoinject
export class GlobalConstraintService {

  /**
   * The Arc global contraints that we make available to the user
   */
  public availableConstraints: Array<ContractInfo>;

  constructor(
    private arcService: ArcService
    , private daoService: DaoService
    , private schemeService: SchemeService
  ) {
    this.availableConstraints = this.arcService.arcGlobalConstraints;
  }

  /**
   * Global Constraints in the given DAO, as GlobalConstraintInfos.
   * If not from Arc, then name and friendlyName will be empty.
   * 
   * @param daoAddress
   */
  private async _getGlobalConstraintsInDao(daoAddress: string): Promise<Array<GlobalConstraintInfo>> {
    let dao = await this.daoService.daoAt(daoAddress);
    let constraints = await dao.allGlobalConstraints()
    // console.log('getSchemesInDao from scheme() permissions: ' + arcSchemeInfos.filter((s) => s.contract === "GlobalConstraintRegistrar")[0].permissions);
    return constraints;
  }

  /**
   * Return all Arc global constraints, whether or not in the DAO, as GlobalConstraintInfos.
   * 
   * GlobalConstraintInfo.isRegistered will indicate whether the scheme is in the DAO.
   * If not from Arc, then name and friendlyName will be empty.
   * 
   * @param daoAddress
   * @param excludeNonArcConstraints Default is false
   */
  public async getGlobalConstraintsForDao(daoAddress: string, excludeNonArcConstraints: boolean = false): Promise<Array<GlobalConstraintInfo>> {

    let constraints = (await this._getGlobalConstraintsInDao(daoAddress)).filter((s) => !excludeNonArcConstraints || s.inArc);

    let constraintsMap = new Map<string, GlobalConstraintInfo>();

    for (let gc of constraints) {
      constraintsMap.set(gc.address, gc);
    }

    /**
     * Now merge the list of schemes that the org has with the available Arc schemes that it doesn't have
     * so that the returned list contains all the schemes both contained and not contained by the Dao.
     */
    let availableConstraints = this.availableConstraints;
    for (let gc of availableConstraints) {
      let isInDao = constraintsMap.has(gc.address);
      if (!isInDao) {
        constraints.push(GlobalConstraintInfo.fromContractInfo(gc, false));
      }
    }

    return constraints;
  }

}

export { GlobalConstraintInfo } from "../entities/GlobalConstraintInfo";

export interface GlobalConstraintConfig {
  getConfigurationHash(orgAddress: string, gcAddress?: string);
}

