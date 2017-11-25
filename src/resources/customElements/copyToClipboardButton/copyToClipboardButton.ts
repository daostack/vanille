import { bindable, containerless, autoinject } from 'aurelia-framework';
import { EventAggregator  } from 'aurelia-event-aggregator';

@containerless
@autoinject
export class CopyToClipboardButton {

  /** supply either element or textToCopy */
  @bindable
  element: HTMLElement;

  /** supply either element or textToCopy */
  @bindable
  textToCopy: string;

  @bindable
  message:string = "Copied to the clipboard";

  button: HTMLElement;
  
  constructor(
    private eventAggregator: EventAggregator
  ) {}


  attached() {
    (<any>$(this.button)).tooltip(
      {
        toggle:"tooltip",
        placement:"right",
        title:"Copy to clipboard",
        container:"body",
        trigger:"hover"
      }
    )
    //.css("z-index", "100000")
    ;
  }
  
  listener(e) { e.clipboardData.setData("text/plain", this.textToCopy); e.preventDefault(); }

  copy()
  {
    if (this.element) {
      this.textToCopy = $(this.element).text();
    }

    let handler = this.listener.bind(this);

    document.addEventListener("copy", handler);
    document.execCommand("copy");
    document.removeEventListener("copy", handler);

    // let  div;
    // if ((<any>document).selection)
    // {
    //   /**
    //    * This code block is not tested, I'm not sure in what scenario it applies.
    //    */
    //   div = (<any>document.body).createTextRange();

    //   div.moveToElementText(this.element);
    //   div.select();
    //   document.execCommand("Copy");
    //   $(this.button).blur();
    // }
    // else
    // {
    //   div = document.createRange();

    //   div.setStartBefore(this.element);
    //   div.setEndAfter(this.element) ;

    //   let selection = window.getSelection();

    //   selection.removeAllRanges(); // remove existing selection or it won't work
    //   selection.addRange(div);
    //   document.execCommand("Copy");
    //   selection.removeAllRanges(); // unselect for look and feel
    //   $(this.button).blur();
    // }
    this.eventAggregator.publish("showMessage", this.message);
  }
}
