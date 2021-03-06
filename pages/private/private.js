// pages/private/private.js
const app = getApp()
const util = require('../../utils/util.js')
Page({
  /**
   * Page initial data
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    currentTab: 0,
    mine: [],
    kua: [],
    mine_count: 0,
    kua_count: 0,
    money: 10
  },

  withdraw: function (e) {
    let that = this
    wx.cloud.init()
    wx.navigateTo({
      url: '/pages/withdraw/withdraw?money=' + that.data.money,
    })
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          clientHeight: res.windowHeight
        });
      }
    });
    if (app.globalData.userInfo){
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
    that.getKua()
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

  },

  getKua: function () {
    const db = wx.cloud.database()
    wx.cloud.callFunction({
      // 云函数名称
      name: 'get_kua_by_openid'
    }).then(res => {
      var tmp = []
      res.result.data.forEach((item1) => {
        var that = this
        db.collection('qiukua').where({
          _id: item1.qiukua_id
        }).get({
          success: res => {
            var qiukua = res.data
            db.collection('kua').where({
              qiukua_id: qiukua[0]._id
            }).get({
              success: res => {
                var kua_id_list = []
                var _ = db.command
                var zan_count = 0

                res.data.forEach((item) => {
                  zan_count += item.zan_count
                })
                tmp.push({ 'id': item1.qiukua_id, 'content': item1.content, 'qiukua_content': qiukua[0].content, 'zan_count': zan_count })
                that.setData({
                  kua: tmp,
                  kua_count: tmp.length
                })
              }
            })
          }
        })
      })
    })
  },

  getQiukua: function () {
    wx.cloud.init()
    const db = wx.cloud.database()
    wx.cloud.callFunction({
      // 云函数名称
      name: 'get_mine_qiukua'
    }).then(res => {
      var tmp = []
      res.result.data.forEach((item1) => {
        db.collection('kua').where({
          qiukua_id: item1._id
        }).get({
          success: res => {
            var kua_id_list = []
            var zan_count = 0
            res.data.forEach((item2) => {
              kua_id_list.push(item2._id)
              zan_count += item2.zan_count
            })

            tmp.push({ 'id': item1._id, 'content': item1.content, 'due': util.formatTime(new Date(item1.due)), 'money': item1.money, 'zan_count': zan_count })
            this.setData({
              mine: tmp,
              mine_count: tmp.length
            })
          }
        })
      })
    })
  },

  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },

  swichNav: function (e) {
    var that = this;
    if (that.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
      if (that.data.currentTab === '0') {
        that.getKua()
      } else {
        that.getQiukua()
      }
    }
  },
  bindClick: function (e) {
    var id = e.currentTarget.dataset.id
    console.log('id', id)
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id
    })
  }
})
