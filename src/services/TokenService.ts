import { autoinject } from "aurelia-framework";
import { Web3Service } from "./Web3Service";
import { ArcService, TruffleContract } from './ArcService';

@autoinject
export class TokenService {

  constructor(
    private web3: Web3Service
    , private arcService: ArcService
  ) {}

  public async getTokenSymbol(token: TruffleContract): Promise<string> {
    return await token.symbol();
  }

  public async getTokenName(token: TruffleContract): Promise<string> {
    return await token.name();
  }

  public async getUserTokenBalance(token: TruffleContract): Promise<number> {
    let userAddress = this.arcService.defaultAccount;
    return await Number(this.web3.fromWei(await token.balanceOf(userAddress)));
  }

    public async getDAOStackMintableToken() {
      const schemeRegistrar = await this.arcService.getContract("SchemeRegistrar");
      const mintableTokenAddress = await schemeRegistrar.nativeToken();
      return await this.arcService.getContract("MintableToken", mintableTokenAddress);
  }
}
