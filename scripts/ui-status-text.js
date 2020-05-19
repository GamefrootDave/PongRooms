Phaserfroot.PluginManager.register(
  "UiStatusText",
  class UiStatusText extends Phaserfroot.Component {
    constructor( target, instanceProperties ) {
      super( {
        name: "UiStatusText",
        owner: target,
      } );
      this.instanceProperties = instanceProperties;
      this.scene = target.scene;
      this.game = target.scene.game;

      this.owner.once( "levelSwitch", this.destroy, this );

      // Attach custom event listeners.
      this.owner.on( this.owner.EVENTS.LEVEL_START, this.onLevelStart2, this );
      this.owner.properties.onUpdate( this.onMessageReceived, this, "_messaging_");
      this.scene.input.on( "pointerdown", this.onPointerDown2, this );


      // Initialize properties from parameters.
      this.value = instanceProperties[ "value" ];
      this.rectangle = ( typeof instanceProperties[ "rectangle" ] !== "undefined" ) ? this.scene.getChildById( instanceProperties[ "rectangle" ], true ) : null;


      // Boot phase.
      this.camera = this.scene.cameras.main;

      this.onCreate();

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
      if ( this.delayed_event ) this.delayed_event.remove();
      if ( this.delayed_event2 ) this.delayed_event2.remove();
      this.scene.input.off( "pointerdown", this.onPointerDown2, this );

    }

    // CUSTOM METHODS

    onCreate () {
      // Executed when this script is initially created.
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
    }

    executeMessagegetPlayerID () {
      // Executed when the 'getPlayerID' is received.
      // Now we get our playerID from the socket.io server socket.id assigned to us
      this.game.GLOBAL_VARIABLES.myPlayerID = this.value;
      // Set my name
      this.game.GLOBAL_VARIABLES.myName = this.promptUser( '👋 Howdy partner! What\'s your name?' );
      this.owner.components.getByName( "TextAutomation" )[ 0 ].text = 'HOST A GAME';
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
      this.owner.components.getByName( "TextAutomation" )[ 0 ].text = ('Connecting...');
      // Request our player ID
      this.scene.messageExternal( 'getPlayerID' );
      // update list of servers accordingly, and display them as buttons
      // (code for this is on the server list UI object)
      // Then I become the HOST GAME button and allow the user to create a server

    }

    onMessageReceived ( name, message ) {

      if ( message === 'getPlayerID' ) {
        this.value = this.owner.properties.get( "_messaging-value_" );
        this.executeMessagegetPlayerID();
      }

    }

    promptUser ( message ) {
      this.scene.physics.pause();
      var val = window.prompt( message );
      this.scene.physics.resume();
      return val;
    }

    onPointerDown2 ( pointer ) {
      if ( !this.owner || !this.owner.exists ) {
        return;
      }
      var point = this.camera.getWorldPoint( pointer.x, pointer.y );
      if ( this.owner.getBounds().contains( point.x, point.y ) ) {
      if (this.owner.text == 'HOST A GAME') {
        this.game.GLOBAL_VARIABLES.myRoomName = this.promptUser( 'Name this room:' );
        this.game.GLOBAL_VARIABLES.hostRoomName = this.game.GLOBAL_VARIABLES.myRoomName;
        this.game.GLOBAL_VARIABLES.hostPlayerID = this.game.GLOBAL_VARIABLES.myPlayerID;
        this.owner.components.getByName( "TextAutomation" )[ 0 ].text = (['Creating ',this.game.GLOBAL_VARIABLES.myRoomName,'...'].join(''));
        this.delayed_event = this.scene.time.delayedCall( 2000, function() {
          if ( !this.owner || this.owner.exists === false ) {
            return;
          }
            this.scene.messageExternal( 'hostRoom', this.game.GLOBAL_VARIABLES.myRoomName );
          if ( 1 <= ( this.game.levelManager.levels.indexOf( this.scene ) + 2 ) && ( this.game.levelManager.levels.indexOf( this.scene ) + 2 ) <= this.game.levelManager.levels.length ) {
            this.game.levelManager.switchTo( ( this.game.levelManager.levels.indexOf( this.scene ) + 2 ) );
          } else {
            ( function() {
              var message = "`Go to level` block could not go to level number ( this.game.levelManager.levels.indexOf( this.scene ) + 2 ). Level numbers start at 1 and go up to the total number of levels in your game (" + this.game.levelManager.levels.length + ").";
              this.game.reportError( message, message, "SCRIPT ERROR" );
            } ).bind( this )();
          }
        }, null, this );
      }
      this.owner.alpha = 0.2;
      this.delayed_event2 = this.scene.time.delayedCall( 200, function() {
        if ( !this.owner || this.owner.exists === false ) {
          return;
        }
          this.owner.alpha = 1;
      }, null, this );

      }
    }

  }
);