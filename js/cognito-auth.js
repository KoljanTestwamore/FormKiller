/*global FormKiller _config AmazonCognitoIdentity AWSCognito*/

var FormKiller = window.FormKiller || {};

(function scopeWrapper($) {
    let signinUrl = 'signin.html';

    let poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };

    let userPool;

    if (!(_config.cognito.userPoolId &&
        _config.cognito.userPoolClientId &&
        _config.cognito.region)) {
      console.log("Error occured");
      return;
  }
    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    if (typeof AWSCognito !== 'undefined') {
        AWSCognito.config.region = _config.cognito.region;
    }

    FormKiller.signOut = function signOut() {
        userPool.getCurrentUser().signOut();
    };

    FormKiller.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
        let cognitoUser = userPool.getCurrentUser();

        if (cognitoUser) {
            cognitoUser.getSession(function sessionCallback(err, session) {
                if (err) {
                    reject(err);
                } else if (!session.isValid()) {
                    resolve(null);
                } else {
                    resolve(session.getIdToken().getJwtToken());
                }
            });
        } else {
            resolve(null);
        }
    });


    /*
     * Cognito User Pool functions
     */

    function register(email, password, onSuccess, onFailure) {
        let dataEmail = {
            Name: 'email',
            Value: email
        };
        let attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);

        userPool.signUp(email, password, [attributeEmail], null,
            function signUpCallback(err, result) {
                if (!err) {
                    onSuccess(result);
                } else {
                    onFailure(err);
                }
            }
        );
    }

    function signin(email, password, onSuccess, onFailure) {
        let authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: email,
            Password: password
        });

        let cognitoUser = createCognitoUser(email);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: onSuccess,
            onFailure: onFailure
        });
    }

    function verify(email, code, onSuccess, onFailure) {
        createCognitoUser(email).confirmRegistration(code, true, function confirmCallback(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }

    function createCognitoUser(email) {
        return new AmazonCognitoIdentity.CognitoUser({
            Username: email,
            Pool: userPool
        });
    }

    /*
     *  Event Handlers
     */

    $(function onDocReady() {
        $('.signin-form')[0] && $('.signin-form').on('submit', handleSignin);
        $('.registration-form')[0] && $('.registration-form').on('submit', handleRegister);
        $('.verify-form')[0] && $('.verify-form').on('submit', handleVerify);

        FormKiller.authToken.then(function setAuthToken(token) {
            if (token) {
                createElement({
                    parent: document.body,
                    class: "signout-icon",
                    style: "position:fixed;top:80%;left:90%;cursor:pointer;font-size:2rem",
                    text: 'X'
                })
                createElement({
                    type: 'a',
                    parent: $('.main-list')[0],
                    href: 'show.html',
                    style: "position:fixed;top:20%;left:90%;cursor:pointer;font-size:2rem",
                    text: 'Your forms'
                })
                $('.signout-icon').click(()=>{
                    FormKiller.signOut();
                    window.location.href = "signin.html"
                })
            }
        });
    })

    function handleSignin(event) {
        let email = $('.email-input').val();
        let password = $('.password-input').val();
        event.preventDefault();
        signin(email, password,
            function signinSuccess() {
                console.log('Successfully Logged In');
                window.location.href = 'create.html';
            },
            function signinError(err) {
                alert(err);
            }
        );
    }

    function handleRegister(event) {
        let email = $('.email-input').val();
        let password = $('.password-input').val();
        let password2 = $('.password-input2').val();

        let onSuccess = function registerSuccess(result) {
            let cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());
            let confirmation = ('Registration successful. Please check your email inbox or spam folder for your verification code.');
            if (confirmation) {
                window.location.href = 'verify.html';
            }
        };
        let onFailure = function registerFailure(err) {
            alert(err);
        };
        event.preventDefault();

        if (password === password2) {
            register(email, password, onSuccess, onFailure);
        } else {
            alert('Passwords do not match');
        }
    }

    function handleVerify(event) {
        let email = $('.email-input').val();
        let code = $('.code-input').val();
        event.preventDefault();
        verify(email, code,
            function verifySuccess(result) {
                console.log('call result: ' + result);
                console.log('Successfully verified');
                alert('Verification successful. You will now be redirected to the login page.');
                window.location.href = signinUrl;
            },
            function verifyError(err) {
                alert(err);
            }
        );
    }
}($));
