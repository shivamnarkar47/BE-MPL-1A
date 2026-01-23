#!/bin/bash

# MongoDB import script for repurposeHub collection
# This script creates the repurposeHub database and imports products and tutorials data

echo "Starting MongoDB import for repurposeHub collection..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "MongoDB is not running. Starting MongoDB..."
    systemctl --user start mongod
    sleep 3
fi

# Define file paths
PRODUCTS_FILE="/home/vagabond/Documents/Clg/Sem 8/BE-MPL-2A/data/repurposeHub.products.json"
TUTORIALS_FILE="/home/vagabond/Documents/Clg/Sem 8/BE-MPL-2A/data/repurposeHub.tutorials.json"

# Check if data files exist
if [[ ! -f "$PRODUCTS_FILE" ]]; then
    echo "Error: Products file not found at $PRODUCTS_FILE"
    exit 1
fi

if [[ ! -f "$TUTORIALS_FILE" ]]; then
    echo "Error: Tutorials file not found at $TUTORIALS_FILE"
    exit 1
fi

echo "Importing products data..."
mongoimport --db repurposeHub --collection products --file "$PRODUCTS_FILE" --jsonArray

if [[ $? -eq 0 ]]; then
    echo "✓ Products imported successfully"
else
    echo "✗ Failed to import products"
    exit 1
fi

echo "Importing tutorials data..."
mongoimport --db repurposeHub --collection tutorials --file "$TUTORIALS_FILE" --jsonArray

if [[ $? -eq 0 ]]; then
    echo "✓ Tutorials imported successfully"
else
    echo "✗ Failed to import tutorials"
    exit 1
fi

echo "MongoDB import completed successfully!"
echo "Database: repurposeHub"
echo "Collections: products, tutorials"

# Verify import
echo "Verifying import..."
echo "Products count: $(mongo --quiet repurposeHub --eval "db.products.countDocuments()" 2>/dev/null || echo "N/A")"
echo "Tutorials count: $(mongo --quiet repurposeHub --eval "db.tutorials.countDocuments()" 2>/dev/null || echo "N/A")"

echo "Done!"