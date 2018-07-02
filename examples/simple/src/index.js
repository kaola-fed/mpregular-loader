import App from './index.rgl'

const app = new App()

app.$inject()

export default {
  config: {
    pages: ['^pages/detail/index'],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black'
    },
    subPackages: [
      {
        root: "a",
        pages: [
          "pages/detail",
          "pages/detail2"
        ]
      },
      // {
      //   root: "b",
      //   pages: [
      //     "pages/test",
      //   ]
      // }
    ]
  }
}
