var token, thirdPartyAllowed, miaaLoaded;
var homePage = "f?p=" + $v('pFlowId') + ":1:" + $v('pInstance') + ":::::";

function initScreen() {
	var header = document.getElementsByClassName("t-Content-Header")[0];

	if (header) {
		var nav = document.getElementById("t_Body_nav");
		if (nav)
			nav.style.top = (getOffset(nav).top + header.offsetHeight) + "px";

		var body = document.getElementById("t_Body_content");
		body.style.minHeight = "calc(100vh - " + (96 + header.offsetHeight) + "px)";
	}    
	
	if ($v('pFlowStepId') == 1) {
        hideComponent('#dashboard');
        hideComponent('#login');
		hideComponent('#wait_for_it');
		hideComponent('#overview_faq');
	} else {
//		if (getLoginNeeded()) {
			apex.item("P0_RETURN").setValue(null);
			hideComponent('#t_Body_content');
//		}
	}
    
    addListeners();
}

function getLoginNeeded() {
	if ($v('pFlowStepId') == 510 || $v('pFlowStepId') == 140 || $v('pFlowStepId') == 10 || $v('pFlowStepId') == 20 || $v('pFlowStepId') == 30) 
		return false;
	else
		return true;
}

function addListeners() {
    miaa.addEventListener("miaaOnSessionFound",function(){
        console.log("miaaOnSessionFound", $v("P0_TAAL"), $v("P0_VOORNAAM"));
		
        if (apex.item("P0_VOORNAAM").getValue() == '') {
            setData();
        } else {
            if ($v('pFlowStepId') == 1) {
                showComponent('#dashboard');
                showComponent('#overview_faq');
            } else {
                showComponent('#t_Body_content');
			}
        }
		
		showComponent(".t-NavigationBar-item.logout_button");
		showComponent(".t-NavigationBar-item.user_button");
    });

    miaa.addEventListener("miaaOnSessionNotFound",function(){
        console.log("miaaOnSessionNotFound");

        resetData().then(function(data) {
//			if (loginNeeded) {
				if (thirdPartyAllowed) {
					console.log("ensureUserHasEntityToken");
					showComponent('#wait_for_it');
					miaa.ensureUserHasEntityToken().then(function(data) {
						hideComponent('#wait_for_it');
					}).catch(function(error) {
						hideComponent('#wait_for_it');
						login();
					});
				} else {
					login();
				}
//			}
        }).catch(function(error) {
            login();
        });
		
		hideComponent(".t-NavigationBar-item.logout_button");
		hideComponent(".t-NavigationBar-item.user_button");
    });

    miaa.addEventListener("miaaOnLogout",function(){
        console.log("miaaOnLogout");

        resetData().then(function(data) {
			apex.navigation.redirect(homePage);
        });
    });

    miaa.addEventListener("miaaOnSessionLost",function(){
        console.log("miaaOnSessionLost");

		resetData().then(function(data) {
			login();
			/*
			if (getLoginNeeded()) {
				apex.navigation.redirect(homePage);
			}
			*/
		});
    });

    miaa.addEventListener("miaaOnUserLoaded",function(){
        console.log("miaaOnUserLoaded");
    });

    miaa.addEventListener("miaaThirdPartyCookies",function(data) {
        console.log("miaaThirdPartyCookies supported", data.detail.allowed);

        thirdPartyAllowed = data.detail.allowed;

        if (!miaaLoaded) {
            startMiaa().then(function () {
                miaaLoaded = true;
            });
        }
    });       
}

function login() {
	if ($v('pFlowStepId') == 1) {
		showComponent("#login");
		showComponent('#overview_faq');
	} else {
		if (getLoginNeeded()) {
			var url = "f?p=" + $v( "pFlowId" ) + ":1:" + $v( "pInstance" ) + "::" + $v( "pdebug" ) + "::P0_RETURN:" + $v('pFlowStepId');
			apex.navigation.redirect(url);
		} else {
			showComponent('#t_Body_content');
		}
	}	
}

function startMiaa() {
	return miaa.start({
		config: {
			authorizationServer: {
				accessTokenManagers: {
					entity: {
						redirect_uri: $v("P0_REDIRECT_URI"),
						popup_redirect_uri: $v("P0_SILENT_REDIRECT_URI"),
						silent_redirect_uri: $v("P0_SILENT_REDIRECT_URI"),
						post_logout_redirect_uri: $v("P0_LOGOUT_REDIRECT_URI")
					}
				}
			},
			displaySettings: {
				showBrandLogo: false,
				showIntroText: false,
				showTitle: false,
				showGoBack: false
			},
			thirdPartyCookiesSupported: thirdPartyAllowed
		},
		useSilentLogout: thirdPartyAllowed
	});	
}

function setData() {
    console.log('set DATA');
    
    getToken().then(function(token,reject){
        if (token) {
			apex.server.process ( "SET_DATA",
				{ x01: token },
				{ success: function( pData ) {
						console.log("SET_DATA successfully ended", pData);
						if (pData.success) {
							$(".t-NavigationBar-item .fa-user").parent().children(".t-Button-label")[0].innerHTML = pData.given_name;
							if ($v('pFlowStepId') == 1) {
								$("#user_name")[0].innerHTML = pData.given_name;
								$(".faq .title")[0].innerHTML = $v( "P0_DIDNT_FIND" );
			
								if (apex.item("P0_RETURN").getValue() != '') {
									var vUrl = "f?p=" + $v( "pFlowId" ) + ":" + $v( "P0_RETURN" ) + ":" + $v( "pInstance" ) + "::" + $v( "pdebug" ) + ":::";
									apex.item("P0_RETURN").setValue('');
									apex.navigation.redirect(vUrl);
								} else {
									showComponent('#dashboard');
									showComponent('#overview_faq');
								}
							} else {
								refreshPage();
							}
						} else {
							console.log("Wat zijn we aan het doen?", pData.message);
						}
					},
				  error: function(request, status, error) {
						console.log("Error", request.responseText, request, status, error);
					},
				  dataType: "json"
				}
			);
        }
        if (reject) {
			console.log('Token not found');
        }
    });
}

function resetData() {
    console.log('reset DATA');

    return apex.server.process ( "RESET_DATA",
        { x01: null },
        { success:	function( pData ) {
					},
		  error:	function( request, status, error ) {
                        console.log("Error resetting data", status, "ErrorThrown", error); 
						console.log(request);
						//apex.navigation.redirect(homePage);
					}
        }
    );
}

function refreshToken() {
    var time = new Date().getTime() / 1000;
	
	if ($v("P0_EXP") && time > $v("P0_EXP")) {
		console.log('refresh token at time', time, 'expired at', $v("P0_EXP"));

		getToken().then(function(token,reject){
			if (token) {
				apex.server.process ( "SET_DATA",
					{ x01: token },
					{ success: function( pData ) {
							if (!pData.success) {
								console.log("Wat zijn we aan het doen?", pData.message);
							}
						},
					  error: function(request, status, error) {
							console.log("Error", request, status, error);
						}
					}
				);
			}
			if (reject) {
				console.log('Token not found');
			}
		});
	}
}

function refreshPage() {
	var url = "f?p=" + $v( "pFlowId" ) + ":" + $v( "pFlowStepId" ) + ":" + $v( "pInstance" ) + "::" + $v( "pdebug" ) + ":::";
	apex.navigation.redirect(url);
}

function showVerifyEmail() { 
  if (miaaLoaded) {
    miaa.showScreen('verifyEmail', '#embeddedRegion');
  } else {
    setTimeout(function () {
      showVerifyEmail();
    }, 100);
  }
};

function showChangeEmail() { 
  if (miaaLoaded) {
    miaa.showScreen('changeEmail', '#embeddedRegion');
  } else {
    setTimeout(function () {
      showChangeEmail();
    }, 100);
  }
};

function showResetPassword() { 
  if (miaaLoaded) {
    miaa.showScreen('forgotPassword', '#embeddedRegion');
  } else {
    setTimeout(function () {
      showResetPassword();
    }, 100);
  }
};

function getToken() {
    return new Promise(function (resolve, reject) {
        try {
            var entityUser = miaa.auth.getUser();
            entityUser.then(function (user) {
                if (null != user) {
                    token = user.id_token;
                }
                resolve(token);
			});
        } catch (e) {
            console.log("couldn't get token", e);
			resolve(miaa.auth.getAccessToken());
        }
    });
}

function hideComponent(ID) {
	if ($(ID)[0]) {
		$(ID)[0].style.display = "none";
	}
}

function showComponent(ID) {
	if ($(ID)[0]) {
		$(ID)[0].style.display = "";
	}
}

function getOffset(el) {
    const rect = el.getBoundingClientRect();
    return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY
    };
}
