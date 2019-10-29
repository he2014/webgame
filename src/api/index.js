import gql from 'graphql-tag'

// 用户注册
let mutationRegister = gql`
  mutation register(
    $name: String
    $realName: String
    $email: String
    $code: String
    $phone: String
    $password: String
    $registerURL: String
    $linkID: String
  ) {
    register(
      name: $name
      realName: $realName
      email: $email
      code: $code
      phone: $phone
      password: $password
      registerURL: $registerURL
      linkID: $linkID
    ) {
      __typename
      msg
      uid
    }
  }
`

// 获取极验配置数据
let queryGeetest = gql`
  query verificationCode {
    verificationCode {
      challenge
      gt
      new_captcha
      success
      fallback
    }
  }
`

// 获取验证码
let mutationCheckCode = gql`
  mutation checkCode(
    $phone: String!
    $email: String!
    $geetest_challenge: String!
    $geetest_validate: String!
    $geetest_seccode: String!
    $fallback: Boolean!
  ) {
    checkCode(
      phone: $phone
      email: $email
      geetest_challenge: $geetest_challenge
      geetest_validate: $geetest_validate
      geetest_seccode: $geetest_seccode
      fallback: $fallback
    ) {
      __typename
      msg
    }
  }
`
// 用户名密码登录
let mutationTouristsLogin = gql`
  mutation touristsLogin($touristsID: String) {
    touristsLogin(touristsID: $touristsID) {
      __typename
      msg
      user {
        __typename
        ...UserFragment
      }
    }
  }

  fragment UserFragment on UserType {
    __typename
    id
    uid
    name
    realName
    token
    birthday
    accounts {
      __typename
      accountID
      uid
      accountType
      openTime
      accountTotal
    }
  }
`

// 用户名密码登录
let mutationLoginWithPassword = gql`
  mutation loginWithPassword($account: String, $password: String) {
    loginWithPassword(account: $account, password: $password) {
      __typename
      msg
      user {
        __typename
        ...UserFragment
      }
    }
  }

  fragment UserFragment on UserType {
    __typename
    id
    uid
    name
    realName
    avatar
    token
    sex
    email
    telephone
    latestLoginTime
    birthday
    isNew
    bindedWeixin
    bindedQQ
    accounts {
      __typename
      accountID
      uid
      accountType
      openTime
      accountTotal
    }
    betLimit{
      betMin
      betMax
    }
  }
`

// 查询用户信息
let queryUserInfo = gql`
  query userinfo($token: String!) {
    userinfo(token: $token) {
      __typename
      ...UserFragment
    }
  }

  fragment UserFragment on UserType {
    __typename
    id
    uid
    name
    realName
    avatar
    token
    sex
    email
    telephone
    latestLoginTime
    birthday
    companyCode
    isNew
    bindedWeixin
    bindedQQ
    accounts {
      __typename
      accountID
      uid
      accountType
      openTime
      accountTotal
    }
    betLimit {
      betMin
      betMax
    }
  }
`

// 首页头部banner
let queryBanner = gql`
  query banner($position: Int) {
    appMenuItems(position: $position) {
      __typename
      name
      image {
        __typename
        url
      }
      url
    }
  }
`

// 首页直播间
let queryLiveRooms = gql`
  query LiveRoomList($offset: Int!, $limit: Int!) {
    liveRooms(offset: $offset, limit: $limit) {
      __typename
      ...LiveRoomFragment
    }
  }

  fragment LiveRoomFragment on liveRoomType {
    __typename
    chatRoomId
    roomId
    name
    url
    liveState
    coverPicture
    liveRoomNo
    anchor {
      __typename
      id
      uid
      name
      logo
    }
    popularity
    playType
    liveContentId
  }
`

// 大神观战玩法（state2进行中）
let queryLiveRoomGuesses = gql`
  query LiveRommGuesses(
    $offset: Int!
    $limit: Int!
    $anchorID: String
  ) {
    playing: guesses(
      offset: $offset
      limit: $limit
      anchorID: $anchorID
      state: 2
    ) {
      id
      name
      game
      day
      phase
      banker
      state
      startTime
      methods {
        id
        name
        guess
        result
        state
        playMethod
        startGuessTime
        endGuessTime
        betMax,
        betMin,
        options {
          id
          name
          odds
        }
      }
    }
    history: guesses(
      offset: $offset
      limit: $limit
      anchorID: $anchorID
      state: 3
    ) {
      id
      name
      game
      day
      phase
      banker
      state
      startTime
      methods {
        id
        name
        guess
        result
        state
        playMethod
        startGuessTime
        endGuessTime
        betMax
        betMin
        options {
          id
          name
          odds
        }
      }
    }
  }
`

// 大神观战玩法支付
let mutationPayLiveGuess = gql`
  mutation PayLiveGuess(
    $token: String!
    $guessID: String!
    $guessPlayMethodID: String!
    $playMethodOptionID: String!
    $stake: Int!
    $liveRoomID: String!
  ) {
    playerBetGuessPlayMethod(
      token: $token
      guessID: $guessID
      guessPlayMethodID: $guessPlayMethodID
      playMethodOptionID: $playMethodOptionID
      stake: $stake
      liveRoomID: $liveRoomID
    ) {
      msg
    }
  }
`

// 时时彩玩法
let queryLotteryPlayMethods = gql`
  query lotteryPlayMethods($game: Int, $type: Int) {
    duboPlayMethods(game: $game, type: $type) {
      id
      unitStake
      name
      game
      type
      description
      rule
      odds
      betMax
      betMin
    }
  }
`

let queryGuessPlayMethods = gql`
  query queryGuessPlayMethods($game: Int, $type: Int) {
    duboPlayMethods(game: $game, type: $type) {
      id
      name
      guess
      result
      state
      playMethod
      startGuessTime
      endGuessTime
      options {
        id
        name
        odds
      }
    }
  }
`

/*
 * game: 1: 王者荣耀, 2: Dota
 * state: 1: 准备中, 2: 投注进行中, 3: 开奖中, 4: 本期结束
 */
// let queryLotteryInfo = gql`
//   query LotteryInfo($game: String!, $liveRoom: String!) {
//     nostart: dubo(
//       game: $game
//       liveRoom: $liveRoom
//       state: 1,
//       offset: 0
//       limit: 1
//     ) {
//       ...LotteryInfoFragment
//     }
//     playing: dubo(
//       game: $game
//       liveRoom: $liveRoom
//       state: 2
//       offset: 0
//       limit: 1
//     ) {
//       ...LotteryInfoFragment
//     }
//     drawing: dubo(
//       game: $game
//       liveRoom: $liveRoom
//       state: 3
//       offset: 0
//       limit: 1
//     ) {
//       ...LotteryInfoFragment
//     }
//     settleing: dubo(
//       game: $game
//       liveRoom: $liveRoom
//       state: 4
//       offset: 0
//       limit: 1
//     ) {
//       ...LotteryInfoFragment
//     }
//   }
//   fragment LotteryInfoFragment on duboType {
//     duboID
//     name
//     liveRoom
//     phase
//     game
//     lotteryer {
//       name
//       logo
//     }
//     betTime
//     lotteryTime
//     state
//     result
//   }
// `

// game: 1: 王者荣耀, 2: Dota
let queryLotteryInfo = gql`
  query LotteryInfo($game: String!, $liveRoom: String!) {
  dubo(game: $game, liveRoom: $liveRoom, offset: 0, limit: 1) {
      ...LotteryInfoFragment
      __typename
    }
  }

  fragment LotteryInfoFragment on duboType {
    duboID
    name
    liveRoom
    phase
    game
    lotteryer {
      name
      logo
      __typename
    }
    betTime
    lotteryTime
    # state: 1: 准备中, 2: 投注进行中, 3: 开奖中, 4: 本期结束
    state
    result
    __typename
  }
`

let queryLotteryHistoryInfo = gql`
  query LotteryHistoryInfo(
    $game: String!
    $liveRoom: String!
    $offset: Int
    $limit: Int
  ) {
    dubo(
      game: $game
      liveRoom: $liveRoom
      state: 4
      offset: $offset
      limit: $limit
    ) {
      ...LotteryInfoFragment
    }
  }
  fragment LotteryInfoFragment on duboType {
    duboID
    name
    liveRoom
    phase
    game
    lotteryer {
      name
      logo
    }
    betTime
    lotteryTime
    state
    result
  }
`

// 时时彩等待开奖（区分王者和DOTA2） ！已废弃，暂时没有地方引用
let querySscBetOrder = gql`
  query sscBetOrder(
    $phase: String
    $token: String!
    $liveRoom: String
    $offset: Int
    $limit: Int
  ) {
    sscBetOrder(
      phase: $phase
      token: $token
      liveRoom: $liveRoom
      offset: $offset
      limit: $limit
    ) {
      betDuboPlayMethodsID
      duboPlayMethod {
        id
        name
        type
        description
        rule
        odds
        unitStake
      }
      description
      count
      multiple
      amount
      phase
      betTime
      duboBets {
        odds
        unitStake
        multiple
        state
        contentDesc
        settlement
      }
    }
  }
`
// 我的时时彩（等待开奖）
let queryLotteryBetRecords = gql`
  query LotteryBetRecords($token: String!, $liveRoom: String, $phase: String, $offset: Int, $limit: Int, $startTime: Int, $endTime: Int) {
    duboBetsOrder(token: $token, liveRoom: $liveRoom, phase: $phase, offset: $offset, limit: $limit, startTime: $startTime, endTime: $endTime) {
      name
      duboBetOrderID
      dubo {
        name
        phase
        game
        state
        lotteryer {
          name
          logo
        }
        betTime
        lotteryTime
        result
      }
      betCount
      betAmount
      betTime
      betDuboPlayMethods {
        duboPlayMethod {
          name
          game
          description
          rule
          odds
        }
        description
        count
        multiple
        amount
        duboBets {
          odds
          unitStake
          multiple
          state
          contentDesc
          settlement
        }
      }
    }
  }
`

let mutationPayLiveLottery = gql`
  #时时彩支付
  mutation playerBetOrder(
    $token: String!
    $liveRoomID: String
    $duboID: String
    $duboPlayMethodDatas: [PlayerBetsOrder]
  ) {
    playerBetOrder(
      token: $token
      liveRoomID: $liveRoomID
      duboID: $duboID
      duboPlayMethodDatas: $duboPlayMethodDatas
    ) {
      msg
    }
  }
`

let queryAccountRecords = gql`
  #查询账户明细
  query accountRecords($aid: String!, $offset: Int, $limit: Int) {
    accountRecords(aid: $aid, offset: $offset, limit: $limit) {
      arid
      orderNo
      diffAmount
      accountTotal
      recordType
      occurrenceTime
      description
    }
  }
`

// 查询游戏分类
let queryMatchGameCategories = gql`
  query MatchGameCategorys($offset: Int!, $limit: Int!) {
    gameCategorys(offset: $offset, limit: $limit) {
      id
      name
      description
      logo {
        width
        height
        url
        thumb_url
      }
    }
  }
`

// 查询比赛列表
let queryMatches = gql`
  query Matches(
    $gameCategory: ID
    $date: String
    $next: Int
    $offset: Int!
    $limit: Int!
  ) {
    matches(
      gameCategory: $gameCategory
      date: $date
      next: $next
      offset: $offset
      limit: $limit
    ) {
      id
      title
      state #状态：0，未开始；1，进行中；2，已结束
      BORound
      startTime
      title
      gameCategory {
        logo {
          url
        }
      }
      game {
        name
      }
      leftTeam {
        id
        name
        alias
        logo
      }
      rightTeam {
        id
        name
        alias
        logo
      }
      winnerBet {
        id
        name
        maxBet
        minBet
        betOptions {
          id
          title
          odds
        }
      }

      leftTeamScore
      rightTeamScore
      betCount
    }
  }
`

let queryMatchBets = gql`
  #查询下注单
  query matchBets($match: ID!, $offset: Int, $limit: Int) {
    bets(match: $match, offset: $offset, limit: $limit) {
      id
      name
      BONumber
      status
      endTime
      _Visible

      betOptions {
        id
        title
        odds
        Status
        _Visible
      }
      maxBet
      minBet
    }
  }
`

// 生成并支付订单
let mutationGenerateAndPayBetOrder = gql`
  mutation generateAndPayBetOrder(
    $token: String!
    $amount: Int!
    $orders: [BetOrderDetailInputType]
  ) {
    generateAndPayBetOrder(token: $token, amount: $amount, orders: $orders) {
      status
      msg
      betOrderID
    }
  }
`

// 全部订单列表，clearState 结算状态，0：未结算；1：已结算；2：全部
let queryMatchBetOrders = gql`
  query betOrders(
    $token: String!
    $clearState: Int
    $offset: Int
    $limit: Int
  ) {
    betOrders(
      token: $token
      clearState: $clearState
      offset: $offset
      limit: $limit
    ) {
      oid
      uid
      amount
      expectProfit
      earning
      state
      clearState
      createTime

      details {
        oid
        uid
        amount
        odds
        expectProfit
        bingo
        createTime
        state
        isDeleted
        bet {
          name
          status
          betOptions {
            isCorrect
            title
          }
        }
        betOption {
          title
        }

        match {
          id
          game {
            name
          }
          startTime
          leftTeam {
            id
            name
            alias
            logo
          }
          rightTeam {
            id
            name
            logo
          }
        }
      }
    }
  }
`
// 大神观战-订单列表
let queryLiveBetOrders = gql`
  query liveBetRecords($liveRoom: String,$phase: String, $token: String!, $offset: Int, $limit: Int) {
    bets(token: $token, offset: $offset, limit: $limit, liveRoom: $liveRoom, phase: $phase) {
      __typename
      id
      uid
      guess
      phase
      guessPlayMethod {
        __typename
        id
        name
        guess
        result {
          __typename
          name
        }
        state
        playMethod
        startGuessTime
        endGuessTime
      }
      playMethodOption {
        __typename
        name
        odds
        playMethod
      }
      liveRoom {
        __typename
        ...LiveRoomFragment
      }
      stake
      time
      state
    }
  }
  fragment LiveRoomFragment on liveRoomType {
    __typename
    name
  }
`

// 大神观战走势图
let queryHistoryGuess = gql`
  query guesses($liveRoomID: String!, $offset: Int, $limit: Int) {
    guesses(liveRoomID: $liveRoomID, state: 3, offset: $offset, limit: $limit) {
      id
      startTime
      phase
      methods {
        id
        name
        logogram
        result
        options {
          id
          name
          value
          __typename
        }
        __typename
      }
      __typename
    }
  }
`

// 王者荣耀时时彩走势图
let queryGOKHistoryLottery = gql`
  query dubo($liveRoom: String!, $offset: Int, $limit: Int) {
    dubo(
      liveRoom: $liveRoom
      state: 4
      game: "1"
      offset: $offset
      limit: $limit
    ) {
      duboID
      name
      liveRoom
      phase
      game
      betTime
      lotteryTime
      state
      result
      __typename
    }
  }
`

// DOTA时时彩走势图
let queryDOTAHistoryLottery = gql`
  query dubo($liveRoom: String!, $offset: Int, $limit: Int) {
    dubo(
      liveRoom: $liveRoom
      state: 4
      game: "2"
      offset: $offset
      limit: $limit
    ) {
      duboID
      name
      liveRoom
      phase
      game
      betTime
      lotteryTime
      state
      result
      __typename
    }
  }
`

// 查询腾讯IM信息
let queryTimInfo = gql`
  query timInfo($identifier: String!) {
    timInfo(identifier: $identifier) {
      usersig
      pushAvGroup
    }
  }
`
// 修改个人资料
let mutationUpdateUserInformation = gql`
  mutation updateUserInformation(
    $token: String!
    $name: String
    $avatar: String
    $sex: Int
    $birthday: Int
  ) {
    updateUserInformation(
      token: $token
      name: $name
      avatar: $avatar
      sex: $sex
      birthday: $birthday
    ) {
      __typename
      status
      msg
    }
  }
`
// 七牛云token
let getQiniutToken = gql`
  query qiniuToken($token: String!, $type: String!) {
    qiniuToken(token: $token, type: $type) {
      __typename
      token
      key
    }
  }
`

// 查询比赛详情
let matchInfoID = gql`
  query match($id: ID!) {
    match(id: $id) {
      __typename
      game {
        name
      }
      startTime
      leftTeam {
        name
        logo
        alias
      }
      rightTeam {
        name
        logo
        alias
      }
      title
      leftTeamScore
      rightTeamScore
    }
  }
`

// 攻略帖子
let strategyPost = gql`
  query posts {
    posts {
      __typename
      id
      title
      author {
        id
        token
        name
        email
        avatar
        latestLoginTime
        birthday
        telephone
        accounts {
          accountID
          uid
          accountType
          openTime
          accountTotal
        }
        bindedWeixin
        bindedQQ
        isNew
        bonus
        grade {
          id
          uid
          grade
          currentGradeEXP
          nextGradeEXP
          gradeTitle {
            id
            from
            to
            title
          }
          gradeEmblem {
            id
            from
            to
            style
            color
          }
          totalEXP
          rechargeEXP
          betEXP
          sendGiftEXP
          activityEXP
        }
      }
      publishedDate
      days
      type
      commentNumber
      likeNumber
      isBest
      isTop
      price
      content
    }
  }
`
// 攻略发帖文章内页
let strategyArticlePost = gql`
  query post(
    $id: ID!
    $token: String!
  ) {
    post(
      id: $id
      token: $token
    ) {
      id
      title
      author {
        id
        token
        name
      }
      content
    }
  }
`
// 攻略打赏
let payForPost = gql`
  mutation payForPost($token: String!, $post: String!, $money: Int) {
    payForPost(
      token: $token
      post: $post
      money: $money
    ) {
      status
      msg
    }
  }
`

// 支付宝充值
let mutationChargeAmountWithAiBo = gql`
  mutation chargeAccountWithAiBo($token: String!, $chargeTotal: Float!, $transactionAmount: Float!) {
    chargeAccountWithAiBo(
      token: $token
      chargeFor: 1
      chargeTotal: $chargeTotal
      transactionAmount: $transactionAmount
    ) {
      msg
      status
      payInfo
    }
  }
`

// 充值记录
let cashTransactions = gql`
query cashTransactions(
    $token: String!
    $offset: Int
    $limit: Int
  ) {
    cashTransactions(
      token: $token
      offset: $offset
      limit: $limit
    ) {
      insideTradeNo
      transactionAmount
      startTime
      transactionState
      transactionMode
    }
  }
`

// 提现记录
let queryDrawal = gql`
query drawals(
    $token: String!
    $offset: Int
    $limit: Int
  ) {
    drawals(
      token: $token
      offset: $offset
      limit: $limit
    ) {
      id
      drawalTime
      accountTime
      bankName
      bankEnName
      bankCard
      bankShowCard
      money
      state
    }
  }
`

// 银行卡提现
let mutationAddDrawal = gql`
  mutation addDrawal($token: String!, $money: String!, $bankCard: String!, $bankName: String!, $accountName: String!) {
    addDrawal(
      token: $token
      money: $money
      bankCard: $bankCard
      bankName: $bankName
      accountName: $accountName
    ) {
      status
      msg
    }
  }
`

// 取银行卡列表
let queryBankList = gql`
  query banks($token: String!, $offset: Int, $limit: Int) {
    banks(
      token: $token
      offset: $offset
      limit: $limit
    ) {
      count
      banks{
        id
        bankName
        bankEnName
        bankCard
        bankShowCard
        accountName
      }
      __typename
    }
  }
`

// 添加银行卡
let mutationAddbank = gql`
  mutation addBank($token: String!, $branch: String!, $bankCard: String!, $bankName: String!, $accountName: String!) {
    addBank(
      token: $token
      branch: $branch
      bankCard: $bankCard
      bankName: $bankName
      accountName: $accountName
    ) {
      status
      msg
      __typename
    }
  }
`

// 取银行卡信息
let queryBankInfo = gql`
  query bank($token: String!, $bankId: String!) {
    bank(
      token: $token
      bankId: $bankId
    ) {
      bankName
      bankCard
      accountName
      branch
      __typename
    }
  }
`
// 校验验证码
let resetPasswordValida = gql`
  mutation resetPasswordValida($email: String, $code: String!, $phone: String) {
    resetPasswordValida(
      email: $email
      code: $code
      phone: $phone
    ) {
      status
      msg
      token
      __typename
    }
  }
`
// 重置密码
let mutationResetPassword = gql`
  mutation resetPassword($token: String!, $newPassword: String!, $newConfirmPassword: String!) {
    resetPassword(
      token: $token
      newPassword: $newPassword
      newConfirmPassword: $newConfirmPassword
    ) {
      status
      msg
      __typename
    }
  }
`

export {
  mutationRegister,
  mutationLoginWithPassword,
  mutationTouristsLogin,
  queryUserInfo,
  queryBanner,
  queryLiveRooms,
  queryLiveRoomGuesses,
  mutationPayLiveGuess,
  queryLotteryPlayMethods,
  queryGuessPlayMethods,
  queryLotteryInfo,
  queryLotteryHistoryInfo,
  queryLotteryBetRecords,
  mutationPayLiveLottery,
  queryAccountRecords,
  queryMatchGameCategories,
  queryMatches,
  queryMatchBets,
  mutationGenerateAndPayBetOrder,
  queryMatchBetOrders,
  queryLiveBetOrders,
  queryHistoryGuess,
  queryGOKHistoryLottery,
  queryDOTAHistoryLottery,
  mutationCheckCode,
  queryGeetest,
  queryTimInfo,
  getQiniutToken,
  mutationUpdateUserInformation,
  matchInfoID,
  querySscBetOrder,
  strategyPost,
  mutationChargeAmountWithAiBo,
  queryDrawal,
  mutationAddDrawal,
  queryBankList,
  mutationAddbank,
  queryBankInfo,
  cashTransactions,
  resetPasswordValida,
  mutationResetPassword,
  strategyArticlePost,
  payForPost
}
