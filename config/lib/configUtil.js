/* Utils for the config files */

// Merge options into defaults
module.exports.merge_options = function(options, defaults) {

  var options_final = {};
  for (var attrname1 in defaults) {
    options_final[attrname1] = defaults[attrname1];
  }

  if (!options) {
    return options_final;
  }

  for (var attrname2 in options) {
    options_final[attrname2] = options[attrname2];
  }
  return options_final;
};