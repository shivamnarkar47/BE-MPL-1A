import requests
from bs4 import BeautifulSoup
import csv
import json


def extract_products_from_html(html_content):
    # If html_content is already a ResultSet, convert it back to HTML string
    if hasattr(html_content, "__iter__") and not isinstance(html_content, (str, bytes)):
        # Convert ResultSet to HTML string
        html_string = "".join(str(item) for item in html_content)
        soup = BeautifulSoup(html_string, "html.parser")
    else:
        # It's already a string/bytes
        soup = BeautifulSoup(html_content, "html.parser")

    products = []

    # Find all product grid items
    product_items = soup.find_all("li", class_="grid__item")

    print(f"Found {len(product_items)} product items to process")

    for item in product_items:
        try:
            # Extract product name
            name_element = item.find("a", class_="card-information__text h4")
            product_name = name_element.get_text(strip=True) if name_element else "N/A"

            # Extract price - look for regular price first, then sale price
            price_element = item.find("span", class_="price-item--regular")
            if not price_element:
                price_element = item.find("span", class_="price-item--sale")
            price = price_element.get_text(strip=True) if price_element else "N/A"

            # Extract image URL - get the first image
            img_element = item.find("img")
            image_url = img_element.get("src") if img_element else "N/A"
            # Convert relative URL to absolute if needed
            if image_url and image_url.startswith("//"):
                image_url = "https:" + image_url
            elif image_url and image_url.startswith("/"):
                image_url = "https://www.recharkha.org" + image_url

            # Extract product URL
            product_link = item.find("a", class_="card__media media-wrapper")
            product_url = product_link.get("href") if product_link else "N/A"
            if product_url and product_url.startswith("/"):
                product_url = "https://www.recharkha.org" + product_url

            # Extract vendor
            vendor_element = item.find("div", class_="card-article-info")
            vendor = vendor_element.get_text(strip=True) if vendor_element else "N/A"

            # Extract variant ID (from add-to-cart button)
            add_to_cart = item.find("add-to-cart")
            variant_id = add_to_cart.get("data-variant-id") if add_to_cart else "N/A"

            product_data = {
                "name": product_name,
                "price": price,
                "image_url": image_url,
                "product_url": product_url,
                "vendor": vendor,
                "variant_id": variant_id,
            }

            products.append(product_data)

        except Exception as e:
            print(f"Error extracting product: {e}")
            continue

    return products


# Target URL of the product page
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}

url = "https://www.recharkha.org/collections/taco-sling"

# Send a GET request to the website
response = requests.get(url, headers=headers, timeout=10)
response.raise_for_status()

# Check if the request was successful
if response.status_code == 200:
    print("Success! Status code:", response.status_code)

    # Parse the HTML content
    soup = BeautifulSoup(response.content, "html.parser")

    # Find all product containers (you MUST update these selectors)
    product_containers = soup.find_all("ul", id="product-grid")

    # Save product containers in file
    with open("product_containers.html", "w", encoding="utf-8") as file:
        file.write(str(product_containers))

    products = extract_products_from_html(product_containers)
    print(f"Found {len(products)} products:\n")

    # for container in product_containers:
    #     # Extract data for each product (update selectors)
    #     name = (
    #         container.find("a.h4").get_text(strip=True)
    #         if container.find("a.h4")
    #         else "N/A"
    #     )
    #     price = (
    #         container.find("span", class_="price").get_text(strip=True)
    #         if container.find("span", class_="price")
    #         else "N/A"
    #     )

    #     # Store the data in a dictionary
    #     product_data = {"Name": name, "Price": price}
    #     products.append(product_data)

    # # Display the results

    print(f"Successfully extracted {len(products)} products:\n")

    for i, product in enumerate(products, 1):
        print(f"Product {i}:")
        print(f"  Name: {product['name']}")
        print(f"  Price: {product['price']}")
        print(f"  Image: {product['image_url'][:80]}...")  # Show first 80 chars of URL
        print(f"  URL: {product['product_url']}")
        print(f"  Vendor: {product['vendor']}")
        print(f"  Variant ID: {product['variant_id']}")
        print("-" * 50)

    # Save to JSON file
    with open("recharkha_products.json", "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)

    print("Data saved to recharkha_products.json")

    print("Scraping completed successfully!")
else:
    print(f"Failed to retrieve the webpage. Status code: {response.status_code}")
