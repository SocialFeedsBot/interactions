package commands

import "github.com/Karitham/corde"

func RegisterCommands(mux *corde.Mux) {
	RegisterHelp(mux)
	RegisterStats(mux)
	RegisterPing(mux)
	RegisterInvite(mux)
}
