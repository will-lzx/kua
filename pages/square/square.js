//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    navData: [
      {
        "text": "热门求夸"
      },
      {
        "text": "附近求夸"
      }
    ],
    // tab切换 
    currentTab: 0,
    hot: [],
    near: [],
    best: [],
    best_zan: ''
  },
  onShow: function (options) {
    wx.cloud.init()
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          clientHeight: res.windowHeight
        });
      }
    });
    if (app.globalData.userInfo) {
      that.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        that.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          that.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    };
    const db = wx.cloud.database()
    db.collection('qiukua').where({
      done: false
    }).orderBy('due', 'desc').get({
      success: res => {
        var compare = function (obj1, obj2) {
          var val1 = obj1.due;
          var val2 = obj2.due;
          if (val1 > val2) {
            return -1;
          } else if (val1 < val2) {
            return 1;
          } else {
            return 0;
          }
        }
        res.data.sort(compare)
        this.setData({
          hot: res.data
        })
      }
    }),
    db.collection('qiukua').where({
      done: false
    }).orderBy('due', 'desc').get({
      success: res => {
        var compare = function (obj1, obj2) {
          var val1 = obj1.due;
          var val2 = obj2.due;
          if (val1 > val2) {
            return -1;
          } else if (val1 < val2) {
            return 1;
          } else {
            return 0;
          }
        }
        res.data.sort(compare)
        this.setData({
          near: res.data
        })
      }
    }),
    db.collection('qiukua').where({
      done: false
    }).orderBy('due', 'desc').get({
      success: res => {
        if (res.data.length > 0) {
          this.setData({
            best: res.data[0]
          })
          var _id = res.data[0]._id
          wx.cloud.callFunction({
            // 云函数名称
            name: 'get_zan_by_id',
            // 传给云函数的参数
            data: {
              kua_id: _id
            }
          }).then(res => {
            that.setData({
              best_zan: res.result.total
            })
          })
        }
      }
    })
  },
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },
  bindClick: function (e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id
    })
  },
  swichNav: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  }  
})