//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect(process.env.MONGODB, {useNewUrlParser: true});
//Schemas
const itemsSchema = {
  name: String
}

const listSchema = {
  name: String,
  items: [itemsSchema]
}
//models
const Item = mongoose.model("Item", itemsSchema);

const List = mongoose.model("List", listSchema);

//defaultItems

const item1 = new Item({
  name: "Welcom to To-do-list"
});
const item2 = new Item({
  name: "Press + button to add new item"
});
const item3 = new Item({
  name: "<-- hit this to delete an item"
});

const defaultItems = [item1, item2, item3];




app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("Successfully added to database");
        }
      });
      res.redirect("/");
    }
    else
    {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  });

});





app.post("/", function(req, res) {

 const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name : itemName
  });
  if(itemName == ""){
    res.send("Please enter someting")
  }

  else if(listName === "Today"){
    item.save();
    res.redirect("/");
  } 
  // else {
  //   List.findOne({name: listName}, function(err, result){
  //     result.items.push(item);
  //     result.save();
  //     res.redirect("/"+listName);
  //   });
  // }
});



app.post("/delete",function(req,res){
  const deleteItem = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(deleteItem,function(err){
      if(err){
        console.log(err);
      }else{
        res.redirect("/");
      }
    })
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull: {items: {_id: deleteItem}}}, function(err,result){
      if(!err){
        res.redirect("/"+listName);
      }
    })

  }


});




// app.get("/:customListName", function(req, res) {

//   const customListName = _.capitalize(req.params.customListName);

//   List.findOne({name: customListName}, function(err, result) {
//     if (!err) {
//       if (!result) {
//         const list = new List({
//           name: customListName,
//           items: defaultItems
//         });

//         list.save();
//         res.redirect("/"+customListName);
//       } else {
//         res.render("list", {
//           listTitle: result.name,
//           newListItems: result.items
//         });
//       }

//     }
//   });
// });



app.get("/about", function(req, res) {
  res.render("about");
});



let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port,console.log("started"));
