var inquirer = require('inquirer');
var mysql = require('mysql');

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "soizic65",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    displayProducts();
})

function displayProducts() {
    console.log("Showing Products");
    var query = "SELECT * FROM products";
    connection.query(query, function (error, response) {
        for (var i = 0; i < response.length; i++) {
            console.log(response[i].item_id + " | " + response[i].product_name + " | " + response[i].department_name + " | " + response[i].price + " | " + response[i].stock_quantity);
        }
        purchaseItem();
    })
};
function purchaseItem() {
    inquirer
        .prompt([{
            name: "id",
            type: "input",
            message: "What is the item ID of the product you'd like to purchase?"

        },
        {
            name: "itemQuantity",
            type: "input",
            message: "How many would you like?",
        }])
        .then(function (answer) {
            var userItemPurchase = parseInt(answer.id)
            var userItemQuantity = parseInt(answer.itemQuantity)
            //console.log(userItemPurchase)
            connection.query(`SELECT * FROM products WHERE item_id = ${userItemPurchase}`, function (error, response) {
                var selectedItemQuantity = response[0].stock_quantity
                var updatedQuantity = selectedItemQuantity - userItemQuantity
                var itemPrice = parseInt(response[0].price);
                var totalPrice = itemPrice * userItemQuantity;
                if (userItemQuantity > selectedItemQuantity) {
                    console.log("Sorry, there is not enough of this product to meet your request.")
                }
                else {

                    connection.query(`UPDATE products SET stock_quantity = ${updatedQuantity} WHERE item_id = ${userItemPurchase}`, function (error, result) {
                        if (error) {
                            console.log(error);
                        }
                        else {
                            console.log("Your order went through!\n $" + totalPrice + " is your total.")
                            promptReorder();

                            
                        };
                    });
                };
            })
        }
        )

        function promptReorder(){
            inquirer.prompt([
                {
                    type: "confirm",
                    name: "reorder",
                    message: "Would you like to make another purchase?"
                }
            ]).then(function (answer, error) {
                if (answer.reorder) {
                    displayProducts();
                } else {
                    console.log("Thank you for shopping. Come again!")
                    connection.end();
                }
            })
        }
};


