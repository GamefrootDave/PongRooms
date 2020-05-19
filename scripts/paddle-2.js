Phaserfroot.PluginManager.register(
  "Paddle2",
  class Paddle2 extends Phaserfroot.Component {
    constructor( target, instanceProperties ) {
      super( {
        name: "Paddle2",
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
      this.I_am_the_client = instanceProperties[ "I am the client" ];


      // Boot phase.
      this.camera = this.scene.cameras.main;

      this.onCreate();

    }

    // BUILT-IN METHODS

    preUpdate () {

    }

    update () {
      this.EVENTS_UPDATE();

    }

    postUpdate () {

    }

    destroy () {
      this.owner.off( "levelSwitch", this.destroy, this );

      // Detach custom event listeners.
      this.owner.removeListener( this.owner.EVENTS.LEVEL_START, this.onLevelStart2, this );

    }

    // CUSTOM METHODS

    onCreate () {
      // Executed when this script is initially created.
      this.owner.body.immovable = true;
      this.owner.tags.add( 'clientPlayer' );
    }

    EVENTS_UPDATE () {
      // Executed every frame.
      if (this.I_am_the_client) {
        this.owner.y = this.scene.input.manager.mousePointer.y + this.camera.posY;
        this.scene.messageExternal( 'sendToRoom', [this.game.GLOBAL_VARIABLES.hostRoomName, 'positionPlayer2', this.game.GLOBAL_VARIABLES.myPlayerID, this.owner.y, this.game.GLOBAL_VARIABLES.hostPlayerID] );
      }
    }

    executeMessagepositionPlayer2 () {
      // Executed when the 'positionPlayer2' is received.
      // If I am the host, then position this paddle on the client's position
      if (this.value[0] != this.game.GLOBAL_VARIABLES.myPlayerID) {
        this.owner.y = this.value[1];
      }
    }

    onLevelStart2() {
      if (this.game.GLOBAL_VARIABLES.hostPlayerID != this.game.GLOBAL_VARIABLES.myPlayerID) {
        // If I'm not the host, then allow me to control this paddle
        this.I_am_the_client = true;
      } else {
        // If I am the host, don't allow me to control this paddle
        this.I_am_the_client = false;
        this.owner.alpha = 0.5;
      }

    }

    onMessageReceived ( name, message ) {

      if ( message === 'positionPlayer2' ) {
        this.value = this.owner.properties.get( "_messaging-value_" );
        this.executeMessagepositionPlayer2();
      }

    }

  }
);