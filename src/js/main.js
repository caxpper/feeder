
$(document).ready(initializeApp);
var timerId=0;


/**
 * Initialize the App
 */
function initializeApp(){ 

    //login in Isntagram API
    loginInstagram();

    $('#tagInput').on('keyup',(e)=>{
        var code = e.which;
        if(code===13){
            newHashtag();
        }
    });

    $('.send').click(()=>{
        newHashtag();
    });
}

/**
 * all the things to do every time the user send new hashtag
 */
function newHashtag(){
    //delete all data from previous hashtags
    $('.instagram img').remove();
    $('.twitter img').remove();
    $('.twitter p').remove();
    const hashtag = $('#tagInput').val(); 
    //stop the previous feed 
    if(timerId !== 0)
        clearInterval(timerId);

    if(hashtag.trim() !== ''){        
        $('.form p').addClass('hidden');
        //we need the hashtag without # for instagram
        let tag = hashtag.split('#');
        tag = tag.length > 1 ? tag[1] : tag[0];
        
        //we call the server to get the url of the images for the hashtag
        getImagesFromTag(tag);
        
        twitterCall(hashtag);
        //AJAX twiteer call
        timerId = setInterval(() => {
            twitterCall(hashtag);
        }, 30000);  
    }else{
        $('.form p').removeClass('hidden');
    }
}


/**
 *  Call to the twitter API to get the tweets for a particular hashtag
 */
function twitterCall(hashtag){
    $.ajax({ 
        url: "http://feeder.alejandro-gaspar.com/twitter",
        'type' : 'GET',
        'data' : {
            'hashtag' : hashtag
        },
        success: function(data) {
            if(data.statuses){
                for(let i = 0; i < data.statuses.length; i++){
                    const tweetData = data.statuses[i];
                    if(tweetData && tweetData.user){
                    let cont = $("<div></div>")
                    let picture = $("<img src='"+ tweetData.user.profile_image_url +"'></img>");
                    cont.append(picture);
                    let tweet = $("<p></p>").text(tweetData.user.screen_name + ': ' + tweetData.text);
                    cont.append(tweet);
                    $('.tweets').prepend(cont);
                    }
                }   
            }                 
        }, 
        dataType: "json",         
        error: function(err){
            console.log("An error occured: " + err.status + " " + err.statusText);
        }
    });
}

/**
 * Call to the server to login in the instagram account
 */
function loginInstagram(){
    $.ajax({ 
        url: "http://feeder.alejandro-gaspar.com/authorize",
        'type' : 'GET', 
        success: function(data) {              
            var win = window.open(data,"_blank"); 
            setTimeout(()=>{
                win.close(); 
            },400);     
        }, 
        error: function(err){
            console.log("An error occured: " + err.status + " " + err.statusText);
        }
    });   
}

/**
 * add the images returned from the server to the dom
 * 
 * @param {*} tag hashtag to send to the instagram API
 */
function getImagesFromTag(tag){
    $.ajax({ 
        url: "http://feeder.alejandro-gaspar.com/hashtag",
        'type' : 'GET',
        'data' : {
            'hashtag' : tag
        },
        dataType: "json", 
        success: function(data) {
            let picture;
            if(data===''){
                picture = $("<img src='../dist/images/noImage.jpg'></img>");
            }else{
                picture = $("<img src='"+ data +"'></img>");
            }                       
            $('.instagram').append(picture);
        }, 
        error: function(err){
            console.log("An error occured: " + err.status + " " + err.statusText);
            if(err.status === 200){
                let picture = $("<img src='../dist/images/noImage.jpg'></img>");
                $('.instagram').append(picture);
            }
        }
    });
}