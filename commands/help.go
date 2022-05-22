package commands

import (
	"fmt"
	"os"
	"strings"

	"github.com/Karitham/corde"
	"github.com/sirupsen/logrus"
)

func helpHandler(w corde.ResponseWriter, r *corde.InteractionRequest) {
	list := strings.Builder{}
	list.WriteString("Hey **%s**! I am a Discord bot to send feeds to your server!\nTo invite me to your server, type `/invite` or click the invite button.\n")
	list.WriteString("You can manage your feeds via the online dashboard with the button below.\n\nHere are some of the feeds I can post to your server:\n")

	list.WriteString(":white_small_square: Reddit\n")
	list.WriteString(":white_small_square: RSS\n")
	list.WriteString(":white_small_square: Twitter\n")
	list.WriteString(":white_small_square: Twitch\n")
	list.WriteString(":white_small_square: YouTube\n")
	list.WriteString(":white_small_square: :new: Roblox Group Shouts\n")
	list.WriteString(":white_small_square: Status pages ([example](https://discordstatus.com/))\n")

	list.WriteString("\nGet started by typing `/add` and following on with the type of feed you would like to add!")

	w.Respond(corde.NewResp().
		ActionRow(
			corde.Component{
				Type:  corde.COMPONENT_BUTTON,
				Style: corde.BUTTON_LINK,
				Label: "Invite me",
				URL:   "https://socialfeeds.app/invite",
			},
			corde.Component{
				Type:  corde.COMPONENT_BUTTON,
				Style: corde.BUTTON_LINK,
				Label: "Support Server",
				URL:   "https://socialfeeds.app/support",
			},
			corde.Component{
				Type:  corde.COMPONENT_BUTTON,
				Style: corde.BUTTON_LINK,
				Label: "Dashboard",
				URL:   "https://socialfeeds.app/dashboard",
			},
		).
		Embeds(corde.NewEmbed().
			Title("SocialFeeds").
			Color(16753451).
			Description(fmt.Sprintf(list.String(), r.Member.User.Username)),
		),
	)
}

func RegisterHelp(mux *corde.Mux) {
	var command = corde.NewSlashCommand("help", "View useful information.")
	mux.Command("help", helpHandler)

	g := corde.GuildOpt(corde.SnowflakeFromString(os.Getenv("DEV_SERVER_ID")))
	if err := mux.RegisterCommand(command, g); err != nil {
		logrus.Errorf("Error registering: ", err)
	}
}
