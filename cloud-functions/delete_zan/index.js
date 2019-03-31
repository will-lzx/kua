// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const {kua_id} = event
  try {
    return await db.collection('zan').where({
      kua_id: kua_id,
      _openid: OPENID
    }).remove()
  } catch (e) {
    console.error(e)
  }
}