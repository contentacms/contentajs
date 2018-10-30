module.exports = {
  Recipe: {
    // This is one of the big wins of having GraphQL in node.js and not in PHP.
    // Imagine that this field instead of generating a random value fetches
    // reviews for the current recipe from a 3rd party site. You don't have to
    // suffer a VERY HIGH performance degradation due to the HTTP request since
    // node.js has non-blocking I/O. Drupal has not.
    random: (obj, args, context, info) => `${Math.random()}::${info.fieldName}`,
  },
};
