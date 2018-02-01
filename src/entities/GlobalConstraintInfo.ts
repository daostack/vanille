import { ArcService, ContractInfo } from '../services/ArcService';
/**
 * can be any global constraint, in the DAO, not in the DAO, not even in Arc
 * In the DAO: has name, isRegistered is true
 * In Arc but not in the DAO:  has name, isRegistered is true
 * Not in Arc:  has no name, nor a friendlyName
 */
export class GlobalConstraintInfo extends ContractInfo {

  public isRegistered: boolean;

  public static fromOrganizationGlobalConstraintInfo(orgGCInfo) {
    let gcInfo = new GlobalConstraintInfo();
    gcInfo.address = orgGCInfo.address;
    gcInfo.name = orgGCInfo.name;
    gcInfo.friendlyName = ArcService.convertKeyToFriendlyName(orgGCInfo.name);
    gcInfo.isRegistered = true;
    return gcInfo;
  }

  public static fromContractInfo(contractInfo: ContractInfo, isRegistered: boolean): GlobalConstraintInfo {
    let gcInfo = new GlobalConstraintInfo();
    Object.assign(gcInfo, contractInfo);
    gcInfo.isRegistered = isRegistered;
    return gcInfo;
  }

  public get inDao() { return this.isRegistered; }
  public get inArc() { return !!this.name; }
}
