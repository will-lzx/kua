// pages/publish/publish.js
const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
    getinput: null,
    getcontent: null,
    userInfo: {},
    hasUserInfo: false
  },
  getinput: function(e) {
    this.data.getinput = e.detail.value;
  },
  getcontent: function(e) {
    this.data.getcontent = e.detail.value;
  },

  publish: function() {
    wx.cloud.init()
    if (app.globalData.userInfo)
    {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
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
      var util = require('../../utils/util.js')
      db.collection('qiukua').add({
        data: {
          content: this.data.getcontent,
          money: this.data.getinput,
          due: util.formatTime(new Date()),
          nickname: this.data.userInfo.nickName,
          avatarUrl: this.data.userInfo.avatarUrl,
          gender: this.data.userInfo.gender,
          city: this.data.userInfo.city,
          province: this.data.userInfo.province,
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