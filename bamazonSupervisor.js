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
var divider = "\n=====================================================================================\n";

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

figlet("Supervisor View", function(err, data) {
  if (err) {
    console.log(err);
    return;
  }
  console.log(data);
  console.log(textColor1("\nWelcome to Bamazon Supervisor View!\n" + divider));

  supervisorView();
});

const supervisorView = () => {
    inquirer
      .prompt([
        {
          type: "list",
          name: "choice",
          message: "Menu Options:",
          choices: [
            "View Product Sales by Department",
            "Create New Department",
            "Exit"
          ]
        }
      ])
      .then(function(answer) {
        switch (answer.choice) {
          case "View Product Sales by Department":
            viewSales();
            break;
          case "Create New Department":
            createNewDept();
            break;
          default:
            exit();
        }
      });
  };

  const viewSales = () => {
    var queryString = "SELECT b.department_id, b.department_name, b.over_head_costs, " + 
                      "sum(a.product_sales) as product_sales, (sum(a.product_sales) - b.over_head_costs) as total_profit " + 
                      "FROM products a, departments b WHERE a.department_name = b.department_name GROUP BY b.department_name";
    connection.query(queryString, (err, rows) => {
    if (err) throw err;
    var table = new cliTable({
        head: [textColor('Department Id'),
               textColor('Department Name'),
               textColor('Overhead Costs'),
               textColor('Product Sales'),
               textColor('Total Profit')]
    });

    console.log(`\n=================================== View Sales ======================================\n`);
    for (var i in rows)
        table.push(
            [textColor1(rows[i].department_id),
            textColor2(rows[i].department_name),
            textColor1(rows[i].over_head_costs),
            textColor3(amount.currency(rows[i].product_sales, "CAD")),
            textColor2(amount.currency(rows[i].total_profit, "CAD"))]
        );
    console.log(table.toString());
    console.log(divider);

    supervisorView();
    });
  }

  const createNewDept = () => {
    inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "Enter the department name: "
      },
      {
        type: "input",
        name: "cost",
        message: "Enter the overhead cost: ",
        validate: value => {
            // Check valid input price
            var cost = Number(value);
            if (isNaN(cost) == false && cost > 0) 
                return true;
            else 
                return false;
            }  
      }
    ])
    .then(function(answer) { 
        var values = {
            department_name:answer.name,
            over_head_costs:answer.cost
        };
        connection.query("INSERT INTO departments SET ?", values, 
            (err, res) => {
                if (err) throw err;

                console.log(textColor1("\n---------- New Department Successfully Added!!! --------------\n")+divider);
                supervisorView();
            }
        );
    })
  }

  const exit = () => {
    connection.end();
    process.exit();
  };
  