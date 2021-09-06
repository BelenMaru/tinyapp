const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const bcrypt = require('bcrypt');
const {
  findUserByEmail,
  generateRandomString,
  authenticateUser,
  urlsForUser,
} = require("./helpers.js");


app.set("view engine", "ejs");
const urlDatabase_old = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca " , userID: "aJ48lW"}, 
  "9sm5xK": {longURL: "http://www.google.com" , userID: "aJ48lW"} 
  
};

const urlDatabase = {
  LLzxCr: {
    longURL: "https://www.LHL.ca",
    userID: "aJ48lW"
  },
  OJ7RrU: {
    longURL: "https://www.lighthouselabs.ca",
    userID: "aJ48lW"
  }

};


app.use(cookieSession({
  name: 'session',
  keys: ['MABEL','DALYA'],
}));

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
  },
  "123":{
    id: "123",
    email: "test@test.com",
    password: bcrypt.hashSync("1234",10),

  },
};


//Login a user
app.get("/login", (req, res) => {
  const templateVars = { user: req.session["user_id"] };
  res.render("urls_login", templateVars);
});


//Register New User
app.get("/register", (req, res) => {
  const templateVars= {
    user: req.session["user_id"],
  }
  res.render("urls_register", templateVars);
});

// GET new URL
app.get("/urls/new", (req, res) => { 
  const userId = req.session["user_id"];
  if (userId) {
    const user = users[userId];
    const templateVars = { user };
    return res.render("urls_new", templateVars);
  }
  res.redirect("/login");
});

// Found urls
app.get("/urls", (req, res) => {
   const userId = req.session["user_id"];
   if (userId) {
    const user = users[userId];
    const urls = urlsForUser(userId, urlDatabase);
    const templateVars = { urls, user };
    return res.render("urls_index", templateVars);
  }
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  if (!longURL) {
    res.status(403);
    return res.send("Please try again!URL unknown!");
  }
  longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// GET shortURL
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session["user_id"];
  const urls = urlsForUser(userId, urlDatabase);
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urls[req.params.shortURL].longURL,
    user: users[userId],
  };
  res.render("urls_show", templateVars);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });


// Handle the login form
app.post("/login", (req,res)=> {
  const { email, password } = req.body;
  const authenticatedUser = authenticateUser(email, password, users);
  if (!authenticatedUser) {
    res.status(403);
    res.send("Please have a valid credentials!");
    }
  req.session["user_id"] = authenticatedUser.id;
  res.redirect("/urls");
});

  
// logout a user
app.post("/logout", (req, res) => {
  req.session= null;
  res.redirect("/login");
});


//handle register form
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userFound = findUserByEmail(email, users);
  const hashPassword = bcrypt.hashSync(password,10);
 
  //check if a user exists
  if (userFound) {
    res.status(403);
    res.send("Please try again ! Session ended,email exists");
  }
   if (!email || !password) {
    res.status(403);
    res.send("Please enter a new email");
   }

   const newUserId = generateRandomString();
  const newUser = {
    id: newUserId,
    email,
    password: hashPassword,
  };
    //set the cookie to remember the user
    users[newUserId] = newUser;
    req.session.user_id = newUserId;
    res.redirect("/urls");
  });

// POST URLS
app.post("/urls", (req, res) => {
  const userId = req.session["user_id"];
  if (!users[userId]) {
    res.send("Please try to Login");
    res.redirect("/login");
  }

  const { longURL } = req.body;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL, shortURL, userID: userId };
  res.redirect("/urls");
});


// shortURL
app.post("/urls/:shortURL", (req, res) => {
  const user = users[req.session["user_id"]];
  const shortURL = req.params.shortURL;
  if(!user) {
    res.status(403);
    res.send("Please try logging back again! incorrect credentials.");
  }
  if (urlDatabase[shortURL].userId!== user.id) {
    console.log("userId")
    res.status(403);
    res.send("Please log in again!Not your URL");
    return;  
  }
  const updatedLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = updatedlongURL;
  res.redirect("/urls");
});

// Delete url
app.post("/urls/:shortURL/delete", (req,res) => {
delete urlDatabase[req.params.shortURL];
res.redirect("/urls");
});

 // upddate URL
app.post("/urls/:shortURL/update", (req, res) => {
const userId = req.session["user_id"];
const shortURL = req.params.shortURL;
const currentLongURL = urlDatabase[shortURL].longURL;
const templateVars = {
    shortURL: req.params.shortURL,
    longURL: currentLongURL,
    user: users[userId],
  };
  res.render("urls_show", templateVars);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});