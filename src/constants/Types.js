module.exports = {

  InteractionType: {
    Ping: 1,
    ApplicationCommand: 2,
    MessageComponent: 3
  },

  ComponentType: {
    ActionRow: 1,
    Button: 2,
    SelectMenu: 3
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
    /** COMPONENTS ONLY */
    DeferredUpdateMessage: 6,
    /** COMPONENTS ONLY */
    UpdateMessage: 7
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

  ApplicationCommandType: {
    CHAT_INPUT:	1,
    USER:	2,
    MESSAGE:	3
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
  },

  ChannelType: {
    Text: 0,
    DM:	1,
    Voice:	2,
    GroupDM:	3,
    Category:	4,
    News:	5,
    Store:	6,
    NewsThread:	10,
    PublicThread:	11,
    PrivateThread:	12,
    Stage: 13
  },

  SubCommandTypes: [1, 2]

};
