/**
* @namespace Rmg
**/
var Rmg = Rmg || {}
Rmg.Einvoices = Rmg.Einvoices || {}
Rmg.Einvoices.Page1 = Rmg.Einvoices.Page1 || {}

var token
var miaaLoaded
var baseUrl = 'https://cdn.jsdelivr.net/gh/advertentiemarkt/einvoices@1.1/'
// var baseUrl = document.location.origin + document.location.pathname
var popupRedirect = baseUrl.slice(0, -1) + 'sso/redirect/callback.html'
var silentRedirect = baseUrl.slice(0, -1) + 'sso/redirect/callback_silent.html'
var postLogoutRedirect = baseUrl.slice(0, -1) + 'sso/redirect/callback_signout.html'

Rmg.Einvoices.Page1.loadTheLogin = function (regionToEmbed, contentRegion) {
  console.log('Load the login triggered')
  Rmg.Einvoices.Page1.hideRegion(regionToEmbed)
  Rmg.Einvoices.Page1.hideRegion(contentRegion)

  var isRegistrationShown = false
  var isForgotPasswordShown = false
  var isForgotPasswordSuccessShown = false
  if (typeof miaa === 'undefined') { console.log('Miaa is undefined') } else {
    miaa.addEventListener('miaaOnLogin', function () { console.log('miaaOnLogin') })
    miaa.addEventListener('miaaOnRegistration', function () { console.log('miaaOnRegistration') })
    miaa.addEventListener('miaaOnLogout', function () {
      console.log('miaaOnLogout')
      Rmg.Einvoices.Page1.resetData()
      var url = baseUrl + '?p=' + $v('pFlowId') + ':OVERVIEW:' + $v('pInstance')
      window.location.assign(url)
    })
    miaa.addEventListener('miaaOnDeactivateAccount', function () { console.log('miaaOnDeactivateAccount') })
    miaa.addEventListener('miaaOnSocialLogin', function () { console.log('miaaOnSocialLogin') })
    miaa.addEventListener('miaaOnSessionFound', function () {
      console.log('miaaOnSessionFound')
      if (apex.item('P0_NAAM').getValue() === '') {
        Rmg.Einvoices.Page1.setData()
      }
      Rmg.Einvoices.Page1.hideRegion(regionToEmbed)
      Rmg.Einvoices.Page1.showRegion(contentRegion)
    })
    miaa.addEventListener('miaaOnSessionNotFound', function () {
      console.log('miaaOnSessionNotFound')
      Rmg.Einvoices.Page1.resetData()
      Rmg.Einvoices.Page1.showRegion(regionToEmbed)
      Rmg.Einvoices.Page1.hideRegion(contentRegion)
      miaa.showScreen('signIn', regionToEmbed)
    })
    miaa.addEventListener('miaaOnSessionLost', function () {
      console.log('miaaOnSessionLost')
      Rmg.Einvoices.Page1.resetData()
      Rmg.Einvoices.Page1.hideRegion(contentRegion)
      Rmg.Einvoices.Page1.showRegion(regionToEmbed)
      miaa.showScreen('signIn', regionToEmbed)
    })
    miaa.addEventListener('miaaOnWidgetLoaded', function () {
      console.log('miaaOnWidgetLoaded')
    })
    miaa.addEventListener('miaaOnFormShow', function () { console.log('miaaOnFormShow', miaa.state.activeScreen) })

    jQuery(document).on('shown.bs.modal', '#miaaModal', function (e) {
      console.log('Modal shown', miaa.state.activeScreen)
      if (miaa.state.activeScreen === 'memberTraditionalRegistration') isRegistrationShown = true
      else if (miaa.state.activeScreen === 'forgotPassword') isForgotPasswordShown = true
      else if (miaa.state.activeScreen === 'forgotPasswordSuccess') isForgotPasswordSuccessShown = true
    })

    jQuery(document).on('hide.bs.modal', '#miaaModal', function (e) {
      if (isRegistrationShown && miaa.state.activeScreen === 'memberTraditionalRegistration') {
        isRegistrationShown = false
        window.location.reload()
      } else if (isForgotPasswordShown && miaa.state.activeScreen === 'forgotPassword') {
        isForgotPasswordShown = false
        window.location.reload()
      } else if (isForgotPasswordSuccessShown && miaa.state.activeScreen === 'forgotPasswordSuccess') {
        isForgotPasswordSuccessShown = false
        window.location.reload()
      }
    })

    Rmg.Einvoices.Page1.startMiaa(regionToEmbed)
  }
}

/*
* If not already loaded initialize the Login Sctreen
* @method
* @param {string} screenName - The name of the screen to be loaded
* @param {string} region - The name of the region if we have to embed in it
*/
Rmg.Einvoices.Page1.showScreen = function (screenName, region) {
  if (miaaLoaded) {
    console.log('Miaa already loaded, showing screen ' + screenName)
    miaa.showScreen(screenName, region)
  } else {
    console.log('Miaa not yet loaded, afterwards show screen ' + screenName)
    Rmg.Einvoices.Page1.initScreen(screenName, region)
  }
}

/*
* Initialize the Login Screen
* @method
* @param {string} screenName - The name of the screen to be loaded
* @param {string} region - The name of the region if we have to embed in it
*/
Rmg.Einvoices.Page1.initScreen = function (screenName, region) {
  miaa.addEventListener('miaaOnSessionFound', function () {
    console.log('miaaOnSessionFound')
    Rmg.Einvoices.Page1.hideRegion(region)
    miaa.showScreen(screenName, region)
    Rmg.Einvoices.Page1.showRegion(region)
  })
  miaa.addEventListener('miaaOnSessionNotFound', function () {
    console.log('miaaOnSessionNotFound')
    Rmg.Einvoices.Page1.resetData()
    var url = baseUrl + '?p=' + $v('pFlowId') + ':1:' + $v('pInstance')
    window.location.assign(url)
  })
  miaa.addEventListener('miaaOnSessionLost', function () {
    console.log('miaaOnSessionLost')
    Rmg.Einvoices.Page1.resetData()
    var url = baseUrl + '?p=' + $v('pFlowId') + ':1:' + $v('pInstance')
    window.location.assign(url)
  })
  Rmg.Einvoices.Page1.startMiaa(region)
}

/*
* Start the Miaa Widget
* @method
* @param {string} region - The name of the region if we have to embed in it
*/
Rmg.Einvoices.Page1.startMiaa = function (region) {
  miaa.start({
    config: {
      authorizationServer: {
        accessTokenManagers: {
          entity: {
            popup_redirect_uri: popupRedirect,
            silent_redirect_uri: silentRedirect,
            post_logout_redirect_uri: postLogoutRedirect
          }
        }
      },
      displaySettings: {
        showBrandLogo: true,
        showIntroText: false,
        showTitle: true,
        showGoBack: true
      }
    },
    embeddedElementSelector: region,
    useSilentLogout: false
  }).then(function () {
    miaaLoaded = true
  })
}

Rmg.Einvoices.Page1.setData = function () {
  console.log('set DATA')
  Rmg.Einvoices.Page1.getToken().then(function (resolve, reject) {
    if (resolve) {
      console.log('Token found')
      token = Rmg.Einvoices.Page1.parseJwt(resolve)
      console.log(token)
      apex.server.process('SET_DATA',
        { x01: token.sub,
          x02: token.email,
          x03: token.given_name,
          x04: 'nl-be'
        },
        { success: function (pData) {
          window.location.reload()
        },
        dataType: 'text'
        }
      )
    }
    if (reject) {
      console.log('Token not found')
      Rmg.Einvoices.Page1.resetData()
    }
  })
}

Rmg.Einvoices.Page1.resetData = function (reloadPage) {
  console.log('reset DATA')
  apex.server.process('SET_DATA',
    { x01: null,
      x02: null,
      x03: null,
      x04: null
    },
    { success: function (pData) {
      console.log('Resetting data => refresh page:', reloadPage)
      if (reloadPage) { window.location.reload() }
    },
    dataType: 'text'
    }
  )
}

Rmg.Einvoices.Page1.getToken = function () {
  console.log('getToken')
  return new Promise(function (resolve, reject) {
    try {
      var entityUser = miaa.auth.getUser()
      entityUser.then(function (user) {
        if (user != null) {
          token = user.id_token
        }
        resolve(token)
      })
    } catch (e) {
      console.log('getToken() - catch Error: ' + e)
      resolve(localStorage.miaa_id_token)
    }
  })
}
/*
* Logout the Miaa Widget
* @method
*/
Rmg.Einvoices.Page1.logoutMiaa = function (regionToEmbed, regionToHide) {
  Rmg.Einvoices.Page1.hideRegion(regionToEmbed)
  Rmg.Einvoices.Page1.hideRegion(regionToHide)
  miaa.start({
    config: {
      authorizationServer: {
        accessTokenManagers: {
          entity: {
            popup_redirect_uri: popupRedirect,
            silent_redirect_uri: silentRedirect,
            post_logout_redirect_uri: postLogoutRedirect
          }
        }
      },
      displaySettings: {
        showBrandLogo: false,
        showIntroText: false,
        showTitle: true,
        showGoBack: false
      }
    },
    embeddedElementSelector: regionToEmbed,
    isLoggedIn: true,
    useSilentLogout: true
  }).then(function () {
    miaa.auth.logout()
  })
}

Rmg.Einvoices.Page1.hideRegion = function (ID) {
  if (typeof ID !== 'undefined') $(ID).hide()
  console.log('Hidden: ', ID)
}

Rmg.Einvoices.Page1.showRegion = function (ID) {
  if (typeof ID !== 'undefined') $(ID).show()
  console.log('Shown: ', ID)
}

Rmg.Einvoices.Page1.parseJwt = function (token) {
  try {
    // Get Token Header
    var base64HeaderUrl = token.split('.')[0]
    var base64Header = base64HeaderUrl.replace('-', '+').replace('_', '/')
    var headerData = JSON.parse(window.atob(base64Header))

    // Get Token payload and date's
    var base64Url = token.split('.')[1]
    var base64 = base64Url.replace('-', '+').replace('_', '/')
    var dataJWT = JSON.parse(window.atob(base64))
    dataJWT.header = headerData
    return dataJWT
  } catch (err) {
    return false
  }
}
