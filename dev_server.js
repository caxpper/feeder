const express = require('express');

var session = require('express-session');
const endPoint = express();
const ig = require('instagram-node').instagram();
const Twitter = require('twitter');
const twiteerCredentials = require('./src/config/twiteerCredentials.js');
const instagramCredentials = require('./src/config/instagramCredentials.js');

//location of our static files(css,js,etc..)
endPoint.use(express.static(__dirname + '/public'));

// Add headers
endPoint.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

//set the view engine to use ejs
endPoint.set('view engine', 'ejs');

ig.use(instagramCredentials);

var client = new Twitter(twiteerCredentials);

//the redirect uri we set when registering our application
var redirectUri = 'http://localhost:3000/handleAuth';
var tag;

endPoint.get('/authorize', function(req, res){  
    // set the scope of our application to be able to access likes and public content
    let url = ig.get_authorization_url(redirectUri, { scope : ['public_content','likes']});    
    res.send(url);
});

endPoint.get('/handleAuth', function(req, res){         
    console.log('auth');
    //retrieves the code that was passed along as a query to the '/handleAuth' route and uses this code to construct an access token
    ig.authorize_user(req.query.code, redirectUri, function(err, result){
        if(err) res.send( err );
        // store this access_token in a global variable called accessToken
        accessToken = result.access_token;
        console.log('accessToken: ' + accessToken);
        res.send(JSON.stringify(result.access_token));
    });
})

endPoint.get('/hashtag',function(req,res){
    if(req.query.hashtag){
        tag = req.query.hashtag;   
        console.log('Client is asking for a hashtag: ',tag);
        
        // create a new instance of the use method which contains the access token gotten
        ig.use({
            access_token : accessToken
        });
    
        ig.tag_media_recent(tag, function fetchPosts(err, medias, pagination, remaining, limit) {   
            if(medias && medias.length > 0)  {
                res.send(JSON.stringify(medias[0]["images"]['standard_resolution']['url']));
            }else{
                res.send("");
            }     
            
        });   
    }else{
        res.send(JSON.stringify('Error: You did not send a valid hashtag. Please try again'));
    }
    
    
});

endPoint.get('/twitter',function(req,res){

    if(req.query.hashtag){
        var tag = req.query.hashtag;
        var params = {
            q: tag,
            count: 50,
            result_type: 'recent',
            lang: 'en'
          }
        client.get('search/tweets', params, function(err, data, response) {
            if(!err){
                res.send(JSON.stringify(data));
            } else {
              console.log(err);
            }
        });
    }else{
        res.send(JSON.stringify('Error: You did not send a valid hashtag. Please try again'));
    }
});

endPoint.listen(3000,function(){
    console.log('Server listening...');
});
