package commands

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/Karitham/corde"
	"github.com/SocialFeedsBot/interactions/api"
	"github.com/SocialFeedsBot/interactions/internal/health"
	"github.com/dustin/go-humanize"
	"github.com/sirupsen/logrus"
)

func getStats(w corde.ResponseWriter, r *corde.InteractionRequest, mux *corde.Mux) {
	counts, err := api.DefaultAPI.GetFeedCount()
	if err != nil {
		mux.EditOriginalInteraction(r.Token, corde.NewResp().Embeds(corde.NewEmbed().
			Color(0xf54e42).
			Description(":x: There was an error gathering feed statistics."),
		))
		logrus.Errorf("Error gathering feed count: %v", err)
		return
	}

	_, guild, e := api.DefaultAPI.GetServerFeeds(r.GuildID.String())
	if e != nil {
		mux.EditOriginalInteraction(r.Token, corde.NewResp().Embeds(corde.NewEmbed().
			Color(0xf54e42).
			Description(":x: There was an error gathering feed statistics."),
		))
		logrus.Errorf("Error gathering guild feed count: %v", e)
		return
	}

	shards, er := api.DefaultAPI.GetStatus()
	var guildCount int64
	if er != nil {
		guildCount = 0
	}

	for _, x := range shards.Shards {
		guildCount = guildCount + x.Guilds
	}

	leftStats := strings.Builder{}
	leftStats.WriteString(":white_small_square: Total feeds: %s\n")
	leftStats.WriteString(":white_small_square: Feeds this server: %s\n")
	leftStats.WriteString(":white_small_square: Twitter: %s\n")
	leftStats.WriteString(":white_small_square: Twitch: %s\n")
	leftStats.WriteString(":white_small_square: Roblox Group: %s\n")

	rightStats := strings.Builder{}
	rightStats.WriteString(":white_small_square: YouTube: %s\n")
	rightStats.WriteString(":white_small_square: Reddit: %s\n")
	rightStats.WriteString(":white_small_square: RSS: %s\n")
	rightStats.WriteString(":white_small_square: Status Pages: %s\n")

	mem, err := health.GetMemory()
	if err != nil {
		mem = 0
	}

	mux.EditOriginalInteraction(r.Token, corde.NewResp().Embeds(corde.NewEmbed().
		Color(16753451).
		Title("SocialFeeds Statistics").
		Thumbnail(corde.Image{URL: "https://cdn.discordapp.com/avatars/640989075452723200/dbb05aafdc1a4c62163b3f69b3e7088b.png"}).
		FieldInline(
			"Feeds",
			fmt.Sprintf(leftStats.String(), humanize.Comma(counts.FeedCount), humanize.Comma(int64(guild)), humanize.Comma(counts.Twitter), humanize.Comma(counts.Twitch), humanize.Comma(counts.RobloxGroup)),
		).
		FieldInline(
			"\u200b",
			fmt.Sprintf(rightStats.String(), humanize.Comma(counts.YouTube), humanize.Comma(counts.Reddit), humanize.Comma(counts.RSS), humanize.Comma(counts.StatusPage)),
		).
		FieldInline("\u200b", "\u200b").
		FieldInline("Uptime", strings.TrimSpace(humanize.RelTime(health.StartTime, time.Now(), "", ""))).
		FieldInline("Memory Usage", humanize.Bytes(mem)).
		FieldInline("Servers", humanize.Comma(guildCount)),
	))
}

func statsHandler(w corde.ResponseWriter, r *corde.InteractionRequest, mux *corde.Mux) {
	w.DeferedRespond(corde.NewResp())

	go getStats(w, r, mux)
}

func RegisterStats(mux *corde.Mux) {
	var command = corde.NewSlashCommand("stats", "View statistics on the bot.")
	mux.Command("stats", func(w corde.ResponseWriter, r *corde.InteractionRequest) {
		statsHandler(w, r, mux)
	})

	g := corde.GuildOpt(corde.SnowflakeFromString(os.Getenv("DEV_SERVER_ID")))
	if err := mux.RegisterCommand(command, g); err != nil {
		logrus.Errorf("Error registering: ", err)
	}
}
