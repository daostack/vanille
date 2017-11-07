export class TokenCapGC  {

  model: any;

  activate(model:any) {
    model.cap = 0;
    model.votingMachineInfo = null;
    this.model = model;
  }
}
