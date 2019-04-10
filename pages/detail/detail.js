// pages/detail/detail.js
const app = getApp()

Page({

  /**
   * Page initial data
   */
  data: {
    list: [],
    isown: false,
    hasUserInfo: false,
    userInfo: {},
    openid: "",
    own_openid: '',
    is_own: false,
    hiddenmodal: true,
    modalcontent: '',
    getinput: '',
    qiukua_id: '',
    kua_list: [],
    zan_list: [],
    savedImgUrl: '',
    canvasShow: false
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    this.data.qiukua_id = options.id
    const db = wx.cloud.database()
    db.collection('qiukua').where({
      _id: options.id
    }).get({
      success: res => {
        this.setData({
          list: res.data,
          own_openid: res.data[0]._openid
        })
      }
    })
    
    wx.cloud.init()
    var zan_list = []
    db.collection('kua').where({
      qiukua_id: options.id
    }).orderBy('due', 'desc').get({
      success: res => {
        var kua_list = res.data
        kua_list.forEach((item) => {
          wx.cloud.callFunction({
            // 云函数名称
            name: 'get_zan_list',
            // 传给云函数的参数
            data: {
              kua_id: item._id
            }
          }).then(res => {
            var haszan = false
            res.result.data.forEach((item1) => {
              if (item1._openid == this.data.openid) {
                haszan = true
              }
            })
            var o = {
              '_id': item._id,
              '_openid': item._openid,
              'avatarUrl': item.avatarUrl,
              'content': item.content,
              'nickname': item.nickname,
              'qiukua_id': item.qiukua_id,
              'due': item.due,
              'count': res.result.data.length,
              'haszan': haszan
            }
            zan_list.push(o)
            haszan = false
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
            zan_list.sort(compare)
            this.setData({
              zan_list: zan_list
            }) 
          }).catch(err => {
            console.log(err)
          })    
        })
      }
    })
    wx.cloud.callFunction({
      // 云函数名称
      name: 'get_openid',
      // 传给云函数的参数
      data: {
      }
    }).then(res => {
      if (this.data.own_openid == res.result.openid){
        this.setData({
          is_own: true,
          openid: res.result.openid
        })
      } else {
        this.setData({
          is_own: false,
          openid: res.result.openid
        })
      }
    }).catch(err => {
      console.log(err)
    })
    if (app.globalData.userInfo) {
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
  },

  //保存海报
  saveImageToPhoto: function () {
    var that = this
    setTimeout(function () {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: 300,
        height: 420,
        destWidth: 650,
        destHeight: 980,
        canvasId: 'shareCanvas',
        success: function (res) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: function () {
              wx.showModal({
                title: '保存图片成功',
                content: '图片已经保存到相册，快去炫耀吧！',
                showCancel: false,
                success: function (res) {
                  that.setData({
                    canvasShow: false,
                  })
                },
                fail: function (res) { },
                complete: function (res) { },
              });
            },
            fail: function (res) {
              if (res.errMsg == "saveImageToPhotosAlbum:fail cancel") {
                wx.showModal({
                  title: '保存图片失败',
                  content: '您已取消保存图片到相册！',
                  showCancel: false
                });
              } else {
                wx.showModal({
                  title: '提示',
                  content: '保存图片失败，您可以点击确定设置获取相册权限后再尝试保存！',
                  complete: function (res) {
                    if (res.confirm) {
                      wx.openSetting({}) //打开小程序设置页面，可以设置权限
                    } else {
                      wx.showModal({
                        title: '保存图片失败',
                        content: '您已取消保存图片到相册！',
                        showCancel: false
                      });
                    }
                  }
                });
              }
            }
          })
        }
      })
    }, 10000)
  },

  shareFriend: function () {
    this.setData({
      canvasShow: true
    })
    const ctx = wx.createCanvasContext('shareCanvas')

    ctx.drawImage('../../pics/share_bg.jpg', 0, 0, 520, 784)
    ctx.setTextAlign('center')    // 文字居中
    ctx.setFillStyle('#ffffff')  // 文字颜色：白色
    ctx.setFontSize(18)         // 文字字号：28px
    ctx.fillText('昵称刘志祥', 520 / 2, 150)
    
    ctx.setFillStyle('#ffffff')  // 文字颜色：白色
    ctx.setFontSize(40)         // 文字字号：40px
    ctx.fillText('今天嘴巴起泡了，求夸', 500 / 2, 300)
    
    ctx.setTextAlign('left')    // 文字居中
    ctx.setFillStyle('#ffffff')  // 文字颜色：白色
    ctx.setFontSize(18)         // 文字字号：14px
    ctx.fillText('长安识别二维码', 220, 560)
    ctx.fillText('夸他分赏金', 220, 600)
    ctx.fillText('正能量夸夸群', 220, 640)

    const qrImgSize = 120
    ctx.drawImage('../../pics/qrcode.jpg', (qrImgSize) / 2, 540, qrImgSize, qrImgSize)
    ctx.stroke()
    ctx.draw()
    this.saveImageToPhoto()
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

  kuata: function () {
    this.setData({
      hiddenmodal: false
    })
  },

  cancel: function () {
    this.setData({
      hiddenmodal: true,
      modalcontent: ''
    })
  },

  getinput: function(e) {
    this.data.getinput = e.detail.value
  },
  confirm: function (e) {
    var content = this.data.getinput
    var util = require('../../utils/util.js')
    var that = this
    if (content == '') {
      wx.showToast({
        title: '请输入夸赞内容',
        type:"warn"
      })
    } else {
      wx.cloud.init()
      const db = wx.cloud.database();
      db.collection('kua').add({
        data: {
          content: this.data.getinput,
          qiukua_id: this.data.qiukua_id,
          due: util.formatTime(new Date()),
          nickname: this.data.userInfo.nickName,
          avatarUrl: this.data.userInfo.avatarUrl
        },
        success(res) {
          wx.showToast({
            title: '夸赞成功'
          })
          var o = {
            '_id': res._id, '_openid': that.data.openid, 'avatarUrl': that.data.userInfo.avatarUrl, 'nickname': that.data.userInfo.nickName, 'due': util.formatTime(new Date()), 'content': that.data.getinput, 'qiukua_id': that.data.qiukua_id, 'haszan': false, 'count': 0
          }
          var arr = that.data.zan_list
          arr.push(o)
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
          arr.sort(compare)
          that.setData({
            zan_list: arr
          })
        },
        fail: console.error
      }) 
      this.setData({
        hiddenmodal: true,
        modalcontent: ''
      })
    }
  },
  goqiukua: function () {
    wx.reLaunch({
      url: '/pages/publish/publish'
    })
  },
  handlezan: function (e) {
    var kua_id = e.currentTarget.dataset.id
    console.log(kua_id)
    var util = require('../../utils/util.js')
    const db = wx.cloud.database();
    wx.cloud.init()
    var that = this
    db.collection('zan').where({
      kua_id: kua_id
    }).count({
      success(res) {
        if (res.total == 0) {
          db.collection('zan').add({
            data: {
              kua_id: kua_id,
              due: util.formatTime(new Date())
            },
            success(res) {
              var arr = that.data.zan_list
              for (var i = 0; i < arr.length; i++) {
                if (arr[i]._id == kua_id) {
                  arr[i].haszan = true
                  arr[i].count = arr[i].count + 1
                  break;
                }
              }
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
              arr.sort(compare)
              that.setData({
                zan_list: arr
              })
            },
            fail: console.error
          })
        } else {
          wx.cloud.callFunction({
            name: 'delete_zan',
            data: {
              kua_id: kua_id
            }
          }).then(res => {
            var arr = that.data.zan_list
            for (var i = 0; i < arr.length; i++) {
              if (arr[i]._id == kua_id) {
                arr[i].haszan = false
                arr[i].count = arr[i].count - 1
                break;
              }
            }
            that.setData({
              zan_list: arr
            })
          }).catch(err => {
            console.log(err)
          })
        }
      }
    })
  }
})