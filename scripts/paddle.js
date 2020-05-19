Phaserfroot.PluginManager.register(
  "Paddle",
  class Paddle extends Phaserfroot.Component {
    constructor( target, instanceProperties ) {
      super( {
        name: "Paddle",
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
      this.I_am_the_host = instanceProperties[ "I am the host" ];


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
      this.owner.tags.add( 'hostPlayer' );
    }

    EVENTS_UPDATE () {
      // Executed every frame.
      if (this.I_am_the_host) {
        this.owner.y = this.scene.input.manager.mousePointer.y + this.camera.posY;
        this.scene.messageExternal( 'sendToRoom', [this.game.GLOBAL_VARIABLES.hostRoomName, 'positionPlayer1', this.game.GLOBAL_VARIABLES.myPlayerID, this.owner.y, this.game.GLOBAL_VARIABLES.hostPlayerID] );
      }
    }

    executeMessagepositionPlayer1 () {
      // Executed when the 'positionPlayer1' is received.
      // If I am the client, then position this paddle on the host's position
      if (!this.I_am_the_host) {
        if (this.value[2] == this.game.GLOBAL_VARIABLES.hostPlayerID) {
          this.owner.y = this.value[1];
        }
      }
    }

    onLevelStart2() {
      if (this.game.GLOBAL_VARIABLES.hostPlayerID == this.game.GLOBAL_VARIABLES.myPlayerID) {
        // If I am the host, then allow me to control this paddle
        this.I_am_the_host = true;
      } else {
        // If I'm not the host, don't allow me to control this paddle
        this.I_am_the_host = false;
        this.owner.alpha = 0.5;
      }

    }

    onMessageReceived ( name, message ) {

      if ( message === 'positionPlayer1' ) {
        this.value = this.owner.properties.get( "_messaging-value_" );
        this.executeMessagepositionPlayer1();
      }

    }

  }
);