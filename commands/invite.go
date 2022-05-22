package commands

import (
	"fmt"
	"os"

	"github.com/Karitham/corde"
	"github.com/sirupsen/logrus"
)

func inviteHandler(w corde.ResponseWriter, r *corde.InteractionRequest, mux *corde.Mux) {
	// https://discord.com/api/oauth2/authorize?client_id=640989075452723200&permissions=536870912&scope=bot%20applications.commands
	w.Respond(corde.NewResp().
		Content("Hi! I'm **SocialFeeds**, I can provide your server with realtime updates from your favourite platforms!\nInterested? Press the button below to add me!").
		ActionRow(
			corde.Component{
				Type:  corde.COMPONENT_BUTTON,
				Style: corde.BUTTON_LINK,
				Label: "Invite me",
				URL:   fmt.Sprintf("https://discord.com/api/oauth2/authorize?client_id=%v&permissions=536870912&scope=%v", mux.AppID, "bot%20applications.commands"),
			},
		),
	)
}

func RegisterInvite(mux *corde.Mux) {
	var command = corde.NewSlashCommand("invite", "Invite me to your server.")
	mux.Command("invite", func(w corde.ResponseWriter, r *corde.InteractionRequest) {
		inviteHandler(w, r, mux)
	})

	g := corde.GuildOpt(corde.SnowflakeFromString(os.Getenv("DEV_SERVER_ID")))
	if err := mux.RegisterCommand(command, g); err != nil {
		logrus.Errorf("Error registering: ", err)
	}
}
