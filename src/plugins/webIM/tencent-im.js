import webim from '@/plugins/webIMsdk/webim'
import { TencentImError } from './errors'
import constant from './constant'
import { type } from './leo-tools/util'

const TENCENT_WEB_IM = constant.TENCENT_WEB_IM

export default class TencentIm {
  static defOption = {
    listenerNames: ['onConnNotify', 'onMsgNotify', 'onBigGroupMsgNotify']
  }

  constructor (option = {}) {
    this.isLogin = false
    this.option = Object.assign({}, TencentIm.defOption, option)
    this.setListeners()
  }

  static createTencentImError (err, isImError = true) {
    let errorArg = {}
    if (isImError) {
      errorArg.message = err.ErrorInfo
      errorArg.code = err.ErrorCode
      errorArg.detail = err
    } else {
      errorArg = err
    }
    return new TencentImError(errorArg)
  }

  setListeners (listenerNames = this.option.listenerNames) {
    const listeners = (this.listeners = {})
    listenerNames.forEach((name, i) => {
      if (type(this[name] === 'Function')) {
        listeners[name] = this[name].bind(this)
        this[`${name}Events`] = this[`${name}Events`] || []
      }
    })
    return listeners
  }

  loginTim (anchorId, userSig) {
    return new Promise((resolve, reject) => {
      let loginInfo = {
        sdkAppID: TENCENT_WEB_IM.sdkAppID,
        appIDAt3rd: TENCENT_WEB_IM.appIDAt3rd,
        accountType: TENCENT_WEB_IM.accountType,
        identifier: `lf_${anchorId}`,
        userSig
      }
      let listeners = {
        onConnNotify: this.onConnNotify.bind(this), // 监听连接状态回调变化事件,必填
        // ,"jsonpCallback": jsonpCallback//IE9(含)以下浏览器用到的jsonp回调函数，
        onMsgNotify: this.onMsgNotify.bind(this), // 监听新消息(私聊，普通群(非直播聊天室)消息，全员推送消息)事件，必填
        onBigGroupMsgNotify: this.onBigGroupMsgNotify.bind(this), // 监听新消息(直播聊天室)事件，直播场景下必填
        // onGroupSystemNotifys: this.onGroupSystemNotifys.bind(this) //监听（多终端同步）群系统消息事件，如果不需要监听，可不填
        // ,"onGroupInfoChangeNotify": onGroupInfoChangeNotify//监听群资料变化事件，选填
        // ,"onFriendSystemNotifys": onFriendSystemNotifys//监听好友系统通知事件，选填
        // ,"onProfileSystemNotifys": onProfileSystemNotifys//监听资料系统（自己或好友）通知事件，选填
        // ,"onKickedEventCall" : onKickedEventCall//被其他登录实例踢下线
        // ,"onC2cEventNotifys": onC2cEventNotifys//监听C2C系统消息通道
      }
      webim.login(
        loginInfo,
        this.listeners,
        {
          isLogOn: false
        },
        resp => {
          console.log('登陆成功')
          this.isLogin = true
          resolve(resp)
        },
        err => {
          reject(TencentIm.createTencentImError(err))
        }
      )
    })
  }

  applyJoinGroup (GroupId) {
    return new Promise((resolve, reject) => {
      let options = {
        GroupId: GroupId
      }
      console.log('加入房间', GroupId)
      webim.applyJoinGroup(
        options,
        resp => {
          if (resp.JoinedStatus && resp.JoinedStatus === 'JoinedSuccess') {
            console.log('加入房间成功')
            resolve(resp)
          } else {
            console.log('加入房间失败')
            reject(
              TencentIm.createTencentImError({
                message: '加入房间失败'
              }),
              true
            )
          }
        },
        err => {
          console.log(err, '加入房间失败')
          reject(TencentIm.createTencentImError(err))
        }
      )
    })
  }

  quitGroup (GroupId) {
    return new Promise((resolve, reject) => {
      let options = {
        GroupId: GroupId
      }
      webim.quitGroup(
        options,
        resp => {
          console.log('退出房间成功', resp)
          resolve(resp)
        },
        err => {
          reject(TencentIm.createTencentImError(err))
        }
      )
    })
  }

  applyJoinBigGroup (GroupId) {
    return new Promise((resolve, reject) => {
      let options = {
        GroupId: GroupId
      }
      webim.applyJoinBigGroup(
        options,
        resp => {
          if (resp.JoinedStatus && resp.JoinedStatus === 'JoinedSuccess') {
            console.log('加入大群成功')
            resolve(resp)
          } else {
            console.log('加入房间失败')
            reject(
              TencentIm.createTencentImError({
                message: '加入房间失败'
              }),
              true
            )
          }
        },
        err => {
          reject(TencentIm.createTencentImError(err))
        }
      )
    })
  }

  quitBigGroup (GroupId) {
    return new Promise((resolve, reject) => {
      let options = {
        GroupId: GroupId
      }
      webim.quitBigGroup(
        options,
        resp => {
          console.log('退出大群成功', resp)
          resolve(resp)
        },
        err => {
          reject(TencentIm.createTencentImError(err))
        }
      )
    })
  }

  sendGroupMsg (groupId, content, user) {
    return new Promise((resolve, reject) => {
      if (!groupId) {
        reject(TencentIm.createTencentImError(new Error('缺少groupId参数')))
        return
      }
      let { uid, name } = user
      if (!uid) {
        reject(TencentIm.createTencentImError(new Error('缺少uid参数')))
        return
      }
      let msgLen = webim.Tool.getStrBytes(content);
      if (msgLen > webim.MSG_MAX_LENGTH.GROUP) {
        reject(TencentIm.createTencentImError(new Error('消息长度超出限制(最多' + Math.round(maxLen / 3) + '汉字)')))
        return
      }
      let selectedSession = webim.MsgStore.sessByTypeId(webim.SESSION_TYPE.GROUP, groupId);
      if (!selectedSession) {
        selectedSession = new webim.Session(webim.SESSION_TYPE.GROUP, groupId, groupId, '', Math.round(new Date().getTime() / 1000))
      }
      let isSend = true // 是否为自己发送
      let seq = -1       // 消息序列，-1表示 IM SDK 自动生成，用于去重
      let random = Math.round(Math.random() * 4294967296)   // 消息随机数，用于去重
      let msgTime = Math.round(new Date().getTime() / 1000) // 消息时间戳
      let msg = new webim.Msg(selectedSession, isSend, seq, random, msgTime, uid, webim.GROUP_MSG_SUB_TYPE.COMMON, name);
      msg.addText(new webim.Msg.Elem.Text(content));
      webim.sendMsg(
        msg,
        resp => {
          console.log('发送成功')
          resolve(resp)
        },
        err => {
          reject(TencentIm.createTencentImError(err))
        }
      )
    })
  }

  on (name, fn, _self) {
    const events = this[`${name}Events`]
    if (events && type(fn) === 'Function') {
      events.push(fn.bind(_self))
    }
  }

  off (name, fn, _self) {
    // console.log(events, 'on events')
  }

  off (name, fn, _self) {
    // console.log(this, 'off  thissss')
    const events = this[`${name}Events`]
    if (events && type(fn) === 'Function') {
      // console.log(events.indexOf(fn), 'indexof')
      events.length = 0
      // console.log(events, 'eventssssss')
      // forEach(events, (item, index) => {
      //   console.log(item.toString(), 'tttttttttttsssss')
      //   if (item.toString() == fn.toString()) {
      //     if (index > -1) {
      //       console.log(index, 'indexxxxxxx')
      //       events.splice(index, 1)
      //     }
      //   }
      // })
    }
  }

  static emit (events, args) {
    const len = events.length
    if (len) {
      for (let i = 0; i < len; i++) {
         events[i](...args)
        //  console.log(i, 'iiiiiii')
      }
    }
  }

  onConnNotify (...args) {
    // TencentIm.emit(this.onConnNotifyEvents, args)
  }

  onMsgNotify (...args) {
    TencentIm.emit(this.onMsgNotifyEvents, args)
  }

  onBigGroupMsgNotify (...args) {
    TencentIm.emit(this.onBigGroupMsgNotifyEvents, args)
  }
}
