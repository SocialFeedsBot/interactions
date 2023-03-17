package commands

import (
	"fmt"
	"strings"
	"time"

	"github.com/Postcord/objects"
	"github.com/Postcord/router"
	"github.com/SocialFeedsBot/interactions/api"
	"github.com/SocialFeedsBot/interactions/internal/health"
	"github.com/dustin/go-humanize"
	"github.com/sirupsen/logrus"
)

func RegisterStats(r *router.CommandRouter) {
	r.NewCommandBuilder("stats").
		Description("View statistical information!").
		Handler(func(ctx *router.CommandRouterCtx) error {
			ctx.DeferredChannelMessageWithSource(func(r *router.CommandRouterCtx) error {
				status, err := api.DefaultAPI.GetStatus()
				if err != nil {
					logrus.Errorf("unable to retrieve status: %s", err.Error())
					return nil
				}

				_, guild, err := api.DefaultAPI.GetServerFeeds(r.GuildID.String())
				if err != nil {
					logrus.Errorf("unable to retrieve guild feeds: %s", err.Error())
					return nil
				}

				counts, err := api.DefaultAPI.GetFeedCount()
				if err != nil {
					logrus.Errorf("unable to retrieve counts: %s", err.Error())
					return nil
				}

				mem, err := health.GetMemory()
				if err != nil {
					mem = 0
				}

				var guildCount int64 = 0
				var shardCount int = 0

				for x, y := range status.Sharders {
					guildCount = guildCount + y.Guilds
					shardCount = shardCount + len(status.Sharders[x].Shards)
				}

				leftStats := strings.Builder{}
				leftStats.WriteString("**•**  Total feeds: **%s**\n")
				leftStats.WriteString("**•**  Feeds this server: **%s**\n")
				leftStats.WriteString("**•**  Twitter: **%s**\n")
				leftStats.WriteString("**•**  Twitch: **%s**\n")
				leftStats.WriteString("**•**  Roblox Group: **%s**\n")

				rightStats := strings.Builder{}
				rightStats.WriteString("**•**  YouTube: **%s**\n")
				rightStats.WriteString("**•**  Reddit: **%s**\n")
				rightStats.WriteString("**•**  RSS: **%s**\n")
				rightStats.WriteString("**•**  Status Pages: **%s**\n")

				r.SetEmbed(&objects.Embed{
					Color:     16753451,
					Title:     "SocialFeeds Statistics",
					Thumbnail: &objects.EmbedThumbnail{URL: "https://cdn.discordapp.com/avatars/640989075452723200/dbb05aafdc1a4c62163b3f69b3e7088b.png"},
					Fields: []*objects.EmbedField{
						{Name: "Feeds", Value: fmt.Sprintf(leftStats.String(), humanize.Comma(counts.FeedCount), humanize.Comma(int64(guild)), humanize.Comma(counts.Twitter), humanize.Comma(counts.Twitch), humanize.Comma(counts.RobloxGroup)), Inline: true},
						{Name: "\u200b", Value: fmt.Sprintf(rightStats.String(), humanize.Comma(counts.YouTube), humanize.Comma(counts.Reddit), humanize.Comma(counts.RSS), humanize.Comma(counts.StatusPage)), Inline: true},
						{Name: "\u200b", Value: "\u200b", Inline: true},
						{Name: "Uptime", Value: strings.TrimSpace(humanize.RelTime(health.StartTime, time.Now(), "", "")), Inline: true},
						{Name: "Memory", Value: humanize.Bytes(mem), Inline: true},
						{Name: "Servers", Value: fmt.Sprintf("%s (shards: %d)", humanize.Comma(guildCount), shardCount), Inline: true},
					},
				})

				return nil
			})
			return nil
		}).
		MustBuild()
}
