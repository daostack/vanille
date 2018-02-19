/**
 * from here: http://www.sobell.net/aurelia-async-bindings/
 * 
 * Usage:
 * 
 *  <p>${slowdata}</p>
 *  <p>${slowdata & async}</p>
 *  <p>${slowdata & async:'thinking...'}</p>
 */
export class asyncBindingBehavior {
  bind(binding, source) {
    binding.originalUpdateTarget = binding.updateTarget;

    binding.updateTarget = a => {
      if (typeof a.then === 'function') {
        binding.originalUpdateTarget('...');

        a.then(d => {
          binding.originalUpdateTarget(d);
        });
      }
      else {
        binding.originalUpdateTarget(a);
      }
    };
  }

  unbind(binding) {
    binding.updateTarget = binding.originalUpdateTarget;
    binding.originalUpdateTarget = null;
  }
}
