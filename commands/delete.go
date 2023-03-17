package commands

import (
	"fmt"
	"strings"

	"github.com/Postcord/objects"
	"github.com/Postcord/router"
	"github.com/SocialFeedsBot/interactions/api"
	"github.com/go-redis/redis/v8"
)

func RegisterDelete(rc *redis.Client, r *router.CommandRouter, c *router.ComponentRouter) {
	r.NewCommandBuilder("delete").
		GuildCommand().
		Description("Delete a feed from a channel.").
		ChannelOption("channel", "Channel to remove the feed from", true).
		StringOption("feed", "Feed to remove", true, router.StringAutoCompleteFuncBuilder(func(ctx *router.CommandRouterCtx) ([]router.StringChoice, error) {
			feeds, _, err := api.DefaultAPI.GetServerFeeds(ctx.GuildID.GetID().String())

			if err != nil {
				return []router.StringChoice{}, nil
			}

			var choices []router.StringChoice

			for i := 0; i < len(feeds); i++ {
				if feeds[i].ChannelID == ctx.Options["channel"] && strings.Contains(strings.ToLower(feeds[i].Display.Title), strings.ToLower(ctx.Options["feed"].(string))) {
					var display string
					if feeds[i].Display.Title != "" {
						display = feeds[i].Display.Title
					} else {
						display = feeds[i].URL
					}

					choices = append(choices, router.StringChoice{
						Name:  fmt.Sprintf("%s: %s", humaniseType(feeds[i].Type), display),
						Value: feeds[i].URL,
					})
				}
			}

			return choices, nil
		})).
		GuildCommand().
		Handler(func(c *router.CommandRouterCtx) error {
			c.DeferredChannelMessageWithSource(func(ctx *router.CommandRouterCtx) error {
				channel := ctx.Options["channel"].(router.Resolvable[objects.Channel]).Resolve()
				feeds, _, err := api.DefaultAPI.GetServerFeeds(ctx.GuildID.GetID().String())

				if err != nil {
					ctx.SetContent(":x: Something went wrong removing that feed.")
					ctx.SetEmbed(&objects.Embed{
						Color:       0xff3636,
						Description: err.Error(),
					})
					return nil
				}

				var feed api.Feed
				for i := 0; i < len(feeds); i++ {
					feeds[i].GuildID = ctx.GuildID.String()
					if feeds[i].URL == ctx.Options["feed"].(string) && feeds[i].ChannelID == channel.ID.String() {
						feed = feeds[i]
						fmt.Println("found feed")
					}
				}

				if feed.Type != "" {
					_, e := api.DefaultAPI.DeleteFeed(feed)
					if e != nil {
						ctx.SetContent(":x: Something went wrong removing that feed.")
						ctx.SetEmbed(&objects.Embed{
							Color:       0xff3636,
							Description: err.Error(),
						})
						return nil
					}

					ctx.SetContent(":white_check_mark: That feed was deleted successfully.")
					return nil
				} else {
					ctx.SetContent(":x: Something went wrong removing that feed.")
					ctx.SetEmbed(&objects.Embed{
						Color:       0xff3636,
						Description: "I could not find that feed. Ensure you are selecting a feed when typing in the slash command.",
					})
					return nil
				}
			})
			return nil
		}).
		MustBuild()
}

func humaniseType(t string) string {
	var humanised string

	switch t {
	case "reddit":
		humanised = "Reddit"
	case "twitch":
		humanised = "Twitch"
	case "twitter":
		humanised = "Twitter"
	case "statuspage":
		humanised = "Status Page"
	case "rss":
		humanised = "RSS"
	case "youtube":
		humanised = "YouTube"
	case "roblox-group":
		humanised = "Roblox Group"
	}

	return humanised
}
