// pages/publish/publish.js
const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
    getinput: null,
    getcontent: null
  },
  getinput: function(e) {
    this.data.getinput = e.detail.value;
  },
  getcontent: function(e) {
    this.data.getcontent = e.detail.value;
  },

  publish: function() {
    var userInfo = app.globalData.userInfo
    var content = this.data.getcontent
    var value = this.data.getinput
    if (content == null || content == '') {
      wx.showToast({
        title: '请输入求夸内容'
      })
    } else if (value == null || value == ''){
      wx.showToast({
        title: '请输入悬赏金额'
      })
    } else {
      wx.cloud.init()
      const db = wx.cloud.database();
      db.collection('qiukua').add({
        data: {
          content: this.data.getcontent,
          money: this.data.getinput,
          due: new Date(),
          nickname: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          gender: userInfo.gender,
          city: userInfo.city,
          province: userInfo.province,
          tags: [
            'cloud',
          ],
          done: false
        },
        success(res) {
          wx.navigateTo({
            url: '/pages/detail/detail?id=' + res._id,
          })
        },
        fail: console.error
      }) 
    }
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

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