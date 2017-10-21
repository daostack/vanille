import { customAttribute, bindable, autoinject } from 'aurelia-framework';
import { Router } from 'aurelia-router';

@customAttribute('click-to-route')
@autoinject
export class ClickToRoute {

  @bindable({ primaryProperty: true }) route: string;
  @bindable params?: Object;

  constructor(private element: Element, private router: Router) {
  }

  attached() {
    this.element.addEventListener("click", () => {
      this.router.navigateToRoute(this.route, this.params);
    });
  }
}
