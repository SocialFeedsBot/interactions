package commands

import (
	"os"
	"time"

	"github.com/Karitham/corde"
	"github.com/sirupsen/logrus"
)

func pingHandler(w corde.ResponseWriter, r *corde.InteractionRequest, mux *corde.Mux) {
	start := time.Now().UnixNano() / int64(time.Millisecond)
	_, _ = mux.GetCommands()
	w.Respond(corde.NewResp().Contentf("Average roundrip: **%vms**", ((time.Now().UnixNano() / int64(time.Millisecond)) - start)))
}

func RegisterPing(mux *corde.Mux) {
	var command = corde.NewSlashCommand("ping", "Say hi!")
	mux.Command("ping", func(w corde.ResponseWriter, r *corde.InteractionRequest) {
		pingHandler(w, r, mux)
	})

	g := corde.GuildOpt(corde.SnowflakeFromString(os.Getenv("DEV_SERVER_ID")))
	if err := mux.RegisterCommand(command, g); err != nil {
		logrus.Errorf("Error registering: ", err)
	}
}
