ViewModel.addBinding("checked", {
  set: function ($elem, new_value) {
    $elem.prop("checked", new_value);
  },

  on: "change",

  get: function (event, $elem) {
    return $elem.prop("checked");
  }
});