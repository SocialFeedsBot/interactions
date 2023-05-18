package main

import (
	"net/http"
	"os"

	"github.com/Postcord/interactions"
	"github.com/SocialFeedsBot/interactions/commands"
	"github.com/SocialFeedsBot/interactions/internal/gateway"
	"github.com/SocialFeedsBot/interactions/internal/logger"
	"github.com/go-redis/redis/v8"
	env "github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

func main() {
	logger.Format()

	// Load config
	if os.Getenv("DEV") == "true" {
		logrus.Debug("Running in development environment")
		e := env.Load(".env.dev")
		if e != nil {
			logrus.Error(e)
			return
		}
	} else {
		logrus.Debug("Running in production environment")
		e := env.Load()
		if e != nil {
			logrus.Error(e)
			return
		}
	}

	gateway := gateway.Gateway{
		Address: os.Getenv("GATEWAY_ADDRESS"),
		Secret:  os.Getenv("GATEWAY_SECRET"),
	}

	app, err := interactions.New(&interactions.Config{
		PublicKey: os.Getenv("PUBLIC_KEY"),
		Token:     "Bot " + os.Getenv("TOKEN"),
	})

	if err != nil {
		logrus.Error(err)
		return
	}

	redis := redis.NewClient(&redis.Options{
		Addr:     os.Getenv("REDIS_URL"),
		Password: os.Getenv("REDIS_PASS"),
		DB:       2,
	})

	session := gateway.CreateSession()
	go commands.RegisterCommands(app, redis, session)

	logrus.Infof("Starting on %s", os.Getenv("PORT"))
	if err := http.ListenAndServe(os.Getenv("PORT"), app.HTTPHandler()); err != nil {
		logrus.Fatal(err)
	}

	// Shutdown
	logrus.Info("Shutting down")
}
