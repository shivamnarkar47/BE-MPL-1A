package controllers

import (
	"context"
	"hello/models"
	"hello/responses"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetAllProducts(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)

	var products []models.Product

	defer cancel()

	ps, err := productCollection.Find(ctx, bson.M{})
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(responses.ProductResponse{
			Status:  http.StatusNotFound,
			Message: "No such collection.",
			Data:    &fiber.Map{"Data": err.Error()},
		})
	}

	if err = ps.All(ctx, &products); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.ProductResponse{
			Status:  http.StatusBadRequest,
			Message: "Error In Cursor Fetching",
			Data:    &fiber.Map{"Data": err.Error()},
		})
	}

	return c.Status(http.StatusOK).JSON(
		responses.ProductResponse{
			Status:  http.StatusOK,
			Message: "Got all Products",
			Data:    &fiber.Map{"Data": products},
		})
}

func GetSpecificProduct(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	id := c.Params("id")

	var product models.Product
	defer cancel()
	objectId, err1 := primitive.ObjectIDFromHex(id)
	if err1 != nil {
		return c.JSON(http.StatusBadRequest)
	}
	err := productCollection.FindOne(ctx, bson.M{"id": objectId}).Decode(&product)

	if err != nil {
		return c.Status(http.StatusNotFound).JSON(responses.ProductResponse{
			Status:  http.StatusNotFound,
			Message: "Not found such Product in collection",
			Data:    &fiber.Map{"Data": err.Error()},
		})
	}

	return c.Status(http.StatusFound).JSON(responses.ProductResponse{
		Status:  http.StatusFound,
		Message: "Here is your product details",
		Data:    &fiber.Map{"Product Data": product},
	})

}
