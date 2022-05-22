// Package feedapi is a wrapper for the SocialFeeds API
package api

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"golang.org/x/time/rate"

	"github.com/sirupsen/logrus"
)

var (
	rateLimiter = rate.NewLimiter(rate.Every(time.Second/35), 1)
	MaxTimeout  = 45 * time.Second
	DefaultAPI  = API{
		Client: &http.Client{
			Timeout: 35 * time.Second,
			Transport: &http.Transport{
				IdleConnTimeout:     20 * time.Second, // Default: 90s
				MaxConnsPerHost:     100000,
				MaxIdleConnsPerHost: 100,

				// Defaults
				Dial: (&net.Dialer{
					Timeout:   5 * time.Second,
					KeepAlive: 2 * time.Second,
				}).Dial,
				ForceAttemptHTTP2:     true,
				MaxIdleConns:          1000,
				TLSHandshakeTimeout:   10 * time.Second,
				ExpectContinueTimeout: 1 * time.Second,
			},
		},
	}

	// ErrUnauthorized is returned when the API returns a 401
	ErrUnauthorized = errors.New("401 Unauthorized")
	// ErrNotFound is returned when the API returns a 404
	ErrNotFound = errors.New("404 Not Found")
	// ErrRateLimited is returned when the API is rate limited
	ErrRateLimited = errors.New("429 Rate Limited")
	// ErrResponseNotSet is returned when the API response is not set
	ErrResponseNotSet = errors.New("the response value is nil")
)

// API credentials
type API struct {
	Client    *http.Client
	UserAgent string
}

type Response struct {
	HTTP  *http.Response
	Error error
}

// Payload is a struct of the API response
type Payload struct {
	Feeds     []Feed `json:"feeds"`
	Page      int    `json:"page"`
	Pages     int    `json:"pages"`
	FeedCount int    `json:"feedCount"`
}

// Response structures
type Feed struct {
	Type           string      `json:"type"`
	URL            string      `json:"url"`
	GuildID        string      `json:"guildID"`
	Options        FeedOptions `json:"options,omitempty"`
	Display        FeedDisplay `json:"display"`
	FailedAttempts int         `json:"failedAttempts"`
	WebhookID      string      `json:"webhookID"`
	WebhookToken   string      `json:"webhookToken"`
}

type FeedOptions struct {
	FetchReplies       bool   `json:"replies"`
	ExcludeDescription bool   `json:"excludeDesc"`
	NoEmbed            bool   `json:"noEmbed"`
	TwitchUserID       string `json:"user_id"`
}

type FeedDisplay struct {
	Title string `json:"title"`
	Icon  string `json:"icon"`
}

type FeedCount struct {
	FeedCount   int64 `json:"feedCount"`
	Reddit      int64 `json:"reddit"`
	RSS         int64 `json:"rss"`
	Twitter     int64 `json:"twitter"`
	Twitch      int64 `json:"twitch"`
	StatusPage  int64 `json:"statuspage"`
	YouTube     int64 `json:"youtube"`
	RobloxGroup int64 `json:"rblxGroup"`
}

type Status struct {
	Shards []ShardStatus `json:"shards"`
}

type ShardStatus struct {
	Uptime int64  `json:"uptime"`
	Memory int64  `json:"memory"`
	ID     string `json:"id"`
	Guilds int64  `json:"guilds"`
}

func (api *API) Request(protocol, path string, payload []byte, extraHeaders map[string]string) Response {
	var err error

	ctx, _ := context.WithDeadline(context.Background(), time.Now().Add(24*time.Hour))
	err = rateLimiter.Wait(ctx)
	if err != nil {
		return Response{nil, err}
	}

	ctx, cancel := context.WithCancel(context.TODO())
	time.AfterFunc(MaxTimeout, func() {
		cancel()
	})

	req, err := http.NewRequest(protocol, os.Getenv("API_URL")+path, bytes.NewBuffer(payload))
	if err != nil {
		return Response{nil, err}
	}
	req = req.WithContext(ctx)

	// Request the server to close the connection after the request is done
	req.Close = true
	req.Header.Add("Connection", "close")

	if os.Getenv("API_SECRET") != "" {
		req.Header.Add("Authorization", os.Getenv("API_SECRET"))
	}
	req.Header.Add("User-Agent", api.UserAgent)

	for k, v := range extraHeaders {
		req.Header.Add(k, v)
	}

	response, err := api.Client.Do(req)

	if err != nil {
		return Response{response, err}
	}

	if response == nil {
		return Response{nil, ErrResponseNotSet}
	}
	if response.StatusCode == 401 {
		return Response{response, ErrUnauthorized}
	}
	if response.StatusCode == 404 {
		return Response{response, ErrNotFound}
	}
	if response.StatusCode == 429 {
		return Response{response, ErrRateLimited}
	}

	return Response{response, nil}
}

func (response Response) GetBody() ([]byte, error) {
	var combinedErrors strings.Builder
	if response.Error != nil {
		combinedErrors.WriteString(response.Error.Error())
		combinedErrors.WriteString(" ")
	}

	// Read the body as this may contain more information about the above error
	// and explain how to fix it if it is an API-like error
	var body []byte
	var errorJSON map[string]interface{}
	if response.HTTP != nil {
		var readError error
		body, readError = io.ReadAll(response.HTTP.Body)
		response.HTTP.Body.Close()
		if readError != nil {
			combinedErrors.WriteString(readError.Error())
			combinedErrors.WriteString(" ")
		}

		errorJSON := make(map[string]interface{})
		_ = json.Unmarshal([]byte(body), &errorJSON)
	}

	if combinedErrors.Len() > 0 {
		if _, ok := errorJSON["message"].(string); ok {
			combinedErrors.WriteString(errorJSON["message"].(string))
		}
		return body, errors.New(combinedErrors.String())
	}

	return body, nil
}

func (response *Response) CheckResponse() error {
	if response.HTTP != nil {
		return nil
	}

	return ErrResponseNotSet
}

func (api *API) GetStatus() (Status, error) {
	data, err := api.Request(http.MethodGet, "/status", nil, nil).GetBody()
	if err != nil {
		return Status{}, err
	}

	var payload Status
	err = json.Unmarshal(data, &payload)
	if err != nil {
		return Status{}, err
	}

	return payload, nil
}

func (api *API) GetFeedCount() (FeedCount, error) {
	data, err := api.Request(http.MethodGet, "/feeds/counts", nil, nil).GetBody()
	if err != nil {
		return FeedCount{}, err
	}

	var payload FeedCount
	err = json.Unmarshal(data, &payload)
	if err != nil {
		return FeedCount{}, err
	}

	return payload, nil
}

func (api *API) GetFeeds() ([]Feed, int, error) {
	var list []Feed
	var total int
	var pages int
	var errors int
	page := 1

	data, err := api.Request(http.MethodGet, fmt.Sprintf("%v?page=%v", "/feeds", page), nil, nil).GetBody()
	if err != nil {
		return []Feed{}, 0, err
	}

	var payload Payload
	err = json.Unmarshal(data, &payload)
	if err != nil {
		return []Feed{}, 0, err
	}

	pages = payload.Pages
	total = payload.FeedCount
	list = append(list, payload.Feeds...)

	lock := sync.RWMutex{}
	wg := sync.WaitGroup{}
	for page <= pages {
		page++
		wg.Add(1)
		go func(page int) {
			data, err := api.Request(http.MethodGet, fmt.Sprintf("%v?page=%v", "/feeds", page), nil, nil).GetBody()
			if err != nil {
				logrus.Errorln(err)
			}

			var payload Payload
			err = json.Unmarshal(data, &payload)
			if err != nil {
				errors++
				logrus.Tracef("error with page %v: %v", page, err)
			}

			lock.Lock()
			list = append(list, payload.Feeds...)
			lock.Unlock()
			wg.Done()
		}(page)
	}
	wg.Wait()
	logrus.Debugf("Feed fetch success rate of %.2f%% with %v/%v feeds collected and %v errors", 100-((float32(errors)/float32(total))*100), len(list), total, errors)

	return list, total, nil
}

func (api *API) GetServerFeeds(id string) ([]Feed, int, error) {
	var list []Feed
	var total int
	var pages int
	var errors int
	page := 1

	data, err := api.Request(http.MethodGet, fmt.Sprintf("/feeds/%v?page=%v", id, page), nil, nil).GetBody()
	if err != nil {
		return []Feed{}, 0, err
	}

	var payload Payload
	err = json.Unmarshal(data, &payload)
	if err != nil {
		return []Feed{}, 0, err
	}

	pages = payload.Pages
	total = payload.FeedCount
	list = append(list, payload.Feeds...)

	lock := sync.RWMutex{}
	wg := sync.WaitGroup{}
	for page <= pages {
		page++
		wg.Add(1)
		go func(page int) {
			data, err := api.Request(http.MethodGet, fmt.Sprintf("/feeds/%v?page=%v", id, page), nil, nil).GetBody()
			if err != nil {
				logrus.Errorln(err)
			}

			var payload Payload
			err = json.Unmarshal(data, &payload)
			if err != nil {
				errors++
				logrus.Tracef("error with page %v: %v", page, err)
			}

			lock.Lock()
			list = append(list, payload.Feeds...)
			lock.Unlock()
			wg.Done()
		}(page)
	}
	wg.Wait()
	logrus.Debugf("Feed fetch success rate of %.2f%% with %v/%v feeds collected and %v errors", 100-((float32(errors)/float32(total))*100), len(list), total, errors)

	return list, total, nil
}

func (api *API) DeleteFeed(feed Feed) (Feed, error) {
	if feed.URL == "" {
		logrus.Errorf("Feed URL is empty, cannot delete feed")
		return Feed{}, errors.New("Feed URL is empty, cannot delete feed")
	}

	data, err := json.Marshal(feed)
	if err != nil {
		logrus.Debugf("error with marshalling delete feed: %v", err)
		return Feed{}, err
	}

	response, err := api.Request(http.MethodDelete, "/feeds", data, map[string]string{"Content-Type": "application/json"}).GetBody()
	if err != nil {
		logrus.Errorf("error with deleting feed on API: %v", err)
		return Feed{}, err
	}

	var payload Feed
	err = json.Unmarshal(response, &payload)
	if err != nil {
		logrus.Debugf("error with deleting feed: %v", err)
		return Feed{}, nil
	}

	logrus.Debugln("Feed successfully deleted")

	return payload, nil
}

// DeleteFeedWithAPICheck is a wrapper around DeleteFeed that checks if the API errorred and returns a separate bool based
// on the success of the API call.
func (api *API) DeleteFeedWithAPICheck(feed Feed) (error, bool) {
	isAPISuccessfull := false
	_, err := api.DeleteFeed(feed)
	if err != nil {
		logrus.Errorf("(%v) %v", feed.URL, err)
		return err, isAPISuccessfull
	} else {
		isAPISuccessfull = true
	}

	logrus.Debugf("(%v) feed deleted", feed.URL)
	return nil, isAPISuccessfull
}
