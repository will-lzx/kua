// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const { qiukua_id } = event
  const { OPENID } = cloud.getWXContext()

  var total = 0
  db.collection('kua').where({
    qiukua_id: qiukua_id
  }).get({
    success: res => {
      res.result.data.forEach((item) => {
        var count = db.collection('zan').where({
          kua_id: item._id
        }).count()
        total += count
      })
    }
  })
  return total
}