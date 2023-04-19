module.exports = {
  printWidth: 70,
  singleQuote: true,
  trailingComma: 'all',
  semi: true,
  overrides: [
    {
      files: '*.yaml',
      options: {
        singleQuote: false,
      },
    },
  ],
};
