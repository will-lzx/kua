// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const {id} = event
  try {
    const result = await cloud.openapi.wxacode.createQRCode({
      path: '/pages/detail/detail?id=' + id,
      width: 430
    })
    console.log(result)
    return result
  } catch (err) {
    console.log(err)
    return err
  }
}