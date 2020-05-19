Phaserfroot.PluginManager.register(
  "Chat",
  class Chat extends Phaserfroot.Component {
    constructor( target, instanceProperties ) {
      super( {
        name: "Chat",
        owner: target,
      } );
      this.instanceProperties = instanceProperties;
      this.scene = target.scene;
      this.game = target.scene.game;

      this.owner.once( "levelSwitch", this.destroy, this );

      // Attach custom event listeners.
      this.scene.getKey( 13 ).on( "down", this.onKeyInput13, this );
      this.owner.properties.onUpdate( this.onMessageReceived, this, "_messaging_");


      // Initialize properties from parameters.
      this.value = instanceProperties[ "value" ];


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
      this.scene.getKey( 13 ).off( "down", this.onKeyInput13, this );

    }

    // CUSTOM METHODS

    onKeyInput13 () {
      this.scene.messageExternal( 'sendToRoom', [this.game.GLOBAL_VARIABLES.hostRoomName, 'chat', this.game.GLOBAL_VARIABLES.myName, this.promptUser( 'Type your message here' )] );
    }

    executeMessagechat () {
      // Executed when the 'chat' is received.
      // We are receiving a chat message from the server
      this.owner.components.getByName( "TextAutomation" )[ 0 ].text = ([this.value[0],': ',this.value[1]].join(''));
    }

    promptUser ( message ) {
      this.scene.physics.pause();
      var val = window.prompt( message );
      this.scene.physics.resume();
      return val;
    }

    onMessageReceived ( name, message ) {

      if ( message === 'chat' ) {
        this.value = this.owner.properties.get( "_messaging-value_" );
        this.executeMessagechat();
      }

    }

  }
);