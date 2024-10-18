package controllers

import (
	"context"
	"hello/configs"
	"hello/models"
	"hello/responses"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/mongo"
)

var productCollection *mongo.Collection = configs.GetCollection(configs.DB, "products")

func CreateProduct(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)

	var product models.Product
	defer cancel()

	if err := c.BodyParser(&product); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.ProductResponse{
			Status:  http.StatusBadRequest,
			Message: "Error",
			Data:    &fiber.Map{"Product Error: ": err.Error()},
		})
	}

	newProduct := models.Product{
		Name:        product.Name,
		Price:       product.Price,
		Quantity:    product.Quantity,
		ImageURL:    product.ImageURL,
		CompanyName: product.CompanyName,
	}

	result, err := productCollection.InsertOne(ctx, newProduct)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(
			responses.ProductResponse{
				Status:  http.StatusInternalServerError,
				Message: "Error in Product Collection : ",
				Data:    &fiber.Map{"P-Collection Error: ": err.Error()},
			})
	}

	return c.Status(http.StatusCreated).JSON(
		responses.ProductResponse{
			Status:  http.StatusCreated,
			Message: "Created Product successfully",
			Data:    &fiber.Map{"result": result, "product": newProduct},
		})

}
