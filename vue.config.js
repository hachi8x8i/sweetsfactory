module.exports = {
  configureWebpack: {
    devtool: "source-map",
  },
  transpileDependencies: ["vuetify"],
  publicPath: "/",
  pluginOptions: {
    express: {
      shouldServeApp: true,//★falseでも変わらない？
      serverDir: "./srv"
    }
  },
  lintOnSave: false
};
