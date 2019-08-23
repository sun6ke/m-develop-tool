var res = require("@babel/core").transform('()=>{}', {
    presets: ["@babel/preset-env"]
}, function(err, result) {
    console.log(err)
    console.log(result.code)
})