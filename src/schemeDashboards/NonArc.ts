import { autoinject } from "aurelia-framework";
import { DaoSchemeDashboard } from "./schemeDashboard"
import { IContractWrapper, WrapperService } from 'services/ArcService';
import { SchemeDashboardModel } from 'schemeDashboards/schemeDashboardModel';
import { App } from 'app';

@autoinject
export class NonArc extends DaoSchemeDashboard {

  private static _factoryNames = App.SchemeDashboards.filter((s: string) => s !== "NonArc");
  private factoryNames = NonArc._factoryNames;
  private selectedFactory: string = null;
  private factories = WrapperService.factories;

  schemeDashboardModel: SchemeDashboardModel = {} as SchemeDashboardModel;

  async onItemClick(factoryName: string) {

    const factory = this.factories[factoryName];
    const wrapper = await factory.at(this.address) as IContractWrapper;
    this.schemeDashboardModel = {
      friendlyName: wrapper.friendlyName,
      name: wrapper.name,
      address: wrapper.address,
      org: this.org,
      orgName: this.orgName,
      orgAddress: this.orgAddress,
      allSchemes: this.allSchemes
    }
    this.selectedFactory = factoryName;
  }
}
