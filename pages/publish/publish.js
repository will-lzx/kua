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
    hasUserInfo: false,
    currentWordNum: 0,
    userCity: ''
  },
  getinput: function(e) {
    this.data.getinput = e.detail.value;
  },
  getcontent: function(e) {
    var value = e.detail.value
    this.data.getcontent = value
    this.setData({
      currentWordNum: parseInt(value.length)
    })
  },

  publish: function() {
    let that = this
    wx.cloud.init()
    if (app.globalData.userInfo)
    {
      that.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (that.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        that.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          that.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    var content = that.data.getcontent
    var value = that.data.getinput
    if (content == null || content == '') {
      wx.showToast({
        title: '请输入求夸内容',
        icon: 'loading',
        duration: 2000
      })
    } else if (value == null || value == ''){
      wx.showToast({
        title: '请输入悬赏金额',
        icon: 'loading',
        duration: 2000
      })
    } else if (value >0 && value < 100) {
      wx.cloud.init()
      const db = wx.cloud.database();
      var create_time = new Date()
      console.log(create_time.getTime())
      db.collection('qiukua').add({
        data: {
          content: that.data.getcontent,
          money: that.data.getinput,
          due: create_time.getTime(),
          nickname: that.data.userInfo.nickName,
          avatarUrl: that.data.userInfo.avatarUrl,
          gender: that.data.userInfo.gender,
          city: that.data.userCity,
          province: that.data.userInfo.province,
          tags: [
            'cloud',
          ],
          done: false
        },
        success(res) {
          that.setData({
            getinput: null,
            getcontent: '',
            currentWordNum: 0
          })
          wx.navigateTo({
            url: '/pages/detail/detail?id=' + res._id,
          })
        },
        fail: console.error
      }) 
    } else {
      wx.showToast({
        title: '请输入正确的金额',
        icon: 'loading',
        duration: 2000
      })
    }
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    let that = this
    that.getLocal()
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

  getLocation: function () {
    let that = this
    wx.getLocation({
      type: 'wgs84',
      success(res) {
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
                      console.log('heer')
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
          console.log('zmm1')
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
  }
})