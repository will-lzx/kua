// pages/detail/detail.js
Page({

  /**
   * Page initial data
   */
  data: {
    id: 0,
    content: '',
    openid: '',
    done: false,
    due: '',
    money: '',
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var db = wx.cloud.database()
    this.setData({
      id:options.id
    }),
    db.collection('qiukua').where({
      _id: this.data.id
    }).get({
      success(res) {
        this.setData({
          content: res.data[0].content,
          openid: res.data[0]._openid,
          done: res.data[0].done,
          due: res.data[0].due,
          money: res.data[0].money
        })
      }
    })
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  }
})