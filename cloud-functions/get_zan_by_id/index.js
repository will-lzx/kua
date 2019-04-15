// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => await db.collection('zan').where({
  kua_id: event.kua_id
}).count()

