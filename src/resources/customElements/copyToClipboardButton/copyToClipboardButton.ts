import { bindable, containerless, autoinject } from 'aurelia-framework';
import { EventAggregator  } from 'aurelia-event-aggregator';

@autoinject
@containerless
export class CopyToClipboardButton {

  @bindable
  element: HTMLElement;

  @bindable
  message:string = "Copied to the clipboard";

  button: HTMLElement;

  constructor(
    private eventAggregator: EventAggregator
  ) {}

  copy()
  {
    let  div;
    if ((<any>document).selection)
    {
      /**
       * This code block is not tested, I'm not sure in what scenario it applies.
       */
      div = (<any>document.body).createTextRange();

      div.moveToElementText(this.element);
      div.select();
      document.execCommand("Copy");
      $(this.button).blur();
    }
    else
    {
      div = document.createRange();

      div.setStartBefore(this.element);
      div.setEndAfter(this.element) ;

      let selection = window.getSelection();

      selection.removeAllRanges(); // remove existing selection or it won't work
      selection.addRange(div);
      document.execCommand("Copy");
      selection.removeAllRanges(); // unselect for look and feel
      $(this.button).blur();
    }
    this.eventAggregator.publish("showMessage", this.message);
  }
}
