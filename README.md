# ShopFlow Store

ShopFlow is a responsive e-commerce portfolio project built with HTML, CSS, and JavaScript.

The project demonstrates frontend development, shopping cart logic, browser storage, modular JavaScript, and automated testing.

## Features

- Responsive product catalog
- Product search by name and description
- Category filtering
- Shopping cart with quantity controls
- Automatic subtotal calculation
- Cart persistence using localStorage
- Modular shopping cart logic
- Automated unit tests

## Tech Stack

- HTML5
- CSS3
- JavaScript ES Modules
- Node.js built-in test runner
- Git and GitHub

## Getting Started

### Requirements

- Node.js and npm
- Python 3
- A modern web browser

### Run the application

From the project directory, run:

```powershell
py -m http.server 8000
```

Open http://localhost:8000 in your browser.

### Run automated tests

Run the following command:

```powershell
npm test
```

## Project Structure

```text
shopflow-store/
|-- index.html
|-- styles.css
|-- app.js
|-- cart.js
|-- package.json
|-- .gitignore
|-- README.md
`-- tests/
    `-- cart.test.js
```

## Current Limitations

- Product data is stored in JavaScript.
- Cart data is stored in the browser using localStorage.
- No backend API or database is implemented yet.
- Checkout and real payments are not implemented.
- This is a learning and portfolio project, not a production-ready store.

## Roadmap

- Improve automated test coverage
- Migrate the frontend to React
- Build a Python backend using Django REST Framework
- Add a database for products and orders
- Implement backend validation and authentication
- Develop Python-based store automation tools
- Deploy the application online

## License

No open-source license has been selected yet.
