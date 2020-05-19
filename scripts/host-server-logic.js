Phaserfroot.PluginManager.register(
  "HostServerLogic",
  class HostServerLogic extends Phaserfroot.Component {
    constructor( target, instanceProperties ) {
      super( {
        name: "HostServerLogic",
        owner: target,
      } );
      this.instanceProperties = instanceProperties;
      this.scene = target.scene;
      this.game = target.scene.game;

      this.owner.once( "levelSwitch", this.destroy, this );

      // Attach custom event listeners.
      this.owner.on( this.owner.EVENTS.LEVEL_START, this.onLevelStart2, this );
      this.owner.properties.onUpdate( this.onMessageReceived, this, "_messaging_");


      // Initialize properties from parameters.
      this.value = instanceProperties[ "value" ];
      this.rectangle = ( typeof instanceProperties[ "rectangle" ] !== "undefined" ) ? this.scene.getChildById( instanceProperties[ "rectangle" ], true ) : null;
      this.list_of_players = instanceProperties[ "list of players" ];


      // Boot phase.


    }

    // BUILT-IN METHODS

    preUpdate () {

    }

    update () {

    }

    postUpdate () {

    }

    destroy () {
      this.owner.off( "levelSwitch", this.destroy, this );

      // Detach custom event listeners.
      this.owner.removeListener( this.owner.EVENTS.LEVEL_START, this.onLevelStart2, this );

    }

    // CUSTOM METHODS

    executeMessagegetRooms () {
      // Executed when the 'getRooms' is received.
      // A new player in the lobby is asking hosts for their room info.
      var requestingPlayerID = this.value;
      this.scene.messageExternal( 'giveRoom', [requestingPlayerID, this.game.GLOBAL_VARIABLES.myPlayerID, this.game.GLOBAL_VARIABLES.myRoomName, this.game.GLOBAL_VARIABLES.numberOfPlayers] );
    }

    executeMessagerequestToJoinRoom () {
      // Executed when the 'requestToJoinRoom' is received.
      // A player wants to join our room!
      var targetPlayerName = this.value[0];
      var targetPlayerID = this.value[1];
      this.scene.messageExternal( 'sendToPlayer', [targetPlayerID, 'addPlayerToRoom', this.game.GLOBAL_VARIABLES.myPlayerID, this.game.GLOBAL_VARIABLES.myRoomName] );
      this.owner.components.getByName( "TextAutomation" )[ 0 ].text = (String(targetPlayerName) + ' joined the game!');
      if ( !this.list_of_players ) {
        this.reportError( "`Add to List` block could not find a list called [list_of_players]." );
        return;
      }
      this.list_of_players.push( [targetPlayerID, targetPlayerName] );
      this.game.GLOBAL_VARIABLES.numberOfPlayers = this.list_of_players.length;
      this.scene.broadcast( 'Player2ID', targetPlayerID );
    }

    checkScene( message ) {
      if ( !this.scene.add ) {
        this.game.reportError( message, message, 'SCRIPT ERROR' );
      }
    }

    reportError( message ) {
      message = "(" + this.name.replace( /_[\d]+$/, "" ) + ")" + message;
      console.trace( message );
      this.game.reportError( message, message, "SCRIPT ERROR" );
    }

    onLevelStart2() {
      // Am I the host? If I am, set up the game! If not, destroy myself!
      if (this.game.GLOBAL_VARIABLES.hostPlayerID == this.game.GLOBAL_VARIABLES.myPlayerID) {
        this.checkScene( "Create Rectangle block could not create a rectangle, likely because the scene was switched before it could run.\n\nSuggestion: check whether the level has changed before running this section of code." );
        this.rectangle = this.scene.add.rectangle( 0, 0, 960, 70, 0x808080 );
        // Set shape properties to Phaserfroot compatible.
        Phaserfroot.GameObjectTools.setCommonFeatures( this.rectangle );
        this.rectangle.setPhysics( false );
        this.rectangle.anchorX = this.rectangle.displayOriginX;
        this.rectangle.anchorY = this.rectangle.displayOriginY;

        if ( !this.rectangle ) {
          this.reportError( "`Primitive set colour` block could not find an instance named [rectangle]." );
          return;
        }
        var inst = this.rectangle;
        if( inst ) {
          var color = "0x000000";
          inst.setFillStyle( color, inst.alpha );
        }
        if ( !this.rectangle ) {
          this.reportError( "`Set Instance CenterY` block could not find the instance [rectangle]." );
          return;
        }
        this.rectangle.y = this.owner.y + 20;
        if ( !this.rectangle ) {
          this.reportError( "`Set Instance Alpha` block could not find the instance [rectangle]." );
          return;
        }
        this.rectangle.alpha = 0.5;
        if ( !this.rectangle ) {
          this.reportError( "`Change Instance Depth` block could not find the instance [rectangle]." );
          return;
        }
        this.scene.addChildAfter( this.owner, this.rectangle );
        this.owner.components.getByName( "TextAutomation" )[ 0 ].text = 'Waiting for players to join...';
        this.list_of_players = [];
        if ( !this.list_of_players ) {
          this.reportError( "`Add to List` block could not find a list called [list_of_players]." );
          return;
        }
        this.list_of_players.push( [this.game.GLOBAL_VARIABLES.myPlayerID, this.game.GLOBAL_VARIABLES.myName] );
        this.game.GLOBAL_VARIABLES.numberOfPlayers = this.list_of_players.length;
      } else {
        this.owner.destroySafe();
      }

    }

    onMessageReceived ( name, message ) {

      if ( message === 'getRooms' ) {
        this.value = this.owner.properties.get( "_messaging-value_" );
        this.executeMessagegetRooms();
      }

      if ( message === 'requestToJoinRoom' ) {
        this.value = this.owner.properties.get( "_messaging-value_" );
        this.executeMessagerequestToJoinRoom();
      }

    }

  }
);