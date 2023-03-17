package commands

import (
	"fmt"
	"strings"

	"github.com/Postcord/objects"
	"github.com/Postcord/router"
	"github.com/SocialFeedsBot/interactions/api"
)

func RegisterList(r *router.CommandRouter) {
	r.NewCommandBuilder("list").
		GuildCommand().
		Description("View a list of feeds in a channel.").
		ChannelOption("channel", "Channel to list feeds from.", true).
		Handler(func(ctx *router.CommandRouterCtx) error {
			channel := ctx.Options["channel"].(router.Resolvable[objects.Channel]).Resolve()
			serverFeeds, _, err := api.DefaultAPI.GetServerFeeds(ctx.GuildID.GetID().String())

			if err != nil {
				ctx.SetContent(":x: Something went wrong finding feeds for that channel.")
				ctx.SetEmbed(&objects.Embed{
					Color:       0xff3636,
					Description: err.Error(),
				})
				return nil
			}

			var list []string
			for i := 0; i < len(serverFeeds); i++ {
				if serverFeeds[i].ChannelID == channel.ID.String() {
					list = append(list, humaniseFeed(serverFeeds[i]))
				}
			}

			if len(list) > 8 {
				list = list[0:8]
			} else if len(list) == 0 {
				ctx.SetContent(":x: There is not any feeds setup in this channel.")
				return nil
			}

			ctx.SetEmbed(&objects.Embed{
				Title:       "Feed List",
				Color:       16753451,
				Description: fmt.Sprintf("You are now limited to 30 feeds on our basic plan, view premium tiers [here](https://socialfeeds.app/premium)\n\n%s", strings.Join(list, "\n")),
				Footer: &objects.EmbedFooter{
					Text: fmt.Sprintf("View all at socialfeeds.app | Total feeds: %v", len(serverFeeds)),
				},
			})

			return nil
		}).
		MustBuild()
}

func humaniseFeed(feed api.Feed) string {
	var humanised string
	var display string
	if feed.Display.Title != "" {
		display = feed.Display.Title
	} else {
		display = feed.URL
	}

	switch feed.Type {
	case "reddit":
		humanised = fmt.Sprintf("<:reddit:648124175378284544> [%s](https://reddit.com/r/%s)", display, feed.URL)
	case "youtube":
		humanised = fmt.Sprintf("<:youtube:644633161464020993> [%s](https://youtube.com/channel/%s)", display, feed.URL)
	case "rss":
		humanised = fmt.Sprintf("<:rss:644633161933914122> [%s](%s)", display, feed.URL)
	case "twitch":
		humanised = fmt.Sprintf("<:twitch:644633161401368577> [%s](https://twitch.tv/%s)", display, feed.URL)
	case "twitter":
		humanised = fmt.Sprintf("<:twitter:644633161212624946> [%s](https://twitter.com/%s)", display, feed.URL)
	case "statuspage":
		humanised = fmt.Sprintf("<:statuspage:809109311271600138> [Status Page: %s](%s)", display, feed.URL)
	case "roblox-group":
		humanised = fmt.Sprintf("<:roblox:977963193836142602> [Roblox Group: %s](%s)", display, feed.URL)
	}

	return humanised
}
