package routes

import (
	"hello/controllers"

	"github.com/gofiber/fiber/v2"
)

func UserRoute(app *fiber.App) {
	app.Post("/createUser", controllers.CreateUser)
	app.Post("/getUser", controllers.LoginUser)
	app.Post("/createProduct", controllers.CreateProduct)
  app.Get("/allProducts",controllers.GetAllProducts)
  app.Get("/product/:id",controllers.GetSpecificProduct)
}
