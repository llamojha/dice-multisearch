var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var http = require('http');
var nunjucks = require('nunjucks');
var nunjucksRender = require('gulp-nunjucks-render');
var data = require('gulp-data');
var gulp = require('gulp');
var path = require('path');
var PATH_TO_TEMPLATES = '.' ;
nunjucks.configure( PATH_TO_TEMPLATES, {
    autoescape: true,
    express: app
} ) ;

app.use(express.static(path.join(__dirname, 'public')));

const diceUrl = "https://dice.fm/artist/";
var events = [];
var urls = [];

var artists = ["traams","queens-of-the-stone-age","the-big-moon"];

for(artist in artists){
  urls.push(diceUrl+artists[artist]);
}

//var $ = cheerio.load(fs.readFileSync('dice.html'));

for(u in urls){
  var url = urls[u];
  console.log("Getting gigs from " + url);
  request.get(url, (error, response, body) => {
    //TODO: if error then break
    var $ = cheerio.load(body,{
      ignoreWhitespace: false,
      xmlMode: true
    });
    var artistsEvents = $('script[type="application/ld+json"]').html();
    var artistsEvents = JSON.parse(artistsEvents);
    var es = artistsEvents[0]['event'];

    for(var e in es) {
      var event = es[e][0];
      events.push({
        name : event['name'],
        image : event['image'],
        ticket : event['url'],
        startDate : Date(event['doorTime']),
        venue : event['location']['name'],
        address : event['location']['address'],
        price : event['offers'][0]['price']
      });
    }
  });
}


app.get( '/', function( req, res ) {
  //console.log({events:JSON.parse(events)});
  console.log("Rendering html with events");
  return res.render('test.html', {events: events});
  });


app.listen( 8000 );
