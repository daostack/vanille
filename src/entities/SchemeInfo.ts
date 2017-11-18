import { DaoSchemeInfo } from './DAOSchemeInfo';
import { ContractInfo } from '../services/ArcService';
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
