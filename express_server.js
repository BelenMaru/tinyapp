const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let randomString = '';
  const characterList = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let x = 0; x < 6; x += 1) {
    randomString += characterList.charAt(Math.floor(Math.random() * characterList.length));
  }
  return randomString;

}


app.get("/urls/new", (req, res) => {   // Get rout to show form
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {     // Add the second route and template
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/:id", (req, res) => {
 const longURL = urlDatabase[req.params.id];
  const templateVars = { shortURL: req.params.id, longURL: longURL};
  res.render("urls_show", templateVars);
});


app.post("/urls/:shortURL/delete"), (req,res) => {
  const shortURL = req.params.shortURL;
  delete  urlDatabase[shortURL];
  res.rediredct('urls');
}

app.post("/urls/:id", (req, res) => {
 
  console.log(req.params, "edit");
  res.redirect("/urls");
});


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL;  // POST request ot urlDatabase
  res.redirect('urls/' + shortURL);
  // console.log(req.body);  // Log the POST request body to the console
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
});
app.get("/u/:shortURL", (req, res) => {      // redirect shortURL to it's longURL
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});