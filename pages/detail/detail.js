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
    canvasShow: false,
    wxTimerList: {},
    done: false
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    
    this.data.qiukua_id = options.id
    const db = wx.cloud.database()
    var that = this
    db.collection('qiukua').where({
      _id: options.id
    }).get({
      success: res => {
        that.setData({
          list: res.data,
          own_openid: res.data[0]._openid
        })
        console.log(res.data[0])
        if (res.data[0].done) {
          that.setData({
            done: true
          })
        } else {
          
          var t = res.data[0].due
          var t_now = new Date()
          console.log(t)
          console.log(t_now.getTime())
          var t_cha = 12 * 60 * 60 * 1000 - (t_now.getTime() - t)
          var timer = app.globalData.timer
          var wxTimer = new timer({
            beginTime: dateformat(t_cha),
            complete: function () {
              that.setData({
                done: true
              })
            }
          })
          wxTimer.start(this);
        }
      }
    })
    
    wx.cloud.init()
    var util = require('../../utils/util.js')
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
              if (item1._openid == that.data.openid) {
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
              'due': util.formatTime(new Date(item.due)),
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
            that.setData({
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
      if (that.data.own_openid == res.result.openid){
        that.setData({
          is_own: true,
          openid: res.result.openid
        })
      } else {
        that.setData({
          is_own: false,
          openid: res.result.openid
        })
      }
    }).catch(err => {
      console.log(err)
    })
    if (app.globalData.userInfo) {
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
  },

  //保存海报
  saveImageToPhoto: function () {
    var that = this
    setTimeout(function () {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: 390,
        height: 500,
        destWidth: 780,
        destHeight: 1000,
        canvasId: 'shareCanvas',
        success: function (res) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: function () {
              wx.showModal({
                title: '图片保存成功',
                content: '图片已存到相册，快去分享吧！',
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
                  title: '图片生成失败',
                  content: '您已取消分享，图片未生成！',
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
                        content: '您已取消分享，图片未生成！',
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
    }, 100)
  },

  shareFriend: function () {
    this.setData({
      canvasShow: true
    })
    const ctx = wx.createCanvasContext('shareCanvas')

    ctx.drawImage('../../pics/share_bg.jpg', 0, 0, 390, 500)
    // 下面是动态获取的求夸者的昵称
    ctx.setTextAlign('left')    // 文字居中
    ctx.setFillStyle('#333')  // 文字颜色：白色
    ctx.setFontSize(16)         // 文字字号：28px
    ctx.fillText('昵称:' + this.data.userInfo.nickName, 20, 430)
    
    // 下面是动态获取的求夸内容主题
    ctx.setTextAlign('center')    // 文字居中
    ctx.setFillStyle('#ffffff')  // 文字颜色：白色
    ctx.setFontSize(36)         // 文字字号：36px
    ctx.setShadow(0, 3, 1, '#d2321e')  // 字体阴影
    console.log(this.data.list)
    var text = this.data.list[0]['content'];//这是要绘制的文本，动态取求夸的内容
    var chr = text.split("");//这个方法是将一个字符串分割成字符串数组
    var temp = "";
    var row = [];
    for (var a = 0; a < chr.length; a++) {
      if (ctx.measureText(temp).width < 270) {
        temp += chr[a];
      }
      else {
        a--; //这里添加了a-- 是为了防止字符丢失，效果图中有对比
        row.push(temp);
        temp = "";
      }
    }
    row.push(temp);

    //如果数组长度大于2 则截取前两个
    if (row.length > 2) {
      var rowCut = row.slice(0, 2);
      var rowPart = rowCut[1];
      var test = "";
      var empty = [];
      for (var a = 0; a < rowPart.length; a++) {
        if (ctx.measureText(test).width < 250) {
          test += rowPart[a];
        }
        else {
          break;
        }
      }
      empty.push(test);
      var group = empty[0] + "..."//这里只显示两行，超出的用...表示
      rowCut.splice(1, 1, group);
      row = rowCut;
    }
    for (var b = 0; b < row.length; b++) {
      ctx.fillText(row[b], 197,125 + b * 44, 270);
    }
  
    ctx.setShadow(0, 0, 0, '#a91704')  // 字体阴影
    ctx.setTextAlign('left')    // 文字居中
    ctx.setFillStyle('#666666')  // 文字颜色：白色
    ctx.setFontSize(14)         // 文字字号：14px
    ctx.fillText('长安识别二维码,夸他分赏金', 20, 460)
    ctx.fillText('正能量夸夸群', 20, 485)

    const qrImgSize = 90
    ctx.drawImage('../../pics/qrcode.jpg', 280, 405, qrImgSize, qrImgSize)
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
      var create_time = new Date()
      db.collection('kua').add({
        data: {
          content: this.data.getinput,
          qiukua_id: this.data.qiukua_id,
          due: create_time.getTime(),
          nickname: this.data.userInfo.nickName,
          avatarUrl: this.data.userInfo.avatarUrl
        },
        success(res) {
          wx.showToast({
            title: '夸赞成功'
          })
          let kua_time = new Date()
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
    const db = wx.cloud.database();
    wx.cloud.init()
    var that = this
    var create_time = new Date()
    db.collection('zan').where({
      kua_id: kua_id
    }).count({
      success(res) {
        if (res.total == 0) {
          db.collection('zan').add({
            data: {
              kua_id: kua_id,
              due: create_time.getTime()
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

function dateformat(micro_second) {
  var second = micro_second / 1000

  // 天数位   
  var day = Math.floor(second / 3600 / 24);
  var dayStr = day.toString();
  if (dayStr.length == 1) dayStr = '0' + dayStr;

  console.log(dayStr)
  // 小时位   
  //var hr = Math.floor(second / 3600 % 24);
  var hr = Math.floor(second / 3600);  //直接转为小时 没有天 超过1天为24小时以上

  var hrStr = hr.toString();
  if (hrStr.length == 1) hrStr = '0' + hrStr;
  console.log(hrStr)

  // 分钟位  
  var min = Math.floor(second / 60 % 60);
  var minStr = min.toString();
  if (minStr.length == 1) minStr = '0' + minStr;

  // 秒位  
  var sec = Math.floor(second % 60);
  var secStr = sec.toString();
  if (secStr.length == 1) secStr = '0' + secStr;

  return hrStr + ":" + minStr + ":" + secStr;

}

