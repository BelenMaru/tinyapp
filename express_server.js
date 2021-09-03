const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");
app.use(cookieParser());
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
// Registration objects
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

//find a user object containing a matching email
const findUserByEmail = (email, users) => {
  // return Object.keys(usersDb).find(key => usersDb[key].email === email)
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId]; // return the user object
    }
  }
  return false;
};

//Authenticate User
const authenticateUser = (email, password, users) => {
  // contained the user info if found or false if not
  const userFound = findUserByEmail(email, users);

  if (userFound && userFound.password === password) {
    return userFound;
  }
  return false;
}

//Log in a user
app.get("/login", (req, res) => {
  const templateVars = {
    users: req.cookies["userID"],
    user: null

    // email: req.cookies["user_id"],
  };
  res.render("urls_login", templateVars);
});

//Register New User
app.get("/register", (req, res) => {
  const templateVars = {
    user:null
   
    // email: req.cookies["user_id"],
  };
  res.render("register", templateVars);
});

app.get("/urls/new", (req, res) => { 
  const userId = req.cookies.user_id
  const user =  users[userId]
  const templateVars = { urls: urlDatabase, user:user};  // Get rout to show form
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const userId = req.cookies.user_id
  const user =  users[userId]
  const templateVars = { urls: urlDatabase, user:user};
  console.log(user)

  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies.user_id
  const user =  users[userId]
 const longURL = urlDatabase[req.params.id];
  // const templateVars = { shortURL: req.params.id, longURL: longURL, username: req.cookies.username};

  const templateVars = { shortURL: req.params.id, longURL: longURL, user:user};

  res.render("urls_show", templateVars);
});

// Handle the login form
app.post("/login", (req,res)=> {
  const { email, password } = req.body;
  const user = authenticateUser(email, password, users);
  if (user) {
    // log the user in
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    res.status(403);
    res.send("Please try again, invalide Credentials!.");
  }
});

// logout a user
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//handle register form
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //check if a user exists

  const userFound = findUserByEmail(email, users);
  if (userFound) {
    res.status(403);
    return res.send("You already have the email!");
  }
  if (!email) {
    res.status(403);
    return res.send("Please enter a valid email address");
  }
  if (!password) {
    res.status(403);
    return res.send("Please enter a password");
  }
  //generate a new User ID
  const newUserId = generateRandomString();

  const newUser = {
    id: newUserId,
    email,
    password,
  };

  users[newUserId] = newUser;

  //set the cookie to remeber the user
  res.cookie("user_id", newUserId);
  res.redirect("/urls");
});

// Delete url
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