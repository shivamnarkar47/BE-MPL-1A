package controllers

import (
	"context"
	"hello/models"
	"hello/responses"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/crypto/bcrypt"
)

func CheckPasswordHash(password, hash string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err==nil
}

func LoginUser(c *fiber.Ctx) error {
  ctx,cancel := context.WithTimeout(context.Background(),10*time.Second)

  var user models.UserType
  var existUser models.UserType
  defer cancel()

  if err := c.BodyParser(&user); err !=nil{
    return c.Status(http.StatusInternalServerError).JSON(responses.UserResponse{
      Status: http.StatusInternalServerError,
      Message: "Error while Login",
      Data: &fiber.Map{"data":err.Error()},
    })
  }

  err := userCollection.FindOne(ctx, bson.M{"email":user.Email}).Decode(&existUser);

  if err != nil {
    return c.Status(http.StatusInternalServerError).JSON(responses.UserResponse{
      Status: http.StatusInternalServerError,
      Message: "Login credentials Not Found",
      Data: &fiber.Map{"data":err.Error()},
    })
  }

  phash := CheckPasswordHash(user.Password,existUser.Password) 
  if !phash  {
    return c.Status(http.StatusInternalServerError).JSON(responses.UserResponse{
      Status: http.StatusInternalServerError,
      Message: "Not matching password",
      Data: &fiber.Map{"Data":existUser,"Inserted Data":user,"error":phash},
    })
  }

  return c.JSON(responses.UserResponse{
    Status: http.StatusOK,
    Message: "Login Successful ",
    Data: &fiber.Map{"email":existUser.Email,"_id":existUser.ID},
  })
   
}
