//Dependencies
dotenv = require("dotenv").config();
const Twitter = require("twitter");
const Spotify = require("node-spotify-api");
const request = require("request");
const keys = require("./keys");
const fs = require("fs");

const spotify = new Spotify(keys.spotify);
const client = new Twitter(keys.twitter);

//process arg to take movie title 
const commandType = process.argv[2];


let title = process.argv.slice(3).join("+");


//Make Omdb API call to get movie info based on movie the user provides
const movieThis = function() {
    request("http://www.omdbapi.com/?t=" + title + "&apikey=9cac7f7d", function(error, response, body) {

        if (error) {
            return console.log('Error occurred: ' + error);
        } else if (!error && response.statusCode === 200) {

            console.log(
                "* Title: " + JSON.parse(body).Title + "\n" +
                "* Release Year: " + JSON.parse(body).Year + "\n" +
                "* IMDB Rating: " + JSON.parse(body).imdbRating + "\n" +
                "* Rotten Tomatoes Rating: " + JSON.parse(body).Ratings[1].Value + "\n" +
                "* Country: " + JSON.parse(body).Country + "\n" +
                "* Language: " + JSON.parse(body).Language + "\n" +
                "* Plot: " + JSON.parse(body).Plot + "\n" +
                "* Actors: " + JSON.parse(body).Actors + "\n"
            );

        }

    });
}

//Get the first five songs that match the user's input
const spotifyThisSong = function() {

    spotify
        .request(`https://api.spotify.com/v1/search?q=${title}&type=track&limit=5`)
        .then(function(data) {
            console.log(`/////////${data.tracks.items.length} Results//////////`)
            data.tracks.items.forEach(function(element, index) {
                console.log(
                    "* Artist: " + data.tracks.items[index].artists[0].name + "\n" +
                    "* Song Name: " + data.tracks.items[index].name + "\n" +
                    "* Preview: " + data.tracks.items[index].preview_url + "\n" +
                    "* Album: " + data.tracks.items[index].album.name + "\n"

                );
            });
        })
        .catch(function(err) {
            console.error('Error occurred: ' + err);
        });

}

//Make API call to display tweets and their time
const myTweets = function() {

    client.get('statuses/user_timeline', function(error, tweets, response) {
        if (error) throw error;

        tweets.forEach(function(element, index) {

            console.log(
                "* Tweet: " + element.text + "\n" +
                "* Date : " + element.created_at + "\n"

            );

        });


    });
}

//Reads the content of the random.txt file and execute the spotify command in it
const doWhatItSays = function() {

    fs.readFile("random.txt", "utf8", function(error, data) {

        //take data string and turn into array
        let dataArray = data.split(",")

        //set song title from text file, and remove quotes from title string
        //set to global title variable for use with the Spotify API call
        title = dataArray[1].replace(/"/g, "")

        //set spotify command from text file
        let spotifyCommand = dataArray[0]

        //run spotifyThisSong. Function will use the newly defined title
        spotifyThisSong();


    })


}



//Hash table: call function based on request type
processCommand();

function processCommand() {
    commands = {

        "movie-this": movieThis,
        "spotify-this-song": spotifyThisSong,
        "my-tweets": myTweets,
        "do-what-it-says": doWhatItSays

    }
    commands[commandType]();
}