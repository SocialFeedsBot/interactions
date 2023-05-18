package commands

import (
	"fmt"
	"strings"

	"github.com/Postcord/objects"
	"github.com/Postcord/router"
	"github.com/sirupsen/logrus"
)

func RegisterHelp(r *router.CommandRouter) {
	r.NewCommandBuilder("help").
		Description("View useful information about what I do.").
		Handler(func(ctx *router.CommandRouterCtx) error {
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

			ctx.AddEmbed(&objects.Embed{
				Title:       "SocialFeeds",
				Color:       16753451,
				Description: fmt.Sprintf(list.String(), ctx.Member.User.Username),
			}).AddComponentRow([]*objects.Component{
				{
					Type:  objects.ComponentTypeButton,
					Style: objects.ButtonStyleLink,
					Label: "Invite me",
					URL:   "https://socialfeeds.app/invite",
				},
				{
					Type:  objects.ComponentTypeButton,
					Style: objects.ButtonStyleLink,
					Label: "Support Server",
					URL:   "https://socialfeeds.app/support",
				},
				{
					Type:  objects.ComponentTypeButton,
					Style: objects.ButtonStyleLink,
					Label: "Dashboard",
					URL:   "https://socialfeeds.app/dashboard",
				},
			})
			logrus.Debug("here")

			return nil
		}).
		MustBuild()
}
