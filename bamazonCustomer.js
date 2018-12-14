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

figlet("Bamazon Node.js", function(err, data) {
  if (err) {
    console.log(err);
    return;
  }
  console.log(data);
  console.log(textColor1("Welcome to Bamazon!\n" + divider));

  storefront();
});

const storefront = () => {
  var queryString = "SELECT * FROM products ORDER BY item_id";

  connection.query(queryString, (err, rows) => {
    if (err) throw err;
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
    makeOrder(rows);
  });
};

const makeOrder = rows => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "itemId",
        message: "What product(ID) would you like to buy? ",
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
        message: "How many would you like to buy for this product?",
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

      if (rows[arrIndex].stock_quantity >= answer.quantity) {
        var updatedQuantity = rows[arrIndex].stock_quantity - answer.quantity;
        var totalCost = rows[arrIndex].price * answer.quantity;
        var sales = rows[arrIndex].product_sales + totalCost;

        connection.query(
          "UPDATE products SET ?, ? WHERE ?",
          [
            { stock_quantity: updatedQuantity },
            { product_sales: sales },
            { item_id: rows[arrIndex].item_id }
          ],
          (err, res) => {
            if (err) throw err;

            var table = new cliTable({
              head: [textColor('Product Name'),
                     textColor('Quantity'),
                     textColor('Total Cost')]
            });

            table.push(
              [textColor2(rows[arrIndex].product_name),
              textColor2(answer.quantity),
              textColor3(amount.currency(totalCost, "CAD"))]
            );
            console.log(textColor1("\n------------- Order Completed -----------------\n"));
            console.log(table.toString());
            console.log(textColor1("\n------------- Thank You! ----------------------\n"));
            restart();
          }
        );
      } else {
        console.log(textColor("\nSorry, there is not enough product in stock for purchase!\n"));
        restart();
      }
    });
};

const restart = () => {
  inquirer
    .prompt([
      {
        type: "list",
        message: "Would you like to:",
        choices: ["Buy Again", "Exit"],
        name: "buy"
      }
    ])
    .then(function(choice) {
      if (choice.buy === "Buy Again") {
        storefront();
      } else {
        console.log(textColor("\nGood bye! Come back soon!"));
        connection.end();
        process.exit();
      }
    });
};
