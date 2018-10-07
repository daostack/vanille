import { Address } from 'services/ArcService';
import { SchemeInfo } from 'services/SchemeService';
import { VanilleDAO } from 'services/DaoService';

export interface SchemeDashboardModel {
  friendlyName: string;
  name: string;
  address: Address;
  org: VanilleDAO;
  orgName: string;
  orgAddress: Address;
  allSchemes: Array<SchemeInfo>;
}
