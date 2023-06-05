package commands

import (
	"fmt"
	"net/url"
	"regexp"

	"github.com/Postcord/objects"
	"github.com/Postcord/objects/permissions"
	"github.com/Postcord/router"
	"github.com/SocialFeedsBot/interactions/api"
	"github.com/sirupsen/logrus"
)

func RegisterAdd(r *router.CommandRouter) {
	group, er := r.NewCommandGroup("add", "Add a new feed to a channel.", &router.CommandGroupOptions{
		DefaultPermissions: permissions.ManageWebhooks,
		UseInDMs:           false,
	})

	if er != nil {
		logrus.Errorf("Error while creating command group: %s", er)
		return
	}

	BuildReddit(group)
	BuildTwitch(group)
	BuildTwitter(group)
	BuildRSS(group)
	BuildStatusPage(group)
	BuildYouTube(group)
	BuildRoblox(group)
}

func BuildReddit(group *router.CommandGroup) {
	group.NewCommandBuilder("reddit").
		Description("Add a subreddit feed to a channel.").
		StringOption("subreddit", "Name of the subreddit.", true, nil).
		ChannelOption("channel", "Channel to send subreddit updates to.", true).
		StringOption("message", "Custom message to send with new updates.", false, nil).
		BoolOption("no-embed", "Show any updates as plain text.", false).
		Handler(func(c *router.CommandRouterCtx) error {
			channel := c.Options["channel"].(router.Resolvable[objects.Channel]).Resolve()
			feedOptions := api.FeedOptions{}

			if c.Options["message"] != nil {
				feedOptions.Message = c.Options["message"].(string)
			}
			if c.Options["no-embed"] != nil {
				feedOptions.NoEmbed = c.Options["no-embed"].(bool)
			}

			c.DeferredChannelMessageWithSource(func(ctx *router.CommandRouterCtx) error {
				resp, err := api.DefaultAPI.CreateFeed(ctx.GuildID.String(), api.CreateFeedData{
					URL:       ctx.Options["subreddit"].(string),
					Type:      "reddit",
					ChannelID: channel.ID.String(),
					NSFW:      channel.NSFW,
					Options:   feedOptions,
				})

				if err != nil {
					ctx.SetContent(":x: Something went wrong when creating this feed.")
					ctx.SetEmbed(&objects.Embed{
						Description: err.Error(),
						Color:       0xff3636,
					})
					return nil
				}

				if !resp.Success {
					ctx.SetContent(":x: Something went wrong when creating this feed.")
					ctx.SetEmbed(&objects.Embed{
						Description: resp.Error,
						Color:       0xff3636,
					})
					return nil
				}

				ctx.SetContent(":white_check_mark: Successfully added this feed.")
				ctx.SetEmbed(&objects.Embed{
					Author: &objects.EmbedAuthor{
						Name:    resp.FeedData.Title,
						IconURl: resp.FeedData.Icon,
					},
					Color: 0x36ff65,
				})

				return nil
			})
			return nil
		}).
		MustBuild()
}

func BuildTwitch(group *router.CommandGroup) {
	group.NewCommandBuilder("twitch").
		Description("Add a Twitch streamer to a channel.").
		StringOption("username", "Name of the streamer.", true, nil).
		ChannelOption("channel", "Channel to send live updates to.", true).
		StringOption("message", "Custom message to send with new updates.", false, nil).
		BoolOption("no-embed", "Show any updates as plain text.", false).
		Handler(func(c *router.CommandRouterCtx) error {
			channel := c.Options["channel"].(router.Resolvable[objects.Channel]).Resolve()
			feedOptions := api.FeedOptions{}

			if c.Options["message"] != nil {
				feedOptions.Message = c.Options["message"].(string)
			}
			if c.Options["no-embed"] != nil {
				feedOptions.NoEmbed = c.Options["no-embed"].(bool)
			}

			c.DeferredChannelMessageWithSource(func(ctx *router.CommandRouterCtx) error {
				resp, err := api.DefaultAPI.CreateFeed(ctx.GuildID.String(), api.CreateFeedData{
					URL:       ctx.Options["username"].(string),
					Type:      "twitch",
					ChannelID: channel.ID.String(),
					NSFW:      channel.NSFW,
					Options:   feedOptions,
				})

				if err != nil {
					ctx.SetContent(":x: Something went wrong when creating this feed.")
					ctx.SetEmbed(&objects.Embed{
						Description: err.Error(),
						Color:       0xff3636,
					})
					return nil
				}

				if !resp.Success {
					ctx.SetContent(":x: Something went wrong when creating this feed.")
					ctx.SetEmbed(&objects.Embed{
						Description: resp.Error,
						Color:       0xff3636,
					})
					return nil
				}

				ctx.SetContent(":white_check_mark: Successfully added this feed.")
				ctx.SetEmbed(&objects.Embed{
					Author: &objects.EmbedAuthor{
						Name:    resp.FeedData.Title,
						IconURl: resp.FeedData.Icon,
					},
					Color: 0x36ff65,
				})

				return nil
			})
			return nil
		}).
		MustBuild()
}

func BuildTwitter(group *router.CommandGroup) {
	group.NewCommandBuilder("twitter").
		Description("Add a Twitter user to a channel.").
		StringOption("username", "Name of the account.", true, nil).
		ChannelOption("channel", "Channel to send live updates to.", true).
		StringOption("message", "Custom message to send with new updates.", false, nil).
		BoolOption("no-embed", "Show any updates as plain text.", false).
		BoolOption("inclide-replies", "Include any replies to tweets from this account. Default to false.", false).
		BoolOption("include-retweets", "Include retweets from this account. Default to true.", false).
		Handler(func(c *router.CommandRouterCtx) error {
			channel := c.Options["channel"].(router.Resolvable[objects.Channel]).Resolve()
			feedOptions := api.FeedOptions{}

			if c.Options["message"] != nil {
				feedOptions.Message = c.Options["message"].(string)
			}
			if c.Options["no-embed"] != nil {
				feedOptions.NoEmbed = c.Options["no-embed"].(bool)
			}
			if c.Options["include-replies"] != nil {
				feedOptions.FetchReplies = c.Options["include-replies"].(bool)
			}
			if c.Options["include-retweets"] != nil {
				feedOptions.IncludeRetweets = c.Options["include-retweets"].(bool)
			}

			c.DeferredChannelMessageWithSource(func(ctx *router.CommandRouterCtx) error {
				resp, err := api.DefaultAPI.CreateFeed(ctx.GuildID.String(), api.CreateFeedData{
					URL:       ctx.Options["username"].(string),
					Type:      "twitter",
					ChannelID: channel.ID.String(),
					NSFW:      channel.NSFW,
					Options:   feedOptions,
				})

				if err != nil {
					ctx.SetContent(":x: Something went wrong when creating this feed.")
					ctx.SetEmbed(&objects.Embed{
						Description: err.Error(),
						Color:       0xff3636,
					})
					return nil
				}

				if !resp.Success {
					ctx.SetContent(":x: Something went wrong when creating this feed.")
					ctx.SetEmbed(&objects.Embed{
						Description: resp.Error,
						Color:       0xff3636,
					})
					return nil
				}

				ctx.SetContent(":white_check_mark: Successfully added this feed.")
				ctx.SetEmbed(&objects.Embed{
					Author: &objects.EmbedAuthor{
						Name:    resp.FeedData.Title,
						IconURl: resp.FeedData.Icon,
					},
					Color: 0x36ff65,
				})

				return nil
			})
			return nil
		}).
		MustBuild()
}

func BuildRSS(group *router.CommandGroup) {
	group.NewCommandBuilder("rss").
		Description("Add an RSS page to a channel.").
		StringOption("url", "URL of the RSS page.", true, nil).
		ChannelOption("channel", "Channel to send live updates to.", true).
		StringOption("message", "Custom message to send with new updates.", false, nil).
		BoolOption("no-embed", "Show any updates as plain text.", false).
		Handler(func(c *router.CommandRouterCtx) error {
			channel := c.Options["channel"].(router.Resolvable[objects.Channel]).Resolve()
			feedOptions := api.FeedOptions{}

			if c.Options["message"] != nil {
				feedOptions.Message = c.Options["message"].(string)
			}
			if c.Options["no-embed"] != nil {
				feedOptions.NoEmbed = c.Options["no-embed"].(bool)
			}

			c.DeferredChannelMessageWithSource(func(ctx *router.CommandRouterCtx) error {
				resp, err := api.DefaultAPI.CreateFeed(ctx.GuildID.String(), api.CreateFeedData{
					URL:       ctx.Options["url"].(string),
					Type:      "rss",
					ChannelID: channel.ID.String(),
					NSFW:      channel.NSFW,
					Options:   feedOptions,
				})

				if err != nil {
					ctx.SetContent(":x: Something went wrong when creating this feed.")
					ctx.SetEmbed(&objects.Embed{
						Description: err.Error(),
						Color:       0xff3636,
					})
					return nil
				}

				if !resp.Success {
					ctx.SetContent(":x: Something went wrong when creating this feed.")
					ctx.SetEmbed(&objects.Embed{
						Description: resp.Error,
						Color:       0xff3636,
					})
					return nil
				}

				ctx.SetContent(":white_check_mark: Successfully added this feed.")
				ctx.SetEmbed(&objects.Embed{
					Author: &objects.EmbedAuthor{
						Name:    resp.FeedData.Title,
						IconURl: resp.FeedData.Icon,
					},
					Color: 0x36ff65,
				})

				return nil
			})
			return nil
		}).
		MustBuild()
}

func BuildYouTube(group *router.CommandGroup) {
	group.NewCommandBuilder("youtube").
		Description("Add an YouTube channel to a channel.").
		StringOption("account", "Name of the YouTube channel.", true, nil).
		ChannelOption("channel", "Channel to send live updates to.", true).
		StringOption("message", "Custom message to send with new updates.", false, nil).
		BoolOption("no-embed", "Show any updates as plain text.", false).
		Handler(func(c *router.CommandRouterCtx) error {
			channel := c.Options["channel"].(router.Resolvable[objects.Channel]).Resolve()
			feedOptions := api.FeedOptions{}

			if c.Options["message"] != nil {
				feedOptions.Message = c.Options["message"].(string)
			}
			if c.Options["no-embed"] != nil {
				feedOptions.NoEmbed = c.Options["no-embed"].(bool)
			}

			c.DeferredChannelMessageWithSource(func(ctx *router.CommandRouterCtx) error {
				resp, err := api.DefaultAPI.CreateFeed(ctx.GuildID.String(), api.CreateFeedData{
					URL:       ctx.Options["url"].(string),
					Type:      "youtube",
					ChannelID: channel.ID.String(),
					NSFW:      channel.NSFW,
					Options:   feedOptions,
				})

				if err != nil {
					ctx.SetContent(":x: Something went wrong when creating this feed.")
					ctx.SetEmbed(&objects.Embed{
						Description: err.Error(),
						Color:       0xff3636,
					})
					return nil
				}

				if !resp.Success {
					ctx.SetContent(":x: Something went wrong when creating this feed.")
					ctx.SetEmbed(&objects.Embed{
						Description: resp.Error,
						Color:       0xff3636,
					})
					return nil
				}

				ctx.SetContent(":white_check_mark: Successfully added this feed.")
				ctx.SetEmbed(&objects.Embed{
					Author: &objects.EmbedAuthor{
						Name:    resp.FeedData.Title,
						IconURl: resp.FeedData.Icon,
					},
					Color: 0x36ff65,
				})

				return nil
			})
			return nil
		}).
		MustBuild()
}

func BuildStatusPage(group *router.CommandGroup) {
	group.NewCommandBuilder("status").
		Description("Add a statuspage.io page to post latest incidents.").
		StringOption("url", "URL of the status page website.", true, nil).
		ChannelOption("channel", "Channel to send live incidents to.", true).
		StringOption("message", "Custom message to send with new updates.", false, nil).
		BoolOption("no-embed", "Show any updates as plain text.", false).
		Handler(func(c *router.CommandRouterCtx) error {
			channel := c.Options["channel"].(router.Resolvable[objects.Channel]).Resolve()
			feedOptions := api.FeedOptions{}

			if c.Options["message"] != nil {
				feedOptions.Message = c.Options["message"].(string)
			}
			if c.Options["no-embed"] != nil {
				feedOptions.NoEmbed = c.Options["no-embed"].(bool)
			}

			u, err := url.Parse(c.Options["url"].(string))
			if err != nil {
				logrus.Errorf("Could not parse URL: %s", err.Error())
				return err
			}

			url := fmt.Sprintf("%s://%s", u.Scheme, u.Host)

			c.DeferredChannelMessageWithSource(func(ctx *router.CommandRouterCtx) error {
				resp, err := api.DefaultAPI.CreateFeed(ctx.GuildID.String(), api.CreateFeedData{
					URL:       url,
					Type:      "statuspage",
					ChannelID: channel.ID.String(),
					NSFW:      channel.NSFW,
					Options:   feedOptions,
				})

				if err != nil {
					ctx.SetContent(":x: Something went wrong when creating this feed.")
					ctx.SetEmbed(&objects.Embed{
						Description: err.Error(),
						Color:       0xff3636,
					})
					return nil
				}

				if !resp.Success {
					ctx.SetContent(":x: Something went wrong when creating this feed.")
					ctx.SetEmbed(&objects.Embed{
						Description: resp.Error,
						Color:       0xff3636,
					})
					return nil
				}

				ctx.SetContent(":white_check_mark: Successfully added this feed.")
				ctx.SetEmbed(&objects.Embed{
					Author: &objects.EmbedAuthor{
						Name:    resp.FeedData.Title,
						IconURl: resp.FeedData.Icon,
					},
					Color: 0x36ff65,
				})

				return nil
			})
			return nil
		}).
		MustBuild()
}

func BuildRoblox(g *router.CommandGroup) {
	group, er := g.NewCommandGroup("roblox", "Add different types of Roblox announcements to a channel.", &router.CommandGroupOptions{
		DefaultPermissions: permissions.ManageWebhooks,
		UseInDMs:           false,
	})

	if er != nil {
		logrus.Errorf("Error while creating command group: %s", er)
		return
	}

	// GROUPS
	group.NewCommandBuilder("group").
		Description("Notifications about new Roblox group shouts.").
		StringOption("url", "Link to the Roblox group.", true, nil).
		ChannelOption("channel", "Channel to send live updates to.", true).
		StringOption("message", "Custom message to send with new updates.", false, nil).
		BoolOption("no-embed", "Show any updates as plain text.", false).
		Handler(func(c *router.CommandRouterCtx) error {
			channel := c.Options["channel"].(router.Resolvable[objects.Channel]).Resolve()
			feedOptions := api.FeedOptions{}

			if c.Options["message"] != nil {
				feedOptions.Message = c.Options["message"].(string)
			}
			if c.Options["no-embed"] != nil {
				feedOptions.NoEmbed = c.Options["no-embed"].(bool)
			}

			regex := regexp.MustCompile(`\d+`)
			found := regex.FindAllString(c.Options["url"].(string), -1)

			if len(found) == 0 {
				c.SetEmbed(&objects.Embed{
					Title:       ":x: Something went wrong creating this feed!",
					Description: "You need to provide a URL to the group page.",
					Color:       0xf54e42,
				})
				return nil
			}

			c.DeferredChannelMessageWithSource(func(ctx *router.CommandRouterCtx) error {
				resp, err := api.DefaultAPI.CreateFeed(ctx.GuildID.String(), api.CreateFeedData{
					URL:       found[0],
					Type:      "roblox-group",
					ChannelID: channel.ID.String(),
					NSFW:      channel.NSFW,
					Options:   feedOptions,
				})

				if err != nil {
					ctx.SetContent(":x: Something went wrong when creating this feed.")
					ctx.SetEmbed(&objects.Embed{
						Description: err.Error(),
						Color:       0xff3636,
					})
					return nil
				}

				if !resp.Success {
					ctx.SetContent(":x: Something went wrong when creating this feed.")
					ctx.SetEmbed(&objects.Embed{
						Description: resp.Error,
						Color:       0xff3636,
					})
					return nil
				}

				ctx.SetContent(":white_check_mark: Successfully added this feed.")
				ctx.SetEmbed(&objects.Embed{
					Author: &objects.EmbedAuthor{
						Name:    resp.FeedData.Title,
						IconURl: resp.FeedData.Icon,
					},
					Color: 0x36ff65,
				})

				return nil
			})
			return nil
		}).
		MustBuild()
}
