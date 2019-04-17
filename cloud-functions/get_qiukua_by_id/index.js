// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { qiukua_id } = event
  const { OPENID } = cloud.getWXContext()
  try {
    return await db.collection('qiukua').where({
      _id: qiukua_id
    }).get()
  } catch (e) {
    console.error(e)
  }
}