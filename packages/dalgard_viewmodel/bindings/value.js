ViewModel.addBinding("value", function (data, args, kwhash) {
  var throttle = kwhash.throttle || args[1],
      get = function (event, $elem, prop) {
        prop($elem.val());
      };

  if (throttle)
    get = _.throttle(get, throttle, { leading: false });

  return {
    set: function ($elem, new_value) {
      $elem.val(new_value);
    },
    
    on: "cut paste keyup input change",

    get: get
  };
});