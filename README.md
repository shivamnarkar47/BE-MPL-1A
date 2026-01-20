# BE-MPL-1A

## Project Overview

This repository contains the codebase for the BE-MPL-1A project. The project encompasses data scraping, backend development, and API creation for managing and displaying repurposed products. It utilizes a variety of technologies, including Python, Go, JavaScript, and TypeScript.

## Key Features & Benefits

*   **Data Scraping:** Extracts product information from web pages using Python and Beautiful Soup.
*   **Backend API:** Provides RESTful API endpoints built with Go and FastAPI (Python).
*   **Data Storage:** Stores product data in JSON files and potentially databases (not fully specified).
*   **User Authentication:** Includes login and registration functionality with password hashing.
*   **Product Management:** Allows creation and retrieval of product data.

## Prerequisites & Dependencies

Before setting up the project, ensure you have the following installed:

*   **Go:**  [https://go.dev/dl/](https://go.dev/dl/)
*   **Node.js:** [https://nodejs.org/](https://nodejs.org/) (for potentially building a frontend)
*   **Python:** [https://www.python.org/downloads/](https://www.python.org/downloads/) (version 3.7 or higher recommended)
*   **pip:** Python package installer (should come with Python)
*   **MongoDB:** (If database functionality is desired; not explicitly used in provided code, but a typical use case) [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
*   **Virtualenv/Venv:** (Recommended for Python dependency management)
*   **Docker** (Optional, for containerization)

**Python Libraries:**

*   requests
*   beautifulsoup4
*   fastapi
*   motor (for MongoDB asynchronous driver)
*   passlib
*   python-dotenv (if using .env files)
*   uvicorn (ASGI server for FastAPI)

**Go Modules:**

*   github.com/gofiber/fiber/v2
*   github.com/joho/godotenv
*   github.com/google/uuid

## Installation & Setup Instructions

Follow these steps to set up the project:

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/shivamnarkar47/BE-MPL-1A/
    cd BE-MPL-1A
    ```

2.  **Set up the Python Data Scraper Environment:**

    ```bash
    cd data-scraper
    python3 -m venv venv
    source venv/bin/activate  # On Linux/macOS
    # venv\Scripts\activate  # On Windows
    pip install -r requirements.txt  # If you have a requirements.txt, otherwise install the packages manually:
    pip install requests beautifulsoup4
    cd ..
    ```

3.  **Set up the Go Backend Environment:** (Optional)

    ```bash
    cd repurpose-hub-backend/GoLang
    go mod tidy # downloads the dependencies listed in go.mod
    cd ../../..
    ```

4.  **Set up the Python Backend Environment:**

    ```bash
    cd repurpose-hub-backend
    python3 -m venv venv
    source venv/bin/activate  # On Linux/macOS
    # venv\Scripts\activate  # On Windows
    pip install -r requirements.txt #if you have a requirements.txt, otherwise install the packages manually
    pip install fastapi uvicorn motor passlib python-dotenv
    cd ..

    ```

5.  **Configure Environment Variables (Go Backend):**

    *   Create a `.env` file in the `repurpose-hub-backend/GoLang/configs/` directory (if not already present).
    *   Define the necessary environment variables, such as database connection strings, API keys, or other configuration settings. Example:

        ```
        PORT=8080
        DATABASE_URL=mongodb://localhost:27017
        DATABASE_NAME=repurpose_hub
        ```

6. **Install Node.js Dependencies (If applicable):**

    If there's a frontend component using Node.js, navigate to the frontend directory and run:

    ```bash
    npm install
    ```

## Usage Examples & API Documentation

### Data Scraping

The `data-scraper/main.py` script can be used to extract product data from HTML files or websites.

```bash
cd data-scraper
python main.py  # You might need to modify the script to target specific websites or files
cd ..
```

**API Documentation (Go Backend):**

The Go backend provides REST API endpoints for managing products and users.  Since full documentation is unavailable, derive information from the `repurpose-hub-backend/GoLang/controllers` directory.

*   **Register:** `/register` (POST) - Creates a new user.
*   **Login:** `/login` (POST) - Authenticates a user and returns a token (implementation details not provided, may need JWT).
*   **Create Product:** `/products` (POST) - Creates a new product (requires authentication).

**Example (Register Endpoint - Go Backend):**
```go
// Register a new user
func Register(c *fiber.Ctx) error {
    // Implementation details go here based on register.go contents
}
```

**API Documentation (Python Backend - FastAPI)**

The Python backend using FastAPI likely implements endpoints such as:

*   `/users/` (POST): Create a new user
*   `/login/` (POST): Authenticate User and retrieve access token
*   `/products/` (POST, GET): Create or retrieve products

For detailed API documentation, start the FastAPI application. It is generally set up to generate documentation automatically.

```bash
cd repurpose-hub-backend
uvicorn app:app --reload
cd ..
```

Then, open your browser and go to `http://localhost:8000/docs` or `http://localhost:8000/redoc` for interactive API documentation. Replace `8000` with the port on which your application is running.

### Running the Backend (Go)
From within the `/repurpose-hub-backend/GoLang` directory:
```bash
go run main.go
```
### Running the Backend (Python)

From within the `/repurpose-hub-backend` directory:

```bash
uvicorn app:app --reload
```

## Configuration Options

*   **Environment Variables:**  The Go backend relies on environment variables defined in the `.env` file for database connection settings, port numbers, and other configurations.  Refer to `repurpose-hub-backend/GoLang/configs/env.go` for variables used.
*   **Database Configuration:**  Adjust the database connection string in the `.env` file to point to your MongoDB instance.

## Contributing Guidelines

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with clear, descriptive messages.
4.  Submit a pull request to the main branch.

## License Information

License is unspecified. All rights reserved by the owner.

## Acknowledgments

*   [Beautiful Soup](https://www.crummy.com/software/BeautifulSoup/bs4/doc/) for HTML parsing.
*   [FastAPI](https://fastapi.tiangolo.com/) for building the Python backend.
*   [Go Fiber](https://github.com/gofiber/fiber) for building the Go backend.
*   [MongoDB](https://www.mongodb.com/) for the database.

---

## Phase 1 Updates (Frontend Enhancement)

See [docs/PHASE1_UPDATES.md](docs/PHASE1_UPDATES.md) for detailed documentation of Phase 1 enhancements including:

- Enhanced product discovery (search, filters, sorting)
- Trending products section
- Wishlist/favorites system
- Personalized recommendations
- Guest checkout flow
- Product reviews & ratings
- Fixed sidebar layout

## Future Enhancements (Phase 2+)

See [docs/FUTURE_ENHANCEMENTS.md](docs/FUTURE_ENHANCEMENTS.md) for planned features including:

**User Engagement**:
- User Profiles with order history
- Eco-Impact Dashboard
- Social Sharing & Referrals

**Conversion & Trust**:
- Order Tracking
- Product Comparison
- Size Guides & FAQ

**AI/ML Features**:
- Style Quiz
- Image Search
- Price Drop Alerts

**Marketing**:
- Newsletter System
- Flash Sales
- Loyalty Points

**Technical**:
- Admin Dashboard
- Analytics & Tracking
- PWA Features
