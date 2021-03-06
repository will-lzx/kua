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
    best_kua_content: '',
    best_qiukua_content: '',
    best_zan_count: 0,
    userCity: ''
  },
  onLoad: function (options) {
    wx.cloud.init()
    const db = wx.cloud.database()
    var that = this
    that.getLocal()
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
    
    that.getHot()

    const _ = db.command
    const date_now = new Date()
    date_now.setHours(0)
    date_now.setMinutes(0)
    date_now.setSeconds(0)
    const expect_date = date_now.getTime()
    db.collection('kua').where({
      due: _.gte(expect_date)
    }).orderBy('zan_count', 'desc').limit(1).get().then(res => {
      if (res.data.length > 0) {
        db.collection('qiukua').where({
          _id: res.data[0].qiukua_id
        }).get().then(res2 => {
          that.setData({
            best_kua_content: res.data[0].content,
            best_zan_count: res.data[0].zan_count,
            best_qiukua_content: res2.data[0].content
          })
        })
      } else {
        that.setData({
          best_kua_content: '最佳夸赞，虚席以待',
          best_zan_count: 0,
          best_qiukua_content: '快来发布一个求夸，登上今日最佳吧'
        })
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
    if (that.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
      if (that.data.currentTab === '0') {
        that.getHot()
      } else {
        that.getNear()
      }
    }
  },

  getNear: function () {
    const db = wx.cloud.database()
    var that = this
    db.collection('qiukua').where({
      done: false,
      city: that.data.userCity
    }).orderBy('due', 'desc').get({
      success: res => {
        that.setData({
          near: res.data
        })
      }
    })
  },
  getHot: function () {
    console.log('why')
    var that = this
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
        that.setData({
          hot: res.data
        })
      }
    })
  },

  getLocation: function () {
    let that = this
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        console.log('来了吗？')
        const latitude = res.latitude
        const longitude = res.longitude
        that.getCityName(latitude, longitude)
      }
    })
  },

  getLocal: function () {
    let that = this
    wx.getSetting({
      success: (res) => {
        // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面
        // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权
        // res.authSetting['scope.userLocation'] == true    表示 地理位置授权
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置，请确认授权',
            success: function (res) {
              if (res.cancel) {
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none',
                  duration: 1000
                })
              } else if (res.confirm) {
                wx.openSetting({
                  success: function (dataAu) {
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })
                      that.getLocation()
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {
          wx.getLocation({
            success: function (data) {
              console.log(data);
              wx.showToast({ //这里提示失败原因
                title: '授权成功！',
                duration: 1500
              })
              that.getLocation()
            }
          })
        }
        else {
          that.getLocation()
        }
      }
    })
  },

  getCityName: function (latitude, longitude) {
    let that = this
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + latitude + ',' + longitude + '&key=SB7BZ-6VKHO-LX4WZ-S2H4X-3DBG5-BCBLE',
      data: {},
      success: function (res) {
        that.data.userCity = res.data.result.address_component.city
      },
      fail: function (res) {
      }
    })
  },
  onPullDownRefresh() {
    this.onLoad()
  },
})