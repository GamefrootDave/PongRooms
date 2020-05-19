Phaserfroot.PluginManager.register(
  "Ball",
  class Ball extends Phaserfroot.Component {
    constructor( target, instanceProperties ) {
      super( {
        name: "Ball",
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

    EVENTS_UPDATE () {
      // Executed every frame.
      if (this.I_am_the_host) {
        if (this.owner.x > 960 || this.owner.x < 0) {
          this.owner.x = 480;
          this.owner.y = 270;
          this.start_the_ball(  );
        } else if (this.owner.y > 540 || this.owner.y < 0) {
          this.owner.body.velocity.y = (this.owner.body.velocity.y * -1);
        }
        this.scene.messageExternal( 'sendToRoom', [this.game.GLOBAL_VARIABLES.hostRoomName, 'positionBall', this.game.GLOBAL_VARIABLES.hostPlayerID, this.owner.posX, this.owner.posY, this.owner.body.velocity.x, this.owner.body.velocity.y] );
      }
    }

    executeMessagepositionBall () {
      // Executed when the 'positionBall' is received.
      // If I am the client, then position this ball on the host's position
      if (!this.I_am_the_host) {
        if (this.value[0] == this.game.GLOBAL_VARIABLES.hostPlayerID) {
          this.owner.posX = this.value[1];
          this.owner.posY = this.value[2];
          this.owner.body.velocity.x = (this.value[3]);
          this.owner.body.velocity.y = (this.value[4]);
        }
      }
    }

    onLevelStart2() {
      if (this.game.GLOBAL_VARIABLES.hostPlayerID == this.game.GLOBAL_VARIABLES.myPlayerID) {
        // If I am the host, then I setup the ball
        this.I_am_the_host = true;
        this.owner.body.bounce.set( 1.05 );
        this.start_the_ball(  );
      } else {
        // If I'm not the host, I just position the ball where the host says
        this.I_am_the_host = false;
        this.owner.alpha = 0.5;
      }

    }

    start_the_ball (  ) {
      this.owner.body.velocity.x = (-300);
      this.owner.body.velocity.y = 30;
    }

    onMessageReceived ( name, message ) {

      if ( message === 'positionBall' ) {
        this.value = this.owner.properties.get( "_messaging-value_" );
        this.executeMessagepositionBall();
      }

    }

  }
);