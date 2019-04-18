// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { qiukua_id, openid, money } = event

  const res = await db.collection('kua').where({
    qiukua_id: qiukua_id
  }).orderBy('due', 'desc').orderBy('zan_count', 'desc').get()

  const length = res.result.data.length

  if (length === 0) {
    db.collection('money').where({
      _openid: openid
    }).update({
      'money': _.inc(money)
    })
  } else if (length <= 3) {
    let av_money = (money * 0.9 / length).toFixed(2)
    db.collection('kua').where({
      qiukua_id: qiukua_id
    }).get().then(res => {
      res.data.forEach((item) => {
        db.collection('money').where({
          _openid: item._openid
        }).update({
          money: _.inc(av_money)
        })
      })
    })
  } else if (length > 20) {
    // pre 3，get 80% money
    let av_money = (money * 0.9 * 0.8 / 3).toFixed(2)
    db.collection('kua').where({
      qiukua_id: qiukua_id
    }).orderBy('zan_count', 'desc').orderBy('due', 'desc').limit(3).get().then(res => {
      res.data.forEach((item) => {
        db.collection('money').where({
          _openid: item._openid
        }).update({
          money: _.inc(av_money)
        })
      })
    })
    let an_money = (money * 0.9 * 0.2 / 17).toFixed(2)
    db.collection('kua').where({
      qiukua_id: qiukua_id
    }).orderBy('zan_count', 'desc').orderBy('due', 'desc').skip(3).limit(20).get().then(res => {
      res.data.forEach((item) => {
        db.collection('money').where({
          _openid: item._openid
        }).update({
          money: _.inc(an_money)
        })
      })
    })

  } else {
    let av_money = (money * 0.9 * 0.8 / 3).toFixed(2)
    db.collection('kua').where({
      qiukua_id: qiukua_id
    }).orderBy('zan_count', 'desc').orderBy('due', 'desc').limit(3).get().then(res => {
      res.data.forEach((item) => {
        db.collection('money').where({
          _openid: item._openid
        }).update({
          money: _.inc(av_money)
        })
      })
    })
    let an_money = (money * 0.9 * 0.2 / (length - 3)).toFixed(2)
    db.collection('kua').where({
      qiukua_id: qiukua_id
    }).orderBy('zan_count', 'desc').orderBy('due', 'desc').skip(3).get().then(res => {
      res.data.forEach((item) => {
        db.collection('money').where({
          _openid: item._openid
        }).update({
          money: _.inc(an_money)
        })
      })
    })
  }
}