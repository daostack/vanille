export class AbsoluteVote  {

  model: any;

  activate(model:any) {
    model.votePrec = 50;
    model.ownerVote = true;
    this.model = model;
  }
}
