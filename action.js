new Vue({
  el: '#app',
  data: {
    isPlayingGame: false,
    actionLogs: [],
    players: [],
    colors: [
      { name: '#993300', available: true },
      { name: '#FF6600', available: true },
      { name: '#FFCC00', available: true },
      { name: '#33CC00', available: true },
      { name: '#0033CC', available: true },
      { name: '#660099', available: true }
    ],
    Pname: "",
    Pcolor: "",
    setTurn: false
  },
  methods: {
    checkLocalStorage: function() {
      // CHECK IF LOCAL STORAGE HAS DATA & SET UP DATA
      let stored = localStorage.getItem('players'),
          hasPlayed = localStorage.getItem('gamePlay');

      if(stored == null || stored == 'undefined') {
        this.players = [];
        localStorage.setItem('players', JSON.stringify(this.players));
        localStorage.setItem('setTurn', "false");
        return
      } else {
        this.players = JSON.parse(localStorage.getItem('players'));
      }

      if(hasPlayed == null) localStorage.setItem('gamePlay', "false");
      else this.isPlayingGame = localStorage.getItem('gamePlay') === "true" ? true : false;
    },
    resetGame: function() {
      this.actionLogs = []
      this.players = []
      this.isPlayingGame = !this.isPlayingGame;
      this.colors.forEach(color => {
        color.available = true;
      });
      localStorage.setItem('gamePlay', JSON.stringify(this.isPlayingGame));
      localStorage.setItem('players', JSON.stringify(this.players));
    },
    startAgain: function() {
      let player1 = this.getPlayerTurn().y,
          player2 = this.getPlayerTurn().x;
          
      this.actionLogs = [];
      this.setTurn = false;

      player1.health = 100;
      player1.hierarcy = this.getRandomAmount(5, 20);
      player1.turn = {}

      player2.health = 100;
      player2.hierarcy = this.getRandomAmount(5, 20);
      player2.turn = {}
      
      localStorage.setItem('players', JSON.stringify(this.players));
      localStorage.setItem('setTurn', "false");
    },
    createPlayer: function() {
      let self = this,
          player = { character: this.Pname.replace(/\s/g, ''), color: this.Pcolor, health: 100, hierarcy: this.getRandomAmount(5, 20) },
          leColor = this.colors.find(function(col) {
            return col.name == self.Pcolor;
          }); 
      leColor.available = false;
      this.players.push(player)
      localStorage.setItem('players', JSON.stringify(this.players));
      this.Pname = ""
      this.Pcolor = ""
    },
    attack: function(isSpecialAttack) {
      let currentPlayer = this.getPlayerTurn().y,
          opponent = this.getPlayerTurn().x,
          damage = isSpecialAttack ? this.getRandomAmount(15, 10) : this.getRandomAmount(10, 5);

      opponent.health = (opponent.health - damage) < 0 ? 0 : (opponent.health - damage);
      currentPlayer.turn.action = currentPlayer.turn.action-1;
      this.insertLog({ info: { name: currentPlayer.character, color: currentPlayer.color }, isAttack: true, amount: damage });

      if(opponent.health < 1) {
        alert(currentPlayer.character + " WON!!!!!");
        if(confirm("Do you want to play again?")) {
          alert("RANDOM PICKING TURN....");
          this.startAgain();
          this.identifyTurn;
        } else {
          this.resetGame();
        }
        return
      }

      if(currentPlayer.turn.action < 1) this.switchTurns(true);
    },
    heal: function(){
      let currentPlayer = this.getPlayerTurn().y,
          heal = 20;

      currentPlayer.health = (currentPlayer.health + heal) > 100 ? 100 : (currentPlayer.health + heal);
      currentPlayer.turn.action = currentPlayer.turn.action-1;

      this.switchTurns(false);
      this.insertLog({ info: { name: currentPlayer.character, color: currentPlayer.color }, isAttack: false, amount: heal });
    },
    giveUp: function() {
      let player = this.getPlayerTurn();
      
      if(confirm("Do you want to give up " + player.y.character +"?")) {
        alert("Player "+ player.y.character +" gave up! You won " + player.x.character + "!");
        this.resetGame();
      } else {
        alert("You can do it " + player.y.character + "!");
      }
    },
    getRandomAmount: function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    switchTurns: function(isAttack) {
      let player = this.getPlayerTurn(),
          playerCurrentTurn = player.y,
          playerNextTurn = player.x;

      playerNextTurn.turn.isTurn = true;
      playerNextTurn.turn.action = !isAttack ? 2 : 1;
      playerNextTurn.turn.disableHeal = !isAttack ? true : false;

      playerCurrentTurn.turn.isTurn = false;
      playerCurrentTurn.turn.action = 1;
      playerCurrentTurn.turn.disableHeal = false;
    },
    insertLog: function(log){ 
      this.actionLogs.unshift(log);
    },
    getPlayerTurn: function() {
      // THIS IS TO RETURN WHICH PLAYER HAS THEIR TURN, {current turn, opponent}
      let turn = this.players.find(function(y) {
        return y.turn.isTurn;
      }), opponent = this.players.find(function(x) {
        return !x.turn.isTurn;
      });

      return { y: turn, x: opponent };
    }
  },
  mounted: function(){
    this.checkLocalStorage();
  },
  watch: {
    players: function() {
      this.identifyTurn;
    }
  },
  computed: {
    pCheck: function() {
      // THIS IS TO CHECK IF PNAME HAS VALUE AND PCOLOR MUST BE SELECTED
      return this.Pname.replace(/\s/g, '') != '' && this.Pcolor != ''
    },
    identifyTurn: function() {
      // WATCH WHEN PLAYER NUMBER REACHES 2;
      // THIS IS TO DETERMIN USER'S TURN VIA RANDOM HIERARCY GIVEN
      let player1 = this.players[0],
          player2 = this.players[1];

      if(this.players.length == 2 && !this.setTurn) {
        this.setTurn = true;
        if(player1.hierarcy < player2.hierarcy) {
          player1.turn = { isTurn: false, action: 1, disableHeal: true };
          player2.turn = { isTurn: true, action: 1, disableHeal: true };
        } else {
          player1.turn = { isTurn: true, action: 1, disableHeal: true };
          player2.turn = { isTurn: false, action: 1, disableHeal: true };
        }
      }
      localStorage.setItem('players', JSON.stringify(this.players));
    }
  }
});