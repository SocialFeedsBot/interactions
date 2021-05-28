module.exports = {

  InteractionType: {
    Ping: 1,
    ApplicationCommand: 2,
    MessageComponent: 3
  },

  ComponentType: {
    ActionRow: 1,
    Button: 2
  },

  ComponentButtonStyle: {
    Blurple: 1,
    Grey: 2,
    Green: 3,
    Red: 4,
    Link: 5
  },

  InteractionResponseType: {
    Pong: 1,
    ChannelMessageWithSource: 4,
    AcknowledgeWithSource: 5,
    DeferredUpdateMessage: 6, // COMPONENTS
    UpdateMessage: 7 // COMPONENTS
  },

  MessageFlags: {
    CrossPosted: 1 << 0,
    IsCrossPost: 1 << 1,
    SuppressEmbeds: 1 << 2,
    SourceMessageDeleted: 1 << 3,
    Urgent: 1 << 4,
    HasThread: 1 << 5,
    Ephemeral: 1 << 6
  },

  ApplicationCommandOptionType: {
    SubCommand: 1,
    SubCommandGroup: 2,
    String: 3,
    Integer: 4,
    Boolean: 5,
    User: 6,
    Channel: 7,
    Role: 8
  }

};
