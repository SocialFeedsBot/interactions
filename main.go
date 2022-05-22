package main

import (
	"os"

	"github.com/Karitham/corde"
	"github.com/SocialFeedsBot/interactions/commands"
	"github.com/SocialFeedsBot/interactions/internal/gateway"
	"github.com/SocialFeedsBot/interactions/internal/logger"
	env "github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

func main() {
	logger.Format()

	// Load config
	e := env.Load()
	if e != nil {
		logrus.Error(e)
		return
	}

	gateway := gateway.Gateway{
		Address: os.Getenv("GATEWAY_ADDRESS"),
		Secret:  os.Getenv("GATEWAY_SECRET"),
	}

	appID := corde.SnowflakeFromString(os.Getenv("APP_ID"))
	mux := corde.NewMux(os.Getenv("PUBLIC_KEY"), appID, os.Getenv("TOKEN"))

	go gateway.CreateSession()
	go commands.RegisterCommands(mux)

	logrus.Infof("Starting on %s", os.Getenv("PORT"))
	if err := mux.ListenAndServe(os.Getenv("PORT")); err != nil {
		logrus.Fatal(err)
	}

	// Shutdown
	logrus.Info("Shutting down")
}
