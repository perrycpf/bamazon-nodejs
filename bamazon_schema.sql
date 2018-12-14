DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

DROP TABLE IF EXISTS products;

CREATE TABLE products (
  item_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  department_name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT(10) NULL
);

DROP TABLE IF EXISTS departments;

CREATE TABLE departments (
  department_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  department_name VARCHAR(255) NOT NULL,
  over_head_costs DECIMAL(10,2) NOT NULL
);

ALTER TABLE products
ADD product_sales DECIMAL(10,2) DEFAULT 0;


INSERT INTO products (product_name, department_name, price, stock_quantity) 
VALUES ("Google Pixel 3","Cell Phones",999.89, 100 ),
	("iPhone X", "Cell Phones", 1098.89, 50),
	("Samung 4K TV","TV & Home Theatre", 2359.89, 35),
	("Polk Sound Bar", "TV & Home Theatre", 249.95, 25),
	("Panasonic Microwave","Appliances",199.99, 213),
	("Samsung Refrigerator","Appliances",1499.99, 111),
	("Sphero BB-8 Droid","Toys & Recreation", 79.99, 520),
	("Napier Tent","Toys & Recreation", 319.99, 53),
	("PlayStation 4 Console","Video Games",379.99, 374),
	("Spiderman Video Game","Video Games",79.99, 999);
	
INSERT INTO departments(department_name,over_head_costs)
VALUES ("Cell Phones", 439.50),
	("TV & Home Theatre", 300.12),
	("Appliances", 512.11),
	("Toys & Recreation", 412.22),
	("Video Games", 135.18);
