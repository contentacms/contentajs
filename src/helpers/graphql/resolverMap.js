module.exports = {
  Recipe: {
    random: (obj, args, context, info) => `${Math.random()}::${info.fieldName}`,
  },
};
