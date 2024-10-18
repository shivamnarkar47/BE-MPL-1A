package controllers

import (
	"context"
	"hello/configs"
	"hello/models"
	"hello/responses"
	"log"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"

	// "go.mongodb.org/mongo-driver/bson/primitive"
	// "go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var userCollection *mongo.Collection = configs.GetCollection(configs.DB, "users")

func HashPassword(password string) (string) {
    bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
    if err != nil {
    log.Fatal("Password error")
  }
    return string(bytes)
}

func CreateUser (c *fiber.Ctx) error  {
  ctx,cancel := context.WithTimeout(context.Background(),10*time.Second)

  var user models.UserType
  defer cancel()

  //validate the request body

  if err := c.BodyParser(&user); err != nil {
    return c.Status(http.StatusBadRequest).JSON(responses.UserResponse{
      Status: http.StatusBadRequest,
      Message: "Error",
      Data: &fiber.Map{"data":err.Error()},
    })
  }

  var existUser models.UserType
  err := userCollection.FindOne(ctx, bson.M{"email":user.Email}).Decode(&existUser);
  if err == nil {
    return c.Status(http.StatusConflict).JSON(responses.UserResponse{
      Status: http.StatusConflict,
      Message: "User already exists",
      Data:&fiber.Map{"data":existUser},
    })
  }

  newUser := models.UserType{
    ID: primitive.NewObjectID(),
    Name: user.Name,
    Email: user.Email,
    Password: HashPassword(user.Password),
  }

  result, err := userCollection.InsertOne(ctx,newUser)
  if err != nil {
    return c.Status(http.StatusInternalServerError).JSON(
      responses.UserResponse{
        Status: http.StatusInternalServerError,
        Message: "Error in User Collection ",
        Data: &fiber.Map{"data":err.Error()},
      })

  }

  return c.Status(http.StatusCreated).JSON(
    responses.UserResponse{
      Status: http.StatusCreated,
      Message: "Created User Successfully",
      Data: &fiber.Map{"result":result,"data":newUser},
    })



}




