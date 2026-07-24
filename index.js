function sum(a, b) {
    return a + b;
}

function sumWithMsg(clbk,msg) {
    const result = clbk(5, 10);
    console.log(msg + ": " + result);
}

sumWithMsg(sum, "The sum is");

function login(success, error) {
    if (success) {
        console.log("Login successful");
    } else {
        console.log("Login failed: " + error);
    }
}
function loginVerify(username, password, clbk) {
    if (username == "admin" && password == "1234") {
        clbk("success", null);
    } else {
        clbk(null,"Invalid username or password");
    }
}
loginVerify("admin", "1234",login)