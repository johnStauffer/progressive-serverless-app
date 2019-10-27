function logout() {
	var poolData = {
		UserPoolId: 'us-east-1_fIIpe0d9e', // Your user pool id here
		ClientId: '48d0a2d8dq14iivse1t20nrd7h' // Your client id here
	};
	var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
	// get current user based on local storage
	var cognitoUser = userPool.getCurrentUser();
	if( cognitoUser != null ) {
		cognitoUser.signOut();
		window.location.href = "/";
	} else {
		window.location.href = "/";
	}
}
var btnLogout = document.querySelector('#js-logout');
if( btnLogout ) {
	btnLogout.addEventListener('click', function(e) {
		e.preventDefault();
		logout();
	});
}
