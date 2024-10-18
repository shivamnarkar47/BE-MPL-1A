package models

import (
  "go.mongodb.org/mongo-driver/bson/primitive"
)

type UserType struct {// {{{
  ID primitive.ObjectID  `json:"_id"`
  Name string `json:"name"`
  Email string `json:"email,omitempty"`
  Password string `json:"password,omitempty"`
  Role string `json:"role",default:"user"`
}// }}}
