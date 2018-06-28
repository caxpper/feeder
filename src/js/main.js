
$(document).ready(initializeApp);


/**
 * Initialize the App
 */
function initializeApp(){ 
  console.log('init app');   
    $('.send').click(()=>{
        $('.twiteer img').remove();
        $('.twiteer p').remove();
        const hashtag = $('#tagInput').val(); 
        console.log('sending hashtag: ',hashtag);
        if(hashtag.trim() !== ''){

          //AJAX instagram call
          $.ajax({ 
            url: "http://localhost:3000/authorize",
            'type' : 'GET',
            'data' : {
                'hashtag' : hashtag
            },
            success: function(data) {              
                    let picture = $("<img src='"+ data +"'></img>");                    
                    $('.instagram').append(picture);
            }, 
            dataType: "json", 
            error: function(err){
                console.log("An error occured: " + err.status + " " + err.statusText);
            }
          });


          //AJAX twiteer call
          (function poll() {
            console.log('calling poll'); 
            setTimeout(function() {
                console.log('inside timeout'); 
                $.ajax({ 
                  url: "http://localhost:3000/twitter",
                  'type' : 'GET',
                  'data' : {
                      'hashtag' : hashtag
                  },
                  success: function(data) {
                    console.log('receiving data');
                    for(let i = 0; i < data.statuses.length; i++){
                        const tweetData = data.statuses[i];
                        if(tweetData && tweetData.user){
                          let cont = $("<div></div>")
                          let picture = $("<img src='"+ tweetData.user.profile_image_url +"'></img>");
                          cont.append(picture);
                          let tweet = $("<p></p>").text(tweetData.user.screen_name + ': ' + tweetData.text);
                          cont.append(tweet);
                          $('.twiteer').append(cont);
                        }
                    }                    
                  }, 
                  dataType: "json", 
                  complete: poll,
                  error: function(err){
                      console.log("An error occured: " + err.status + " " + err.statusText);
                  }
                });
            }, 30000);
          })();
        } 

    });
}