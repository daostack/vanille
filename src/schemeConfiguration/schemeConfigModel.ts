
export interface SchemeConfigModel {
  getConfigurationHash(orgAddress: string, schemeAddress?: string, ): Promise<string>;
}
