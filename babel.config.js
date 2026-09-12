module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.js', '.jsx', '.json'],
        alias: {
          '@components': './src/components',
          '@screens':    './src/screens',
          '@navigation': './src/navigation',
          '@theme':      './src/theme',
        },
      },
    ],
  ],
};
