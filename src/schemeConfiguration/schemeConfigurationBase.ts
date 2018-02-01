export interface SchemeConfigurator {
  /**
   * subclasses must implement this to return an object with properties that
   * Arc will map to parameters for the given scheme.
   */
  getConfigurationHash(orgAddress: string, schemeAddress?: string, ): Promise<string>;
}
