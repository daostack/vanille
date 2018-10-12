import { bindable, containerless, autoinject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

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
  message: string = "Copied to the clipboard";

  button: HTMLElement;

  constructor(
    private eventAggregator: EventAggregator
  ) { }


  attached() {
    (<any>$(this.button)).tooltip(
      {
        toggle: "tooltip",
        placement: "right",
        title: "Copy to clipboard",
        trigger: "hover"
      }
    )
      //.css("z-index", "100000")
      ;
  }

  listener(e) { e.clipboardData.setData("text/plain", this.textToCopy); e.preventDefault(); }

  copy(e: Event) {
    if (this.element) {
      this.textToCopy = $(this.element).text();
    }

    let handler = this.listener.bind(this);

    document.addEventListener("copy", handler);
    document.execCommand("copy");
    document.removeEventListener("copy", handler);

    this.eventAggregator.publish("showMessage", this.message);

    e.stopPropagation();
  }
}
