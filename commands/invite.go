package commands

import (
	"fmt"

	"github.com/Postcord/objects"
	"github.com/Postcord/router"
)

func RegisterInvite(r *router.CommandRouter) {
	r.NewCommandBuilder("invite").
		Description("Invite me to get feeds posted to your server!").
		Handler(func(ctx *router.CommandRouterCtx) error {
			ctx.SetContent("Hi! I'm **SocialFeeds**, I can provide your server with realtime updates from your favourite platforms!\nInterested? Press the button below to add me!").
				AddComponentRow([]*objects.Component{
					{
						Type:  objects.ComponentTypeButton,
						Style: objects.ButtonStyleLink,
						Label: "Invite me",
						URL:   fmt.Sprintf("https://discord.com/api/oauth2/authorize?client_id=%v&permissions=536870912&scope=%v", ctx.ApplicationID, "bot%20applications.commands"),
					},
				})

			return nil
		}).
		MustBuild()
}

/*
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
*/
