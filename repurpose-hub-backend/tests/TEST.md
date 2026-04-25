# Testing Guide

## Overview

37 tests covering pure business logic in services and helpers.

## Setup

```bash
cd repurpose-hub-backend

# Create virtual environment
uv venv
source .venv/bin/activate

# Install dependencies
uv pip install pytest razorpay pymongo pydantic

# Run tests
python -m pytest tests/ -v
```

## Running Tests

### All tests
```bash
python -m pytest tests/ -v
```

### Specific test file
```bash
python -m pytest tests/test_cart_service.py -v
```

### With coverage
```bash
uv pip install pytest-cov
python -m pytest tests/ --cov=services --cov=helpers --cov-report=term-missing
```

## Test Structure

```
tests/
├── conftest.py                    # Pytest configuration
├── test_cart_service.py          # Cart service tests (17 tests)
├── test_eco_impact_service.py     # Eco impact tests (12 tests)
└── test_helpers.py                # Helper function tests (8 tests)
```

## Test Coverage

### Cart Service (`services/cart.py`)

| Function | Tests | Coverage |
|----------|-------|----------|
| `parse_price()` | 7 tests | String parsing, Rs. prefix, comma separators |
| `calculate_cart_total()` | 5 tests | Empty cart, single/multiple items, service fee |
| `validate_cart_amount()` | 4 tests | Valid, invalid, tolerance boundaries |

**Example:**
```python
from services.cart import parse_price, calculate_cart_total, validate_cart_amount

# Parse price with Rs. prefix
assert parse_price("Rs. 1,500") == 1500.0

# Calculate total with 20% service fee
items = [{"price": "100", "quantity": 2}]
assert calculate_cart_total(items) == 240.0  # (100*2) * 1.2

# Validate cart amount
is_valid, total = validate_cart_amount(items, 240.0)
assert is_valid is True
```

### Eco Impact Service (`services/eco_impact.py`)

| Function | Tests | Coverage |
|----------|-------|----------|
| `calculate_item_impact()` | 5 tests | Categories, defaults, case insensitivity |
| `calculate_total_impact()` | 5 tests | Empty, single, multiple, overflow handling |
| `get_impact_summary()` | 2 tests | Structure validation |

**Example:**
```python
from services.eco_impact import calculate_item_impact, calculate_total_impact

# Single item impact
result = calculate_item_impact("tops", weight_kg=0.3)
assert result["carbon_saved_kg"] > 0

# Total impact for multiple items
result = calculate_total_impact([{}, {}, {}], ["tops", "bottoms", "dresses"])
assert result["items_count"] == 3
assert len(result["breakdown"]) == 3
```

### Helpers (`helpers.py`)

| Function | Tests | Coverage |
|----------|-------|----------|
| `to_model()` | 4 tests | ObjectId conversion, None handling, immutability |
| `doc_to_dict()` | 2 tests | Conversion, None handling |
| `docs_to_list()` | 2 tests | List conversion, None filtering |

**Example:**
```python
from bson import ObjectId
from pydantic import BaseModel
from helpers import to_model, doc_to_dict, docs_to_list

class User(BaseModel):
    id: str
    email: str

# Convert MongoDB document to Pydantic model
doc = {"_id": ObjectId(), "email": "test@example.com"}
user = to_model(doc, User)
assert user.id == str(doc["_id"])

# Convert list of documents
docs = [{"_id": ObjectId(), "email": "a@example.com"}, {"_id": ObjectId(), "email": "b@example.com"}]
users = docs_to_list(docs, User)
assert len(users) == 2
```

## Adding Tests

### New service tests

```python
# tests/test_my_service.py
import pytest
from services.my_service import function_name, another_function


class TestFunctionName:
    def test_basic_case(self):
        result = function_name(input_value)
        assert result == expected_value

    def test_edge_case(self):
        result = function_name(edge_input)
        assert result is not None


class TestAnotherFunction:
    def test_with_valid_data(self):
        ...

    def test_with_empty_data(self):
        ...
```

### Integration with MongoDB

For tests requiring database:

```python
import pytest
from db import db, user_collection

@pytest.fixture
async def test_user():
    """Create test user in database."""
    user_data = {"email": "test@example.com", "password": "hashed"}
    result = await user_collection.insert_one(user_data)
    yield result.inserted_id
    await user_collection.delete_one({"_id": result.inserted_id})
```

## CI/CD

Add to `.github/workflows/test.yml`:

```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - name: Install uv
        run: pip install uv
      - name: Install dependencies
        run: uv venv && source .venv/bin/activate && uv pip install pytest razorpay pymongo pydantic
      - name: Run tests
        run: python -m pytest tests/ -v
```

## Troubleshooting

### razorpay module not found
```bash
uv pip install razorpay
```

### pymongo module not found
```bash
uv pip install pymongo
```

### datetime deprecation warnings
Use `datetime.now(timezone.utc)` instead of `datetime.utcnow()`.

## Metrics

- **Total Tests**: 37
- **Passing**: 37
- **Coverage**: Services + Helpers (pure functions)
- **Execution Time**: ~0.23s