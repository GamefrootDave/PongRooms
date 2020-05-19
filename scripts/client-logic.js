Phaserfroot.PluginManager.register(
  "ClientLogic",
  class ClientLogic extends Phaserfroot.Component {
    constructor( target, instanceProperties ) {
      super( {
        name: "ClientLogic",
        owner: target,
      } );
      this.instanceProperties = instanceProperties;
      this.scene = target.scene;
      this.game = target.scene.game;

      this.owner.once( "levelSwitch", this.destroy, this );

      // Attach custom event listeners.
      this.owner.on( this.owner.EVENTS.LEVEL_START, this.onLevelStart2, this );


      // Initialize properties from parameters.
      this.rectangle = ( typeof instanceProperties[ "rectangle" ] !== "undefined" ) ? this.scene.getChildById( instanceProperties[ "rectangle" ], true ) : null;


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
      // Am I the client? If I am, set up the game! If not, destroy myself!
      if (this.game.GLOBAL_VARIABLES.hostPlayerID != this.game.GLOBAL_VARIABLES.myPlayerID) {
        this.owner.y = this.owner.y + 50;
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
        this.owner.components.getByName( "TextAutomation" )[ 0 ].text = ('You have joined ' + String(this.game.GLOBAL_VARIABLES.hostRoomName));
      } else {
        this.owner.destroySafe();
      }

    }

  }
);