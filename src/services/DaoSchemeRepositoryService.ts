import { autoinject } from "aurelia-framework";
import { ArcService, ContractInfo } from '../services/ArcService';
import { OrganizationService, Organization } from '../services/OrganizationService';
import { DaoSchemeDashboard } from "../daoSchemeDashboards/daoSchemeDashboard";

@autoinject
export class DaoSchemeRepositoryService {

  private registerSchemaEvent:any;
  
  constructor(
    private organizationService: OrganizationService
    , private arcService: ArcService
    , private daoSchemeDashboard: DaoSchemeDashboard
  ) {      
}
 
  public dashboardForScheme(schemeKey: string) {
  }
}
