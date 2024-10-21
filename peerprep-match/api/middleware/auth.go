package middleware

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
)

// Define a custom key type to avoid collisions.
type contextKey string

// Use this key to store the user in the context.
const UserKey = contextKey("user")

type User struct {
	Id       string `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	IsAdmin  bool   `json:"isAdmin"`
}

type VerifyTokenResponse struct {
	Message string `json:"message"`
	Data    User   `json:"data"`
}

func validateToken(jwtToken string) *User {
	authServiceURL := fmt.Sprintf("%s/auth/verify-token", os.Getenv("USER_SERVICE_URL"))
	fmt.Printf("authservice url: %s\n", authServiceURL)

	// Create a new HTTP GET request
	req, err := http.NewRequest(http.MethodGet, authServiceURL, nil)
	if err != nil {
		fmt.Println("Failed to create HTTP request:", err)
		return nil
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", jwtToken))

	// Set a reasonable timeout for the HTTP request
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error contacting user service:", err)
		return nil
	}
	defer resp.Body.Close()

	// Check if the response status is 200 OK
	if resp.StatusCode != http.StatusOK {
		// TODO: maybe should check if is user service problem then return ISE
		// else return UNAUTHORIZED
		fmt.Printf("Token verification failed: %d\n", resp.StatusCode)
		return nil
	}

	// Parse the JSON response
	var res VerifyTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		fmt.Println("Failed to decode response:", err)
		return nil
	}

	fmt.Println("Token verified successfully:", res.Data)
	return &res.Data
}

func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions {
			next.ServeHTTP(w, r)
			return
		}

		authHeader := strings.Split(r.Header.Get("Authorization"), "Bearer ")
		fmt.Printf("Token: [%s]\n", r.Header.Get("Authorization"))
		if len(authHeader) != 2 {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		jwtToken := authHeader[1]
		user := validateToken(jwtToken)
		if user == nil {

			fmt.Println("Failed unauthorized!!!!")
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		fmt.Println("Ok can:", user)
		ctx := context.WithValue(r.Context(), UserKey, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
