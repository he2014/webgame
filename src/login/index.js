import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { queryUserInfo, queryTimInfo, mutationTouristsLogin } from '@/api/index'
import MessageManage from '@/plugins/webIM/message-manage'
import VueApollo from 'vue-apollo'
let uri1 = '/graphql'
let uri2 = '/api'
// Create the apollo client
const v1ApolloClient = new ApolloClient({
  link: new HttpLink({
    // You should use an absolute URL here
    uri: uri1
  }),
  cache: new InMemoryCache(),
  connectToDevTools: true
})

const v2ApolloClient = new ApolloClient({
  link: new HttpLink({
    uri: uri2
  }),
  cache: new InMemoryCache(),
  connectToDevTools: true
})

// Install the vue plugin
export const apolloProvider = new VueApollo({
  clients: {
    v1: v1ApolloClient,
    v2: v2ApolloClient
  },
  defaultClient: v1ApolloClient
})
export let longin = async () => {
  let token = ''
  if (token) {
    try {
      let result = await v2ApolloClient.query({
        query: queryUserInfo,
        variables: {
          token: token
        }
      })
      let userInfo = result.data.userinfo
      console.log(result)
      let sigResult = await v2ApolloClient.query({
        query: queryTimInfo,
        variables: {
          identifier: `lf_${userInfo.uid}`
        }
      })
      await MessageManage.im.loginTim(userInfo.uid, sigResult.data.timInfo.usersig)
    } catch (e) {
    }
  } else {
    // 默认游客登录
    try {
      let result = await v2ApolloClient.mutate({
        mutation: mutationTouristsLogin,
        variables: {
          touristsID: 'uuid'
        },
        client: 'v2'
      })
      console.log(result)
      let userInfo = result.data.touristsLogin.user
    } catch (e) {
      console.log(e)
    }
  }
}
