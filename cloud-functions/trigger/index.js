// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  var n = new Date()
  // 12 hours
  var n_s = n.getTime() - 720 * 60 * 1000
  const _ = db.command
  const res = await db.collection('qiukua').where({
    done: false,
    due: _.lt(n_s)
  }).get()
  await db.collection('qiukua').where({
    done: false,
    due: _.lt(n_s)
  }).update({
    data: {
      done: true
    },
  })
  res.data.forEach((item) => {
    cloud.callFunction({
      name: 'dis_shangjin',
      data: {
        qiukua_id: item._id,
        openid: item._openid,
        money: item.money
      }
    })
  })
}