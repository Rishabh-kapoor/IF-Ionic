'use strict';

app.controller('gameCtrl', function(gameSrc, $quixe, $ionicScrollDelegate, $q){
  var game = this;
  game.readkey = false;
  game.src = gameSrc;
  game.started = false;
  function initGame(){
    game.input = '';
    game.play = {};
    game.texts = [];
  }
  initGame();
  var text = {};
  var savedGameId;
  var savedGameObj;
  //when player clicks on start after prologue is printed, the game sets turn count back to 0
  //we remove all the mixed data received and then start the game play with player looking in the room
  //turn count climbs back to 1.
  // game.startPlay = function(){
  //   game.started = true;
  //   console.log("game started::", game.started); //now the game has started, so the prologue is removed and first room's description is to be printed.
  // };

  game.loadSavedGame = function() {
    savedGameId = game.gameInfo.serialNumber;
    $quixe.restore_state(JSON.parse(window.localStorage.getItem(savedGameId+": savedPrgrs")));
    game.send('sendingSthBecauseQuixeExpectSth');
    //remove [blah blah] from main channel
    //show notification of game loaded successfully
    console.log("Game restore: ", game.play);
  };

  game.send = function(input){
    input = input || game.input;
    if (this.readkey) {
      $quixe.readkey_resume(input.charCodeAt(0));
    } else {
      $quixe.readline_resume(input);
    }
    if(game.input){
      text = {
        author: "player",
        msg: game.input
      };
      game.texts.push(text);
      text = {};
    }
    game.readkey = false;
    $ionicScrollDelegate.$getByHandle('gameplay-page').scrollBottom(true);
    game.input = '';
  };

  var saveProgress = function() {
    game.send('save');
  };

  $quixe.on('ready', function(data) {
    console.log('ready', data);
    var oldLocation = game.play.LOCN;
    game.play = data;
    //game.gameInfo has not been defined and game.play.INFO has been received, the define game.gameInfo
    if(!game.gameInfo && game.play.INFO){
      game.gameInfo = JSON.parse(game.play.INFO);
      savedGameId = game.gameInfo.serialNumber;
      console.log(game.gameInfo);
    }
    text = {
      author: "game",
      msg: game.play.MAIN
    };
    game.texts.push(text);
    text = {};
    console.log("game.text::", game.texts);
    $ionicScrollDelegate.$getByHandle('gameplay-page').scrollBottom(true);
  });

  $quixe.on('save', function(){
    window.localStorage.setItem(savedGameId+": savedPrgrs", JSON.stringify($quixe.get_state()));
    savedGameObj = JSON.parse(window.localStorage.getItem(savedGameId+": savedPrgrs"));
    console.log("game progress saved: ", savedGameObj);
    //show notification of game saved
  });

  $quixe.on('load', function(){
    savedGameObj = JSON.parse(window.localStorage.getItem(savedGameId+": savedPrgrs"));
    if(!savedGameObj){
      return;
    }
    $quixe.restore_state(savedGameObj);
    console.log("game progress restored: ", savedGameObj);
  });

  $quixe.on('snapshot', function(data) {
    console.log('snapshot', data);
  });
  $quixe.on('fatal_error', function(error) {
    console.log('fatal_error', error);
  });

  $quixe.on('readkey', function() {
    game.readkey = true;
    console.log('readkey');
  });
});