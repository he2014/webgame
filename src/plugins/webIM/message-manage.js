import TencentIm from './tencent-im'

const Tim = new TencentIm()
function install (Vue, options) {
  const lefanImKey = Symbol('lefanImKey')

  function addLefanImData (vm, key, data) {
    vm[lefanImKey] = vm[lefanImKey] || {}
    vm[lefanImKey][key] = data
  }

  function getLefanImData (vm, key) {
    if (vm[lefanImKey]) {
      return vm[lefanImKey][key]
    }
  }

  Vue.mixin({
    created: function () {
      const listenerNames = Tim.option.listenerNames
      const methods = this.$options.methods
      if (methods) {
        listenerNames.forEach(name => {
          if (methods[name] !== undefined) {
            Tim.on(name, methods[name], this)
          }
        })
      }
    },
    destroyed: async function () {
      const listenerNames = Tim.option.listenerNames
      const methods = this.$options.methods
      if (methods) {
        listenerNames.forEach(name => {
          Tim.off(name, methods[name], this)
        })
      }
      // const bigGroupID = getLefanImData(this, 'bigGroupID')
      // console.log(bigGroupID, 'biggroup idddddd')
      // if (bigGroupID) {
      //   await Tim.quitBigGroup(bigGroupID)
      // }
    }
  })

  Vue.prototype.lefanImLogin = async (uid, sig) => {
    try {
      await Tim.loginTim(uid, sig)
    } catch (e) {
      console.log(e)
    }
  }

  Vue.prototype.lefanImJoinGroup = async function (groupID, global = false) {
    try {
      await Tim.applyJoinGroup(groupID)
      if (!global) {
        addLefanImData(this, 'bigGroupID', groupID)
      }
    } catch (e) {
      console.log(e)
    }
  }

  Vue.prototype.lefanImQuitGroup = async groupID => {
    try {
      await Tim.quitGroup(groupID)
    } catch (e) {
      console.log(e)
    }
  }

  Vue.prototype.lefanImJoinBigGroup = async function (groupID, global = false) {
    try {
      await Tim.applyJoinBigGroup(groupID)
      if (!global) {
        addLefanImData(this, 'bigGroupID', groupID)
      }
    } catch (e) {
      console.log(e)
    }
  }

  Vue.prototype.lefanImQuitBigGroup = async groupID => {
    try {
      await Tim.quitBigGroup(groupID)
    } catch (e) {
      console.log(e)
    }
  }

  Vue.prototype.sendGroupMsg = async (groupId, msg, user) => {
    try {
      await Tim.sendGroupMsg(groupId, msg, user)
    } catch (e) {
      console.log(e)
    }
  }
}

export default { install, im: Tim }
