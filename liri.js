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

//Will be used to format object data for user display
function displayObject(object) {
    for (var key in object) {
        console.log(key, object[key]);
    }
}

//Make Omdb API call to get movie info based on movie the user provides
const movieThis = function() {
    request("http://www.omdbapi.com/?t=" + title + "&apikey=9cac7f7d", function(error, response, body) {

        if (error) {
            console.log('Error occurred: ' + error);
        } else if (!error && response.statusCode === 200) {

            //Store API data in object for ease of logging and organization
            let resultsData = {
                "Title: ": JSON.parse(body).Title,
                "Release Year: ": JSON.parse(body).Year,
                "IMDB Rating: ": JSON.parse(body).imdbRating,
                "Rotten Tomatoes Rating: ": JSON.parse(body).Ratings[1].Value,
                "Country: ": JSON.parse(body).Country,
                "Language: ": JSON.parse(body).Language,
                "Plot: ": JSON.parse(body).Plot,
                "Actors: ": JSON.parse(body).Actors

            }


            //Display object contents to user
            //Iterate over object and log each key, value pair
            displayObject(resultsData);

            //log data
            logRequest("movies", resultsData);

        }

    });
}

//Get the first five songs that match the user's input
const spotifyThisSong = function() {

    spotify
        .request(`https://api.spotify.com/v1/search?q=${title}&type=track&limit=5`)
        .then(function(data) {

            //Map array based specific data keys
            let resultsData = data.tracks.items.map(function(element, index) {

                return {
                    "Artist: ": data.tracks.items[index].artists[0].name,
                    "Song Name: ": data.tracks.items[index].name,
                    "Preview: ": data.tracks.items[index].preview_url,
                    "Album: ": data.tracks.items[index].album.name
                }

            });

            //Console log data
            resultsData.forEach(function(element) {

                displayObject(element);
                console.log("\n")

            });

            //log request to JSON file
            logRequest("spotify", resultsData);

        })
        .catch(function(err) {
            console.error('Error occurred: ' + err);
        });

}

//Make API call to display tweets and their time
const myTweets = function() {

    client.get('statuses/user_timeline', function(error, tweets, response) {
        if (error) throw error;

        //Map array based specific data keys
        let resultsData = tweets.map(function(element) {

            return {
                "Tweet: ": element.text,
                "Text: ": element.created_at,

            }

        });


        //Console log data
        resultsData.forEach(function(element) {

            displayObject(element);
            console.log("\n")

        });

        //Log request to JSON file
        logRequest("tweets", resultsData);


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
    let requests = {

        "movie-this": movieThis,
        "spotify-this-song": spotifyThisSong,
        "my-tweets": myTweets,
        "do-what-it-says": doWhatItSays

    }
    requests[commandType]();
}

/*log each request/command to a json file
write method used over append 
json file chosen over txt file for better data organization
json file is organized by request type (e.g. movies)*/

function logRequest(type, logData) {


    //get contents of JSON file
    fs.readFile("log.json", "utf8", function(error, data) {

        if (error)

            console.log(error);

        //parse contents of file in memory to process log update
        dataArray = JSON.parse(data);


        //push request to variable object in memory
        let newLogData;
        //If request is for tweets, the new object should be different
        if (type !== "tweets") {
            newLogData = {

                "request": title,
                "data": logData

            }
        } else {

            newLogData = {

                "data": logData

            }
        }

        //push new log data to object array
        dataArray.requests[type].push(newLogData);


        //convert updated object to JSON string to be written to file
        updatedJSON = JSON.stringify(dataArray, null, 2);


        //rewrite the json file with the updated object
        fs.writeFile("log.json", updatedJSON, function(error) {

            if (error) {

                console.log(error);
            }

        });

    });
}