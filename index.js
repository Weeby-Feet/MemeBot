const Discord = require('Discord.js');
const bot = new Discord.Client();

const token = require('./token.js').token;

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var request = require("request");

var fs = require('fs');


bot.on('ready', () => {
  console.log("Bot is ready");
})

bot.on('message', message => {

  if(message.author.bot) {
    return;
  }

  if(message.content.toLowerCase() === "meme") {
    //message.channel.send(randInt(100));
    get_memes(message.channel);
  }
  else if(message.content.toLowerCase().includes("gen")) {
    caption_meme(message)
  }
})

function get_memes(channel) {

  const Http = new XMLHttpRequest();
  const url = 'https://api.imgflip.com/get_memes'
  Http.open("GET", url);
  Http.send();

  Http.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      var data = JSON.parse(Http.responseText);
      //console.log(data.data.memes[0]);
      var randIndex = randInt(data.data.memes.length);


      var toFile = JSON.stringify(data);

      fs.writeFile('all_templates.json', toFile, 'utf8', function(error) {
        if(error) {
          console.log("File borked");
        }
      });

      channel.send("Meme ID: " + data.data.memes[randIndex].id + "\nNumber of text boxes: " + data.data.memes[randIndex].box_count + "\n" + data.data.memes[randIndex].url)
      .then(sent => console.log("Sent template successfully"))
      .catch(console.error);
    }
  }
}

function caption_meme(message) {

  var args = message.content.split("-");
  var box_num;

  if(args[1] == "" || args[1] == null) {
    message.channel.send("Enter the meme id ya fuckwit");
    return;
  }


  const Http = new XMLHttpRequest();
  const url = 'https://api.imgflip.com/get_memes'
  Http.open("GET", url);
  Http.send();

  Http.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      var data = JSON.parse(Http.responseText);

      for(var i = 0; i < data.data.memes.length; i++) {
        //console.log(data.data.memes[i].id);
        if(data.data.memes[i].id == args[1]) {
          box_num = data.data.memes[i].box_count;
        }
      }
    }
  }

  //Check that the number of arguments is equal to the number of text boxes
  var boxArr = [
    {
      text : args[2],
      color : "#ffffff",
      outline_color : "#000000"
    }
  ];

  for(var i = 3; i < args.length; i++) {
    boxArr.push({
      text : args[i],
      color : "#ffffff",
      outline_color : "#000000"
    });
  }

  var formData = {
    template_id : args[1],
    username : "Weeby-Feet",
    password : "bottyboy",
    text0 : args[2],
    text1 : args[3],
    boxes : boxArr
  };

  request.post("https://api.imgflip.com/caption_image", {
    form : formData
  }, function(error, response, body) {
    var meme = JSON.parse(body);

    if(!error && response.statusCode == 200) {
      if(meme.data == undefined) {
        message.channel.send("Enter a valid meme id you dumb cunt");
        return;
      }

      message.channel.send(meme.data.url)
      .then(sent => console.log("Meme sent successfully"))
      .catch(console.error);
    }
  });

}

function randInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

bot.login(token);
