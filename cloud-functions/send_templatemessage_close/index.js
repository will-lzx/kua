// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { toUser, formId, title, money } = event
  try {
    console.log(toUser)
    console.log(formId)
    console.log(title)
    console.log(money)
    const result = await cloud.openapi.templateMessage.send({
      touser: toUser,
      page: 'index',
      data: {
        keyword1: {
          value: title
        },
        keyword2: {
          value: '2015年01月05日 12:30'
        },
        keyword3: {
          value: '腾讯微信总部'
        },
        keyword4: {
          value: '广州市海珠区新港中路397号'
        }
      },
      templateId: 'K7dCo-YnvUwOFwBWNjuLGOg4V5zpFDnJ_Q9RiYAP5qA',
      formId: formId,
      emphasis_keyword: title
    })
    return result
  } catch (err) {
    console.log(err)
    return err
  }
}