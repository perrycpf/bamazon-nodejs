var mysql = require("mysql");
var inquirer = require("inquirer");
var cliColor = require("cli-color");
var amount = require("amount");
var figlet = require("figlet");
var cliTable = require('cli-table');

var textColor = cliColor.greenBright;
var textColor1 = cliColor.cyanBright;
var textColor2 = cliColor.xterm(27);
var textColor3 = cliColor.xterm(171);
var divider = "\n================================================================================\n";

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "1234abcd",
  database: "bamazon"
});

connection.connect(err => {
  if (err) {
    console.error("error connecting :" + err.stack);
    return;
  }
  console.log("Connected as id :" + connection.threadId);
});

figlet("Manager View", function(err, data) {
  if (err) {
    console.log(err);
    return;
  }
  console.log(data);
  console.log(textColor1("\nWelcome to Bamazon Manager View!\n" + divider));

  managerView();
});

const managerView = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "choice",
        message: "Menu Options:",
        choices: [
          "View Products for Sale",
          "View Low Inventory",
          "Add to Inventory",
          "Add New Product",
          "Exit"
        ]
      }
    ])
    .then(function(answer) {
      switch (answer.choice) {
        case "View Products for Sale":
          viewSales();
          break;
        case "View Low Inventory":
          viewLowInventory();
          break;
        case "Add to Inventory":
          addInventory();
          break;
        case "Add New Product":
          addProduct();
          break;
        default:
          exit();
      }
    });
};

const showProducts = (rows, title) => {
    console.log(`\n============================== ${title} ===============================\n`);
    var table = new cliTable({
      head: [textColor('Product Id'),
            textColor('Product Name'),
            textColor('Department'),
            textColor('Price'),
            textColor('Stock')]
    });

    for (var i in rows)
      table.push(
          [textColor1(rows[i].item_id),
          textColor2(rows[i].product_name),
          textColor1(rows[i].department_name),
          textColor3(amount.currency(rows[i].price, "CAD")),
          textColor2(rows[i].stock_quantity)]
      );

    console.log(table.toString());
    console.log(divider);
};

const viewSales = () => {
  connection.query("SELECT * FROM products", (err, rows) => {
    if (err) throw err;
    showProducts(rows, "Products for Sale");
    managerView();
  });
};

const viewLowInventory = () => {
  connection.query(
    "SELECT * FROM products WHERE stock_quantity < 5",
    (err, rows) => {
      if (err) throw err;
      showProducts(rows, "View Low Inventory");
      managerView();
    }
  );
};

const addInventory = () => {
  connection.query("SELECT * FROM products", (err, rows) => {
    if (err) throw err;
    showProducts(rows, "Products Inventory");
    inquirer
    .prompt([
      {
        type: "input",
        name: "itemId",
        message: "What product(ID) would you like to add more inventory? ",
        validate: value => {
          // Check if the item id is valid
          var itemId = Number(value);
          if (Number.isInteger(itemId) && itemId <= rows.length && itemId > 0)
            return true;
          else 
            return false;
        }
      },
      {
        type: "input",
        name: "quantity",
        message: "How many would you like to add for this product?",
        validate: value => {
          // Check if the quantity is integer and > 0
          var quantity = Number(value);
          if (Number.isInteger(quantity) && quantity > 0) 
            return true;
          else 
            return false;
        }
      }
    ])
    .then(function(answer) {
        var arrIndex = parseInt(answer.itemId) - 1;
        var updatedQuantity = parseInt(rows[arrIndex].stock_quantity) + parseInt(answer.quantity);

        connection.query(
          "UPDATE products SET ? WHERE ?",
          [
            { stock_quantity: updatedQuantity },
            { item_id: rows[arrIndex].item_id }
          ], (err, res) => {
            if (err) throw err;

            var table = new cliTable({
              head: [textColor('Product Name'),
                     textColor('Quantity Added'),
                     textColor('Inventory Total')]
            });

            table.push(
              [textColor2(rows[arrIndex].product_name),
              textColor2(answer.quantity),
              textColor2(updatedQuantity)]
            );

            console.log(textColor1("\n--------------- Inventory Added -------------------\n"));
            console.log(table.toString());
            console.log(textColor1("\n---------------- Thank You! -----------------------\n"));
            managerView();
          }
        );
    });
  });
};

const addProduct = () => {
    inquirer.prompt([
        {
            type: "input",
            name: 'name',
            message: 'Enter product name: '
        },
        {
            type: "input",
            name: "price",
            message: "Enter product price: ",
            validate: value => {
            // Check valid input price
            var price = Number(value);
            if (isNaN(price) == false && price > 0) 
                return true;
            else 
                return false;
            }    
        },
        {
            type: "input",
            name: "department",
            message: "Enter product department: ",
        },
        {
            type: "input",
            name: "quantity",
            message: "Enter product quantity: ",
            validate: value => {
            // Check if the quantity is integer and > 0
            var quantity = Number(value);
            if (Number.isInteger(quantity) && quantity > 0) 
                return true;
            else 
                return false;
            }
        }
    ])
    .then(function(answer) {
        var values = {
            product_name:answer.name,
            department_name:answer.department,
            price:answer.price,
            stock_quantity:answer.quantity
        };
        connection.query("INSERT INTO products SET ?", values, 
            (err, res) => {
                if (err) throw err;

                console.log(textColor1("\n---------- New Product Successfully Added!!! --------------\n")+divider);
                managerView();
            }
        );
    });
  };


const exit = () => {
  connection.end();
  process.exit();
};

