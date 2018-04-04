dotenv = require("dotenv").config();
const request = require("request")
const keys = require("./keys");

//const spotify = new Spotify(keys.spotify);
const client = new Twitter(keys.twitter);

//process arg to take movie title 
const commandType = process.argv[2];


const title = process.argv.slice(3).join("+");


//Make Omdb API call to get movie info based on movie the user provides
const movieThis = function() {
    request("http://www.omdbapi.com/?t=" + title + "&apikey=9cac7f7d", function(error, response, body) {

        if (!error && response.statusCode === 200) {

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



//Hash table: call function based on request type
processCommand();

function processCommand() {
    commands = {

        "movie-this": movieThis

    }
    commands[commandType]();
}