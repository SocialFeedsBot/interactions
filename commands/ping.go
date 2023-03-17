package commands

import (
	"time"

	"github.com/Postcord/router"
)

func RegisterPing(r *router.CommandRouter) {
	r.NewCommandBuilder("ping").
		Description("Say hi!").
		Handler(func(ctx *router.CommandRouterCtx) error {
			start := time.Now().UnixNano() / int64(time.Millisecond)
			_, _ = ctx.RESTClient.GetUser(ctx.Context, ctx.Member.User.ID)
			ctx.SetContentf("Pong! **%vms**", ((time.Now().UnixNano() / int64(time.Millisecond)) - start))
			return nil
		}).
		MustBuild()
}
