package models

import (
)

type Product struct {
	Name        string    `json:"name"`
	Price       string    `json:"price"`
	Quantity    int       `json:"quantity"`
	ImageURL    string    `json:"imageurl"`
	CompanyName string    `json:"companyname"`
}
