function logout() {
	var poolData = {
		UserPoolId: 'us-east-1_MtlgYMnLG', // Your user pool id here
		ClientId: '7koj2f36b7ouj4a3kvn5n71qb8' // Your client id here
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
	btnLogout.addEventListener('click', (function(e) {
		e.preventDefault();
		logout();
	}));
}
