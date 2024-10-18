package main

import (
	"hello/configs"
	"hello/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	app := fiber.New()
  app.Use(logger.New())
  app.Use(cors.New())
  configs.ConnectDB()

  routes.UserRoute(app)

	app.Listen(":8080")
}
