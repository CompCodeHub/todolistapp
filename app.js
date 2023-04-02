const express = require("express");
const bp = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.use(bp.urlencoded({ extended: true }));


// serving static folder
app.use(express.static("public"));

// Setting view engine to ejs
app.set("view engine", "ejs");


//Creating our database
mongoose.connect("mongodb+srv://admin-suyash:Suyash123@cluster0.6qiszv7.mongodb.net/todolistDB");


//Creating our schema
const itemsSchema = new mongoose.Schema({
    name: String
});

//Creating our model(collection)
const Item = mongoose.model("Item", itemsSchema);

//Creating our documents
const item1 = new Item({
    name: "Welcome to your to-do list!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item"
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
})

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);


app.get("/", function (req, res) {

    // Find items in db and log them
    Item.find().then(function (items) {
        if (items.length == 0) {
            // Inserting our documents in our collection
            Item.insertMany(defaultItems).then(function () {
                console.log("Successfully saved default items to DB.");

            }).catch(function (err) {
                console.log(err);
            });

            // Redirect to home once added
            res.redirect("/");
        }else{
            res.render("list.ejs", { listTitle: "Today", newListItems: items });
        }
        
    });



});

app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });


    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName}).then(function(list){
            list.items.push(item);
            list.save();
            res.redirect("/" + listName);
        });
    }
   

});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId).then(function(res){
            console.log("Successfully deleted item!");
        }).catch(function(err){
            console.log(err);
        });
    
        res.redirect("/");
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(function(list){
            res.redirect("/" + listName);
        });
    }

    
});


app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}).then(function(list){
        if(!list){
            const list = new List({
                name: customListName,
                items: defaultItems
            });
        
            list.save();

            res.redirect("/" + customListName);
        }else{
            res.render("list", {listTitle: list.name, newListItems: list.items});
        }
    });

    
});

app.post("/work", function (req, res) {
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});

app.listen(3000, function () {
    console.log("Server is running on port 3000");
});