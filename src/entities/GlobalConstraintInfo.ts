import { ArcService, ContractWrapperInfo, DaoGlobalConstraintInfo } from '../services/ArcService';
/**
 * can be any global constraint, in the DAO, not in the DAO, not even in Arc
 * In the DAO: has name, isRegistered is true
 * In Arc but not in the DAO:  has name, isRegistered is true
 * Not in Arc:  has no name, nor a friendlyName
 */
export class GlobalConstraintInfo extends ContractWrapperInfo {

  public isRegistered: boolean;

  public static fromOrganizationGlobalConstraintInfo(orgGCInfo: DaoGlobalConstraintInfo) {
    let gcInfo = new GlobalConstraintInfo();
    gcInfo.address = orgGCInfo.address;
    if (orgGCInfo.wrapper) {
      gcInfo.name = orgGCInfo.wrapper.name;
      gcInfo.friendlyName = orgGCInfo.wrapper.friendlyName;
    }
    gcInfo.isRegistered = true;
    return gcInfo;
  }

  public static fromContractWrapper(wrapper: ContractWrapperInfo, isRegistered: boolean): GlobalConstraintInfo {
    let gcInfo = new GlobalConstraintInfo();
    gcInfo.address = wrapper.address;
    gcInfo.name = wrapper.name;
    gcInfo.friendlyName = wrapper.friendlyName;
    gcInfo.isRegistered = isRegistered;
    return gcInfo;
  }

  public get inDao() { return this.isRegistered; }
  public get inArc() { return !!this.name; }
}
