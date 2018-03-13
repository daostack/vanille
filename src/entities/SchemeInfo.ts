import { DaoContractInfo } from './DaoSchemeInfo';
import { ContractInfo } from '../services/ArcService';
import { ArcService } from '../services/ArcService';
/**
 * can be any scheme, in the DAO, not in the DAO, not even in Arc
 * In the DAO: has name, isRegistered is true
 * In Arc but not in the DAO:  has name, isRegistered is true
 * Not in Arc:  has no name, nor a friendlyName
 */
export class SchemeInfo extends DaoContractInfo {

  public static fromOrganizationSchemeInfo(orgSchemeInfo) {
    let schemeInfo = new SchemeInfo();
    schemeInfo.address = orgSchemeInfo.address;
    schemeInfo.name = orgSchemeInfo.name;
    schemeInfo.friendlyName = ArcService.convertKeyToFriendlyName(orgSchemeInfo.name);
    schemeInfo.isRegistered = true;
    return schemeInfo;
  }

  public static fromDaoSchemeInfo(daoSchemeInfo: DaoContractInfo): SchemeInfo {
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
  public get inArc() { return !!this.name; }
}
