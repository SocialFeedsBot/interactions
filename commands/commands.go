package commands

import (
	"context"
	"os"

	"github.com/Postcord/interactions"
	"github.com/Postcord/objects"
	"github.com/Postcord/router"
	"github.com/SocialFeedsBot/interactions/internal/gateway"
	"github.com/go-redis/redis/v8"
	"github.com/sirupsen/logrus"
)

func RegisterCommands(app *interactions.App, redis *redis.Client, session *gateway.Session) {
	commandRouter := &router.CommandRouter{}
	componentRouter := &router.ComponentRouter{}

	// Register all the commands here
	RegisterPing(commandRouter)
	RegisterHelp(commandRouter)
	RegisterInvite(commandRouter)
	RegisterAdd(commandRouter)
	RegisterStats(commandRouter)
	RegisterDelete(redis, commandRouter, componentRouter)
	RegisterList(commandRouter)

	commands := commandRouter.FormulateDiscordCommands()

	router.RouterLoader().CommandRouter(commandRouter).ComponentRouter(componentRouter).Build(app)

	// Get app ID snowflake
	appID, err := objects.SnowflakeFromString(os.Getenv("APP_ID"))
	if err != nil {
		logrus.Error(err)
		return
	}

	/* Get dev server slowflake
	guildSnowflake, err := objects.SnowflakeFromString(os.Getenv("DEV_SERVER"))
	if err != nil {
		logrus.Error(err)
		return
	} */

	// Register commands
	if _, err := app.Rest().BulkOverwriteGlobalCommands(context.Background(), appID, commands); err != nil {
		logrus.Error(err)
		return
	}
}
