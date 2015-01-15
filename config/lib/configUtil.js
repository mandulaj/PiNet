/* Utils for the config files */

// Merge options into defaults
module.exports.merge_options = function (options, defaults){

  var options_final = {};
  for (var attrname in defaults) {
    options_final[attrname] = defaults[attrname];
  }

  if(!options) {
    return options_final;
  }

  for (var attrname in options) {
    options_final[attrname] = options[attrname];
  }
  return options_final;
}
