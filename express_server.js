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


const urlDatabase = {
  LLzxCr: {
    longURL: "https://www.LHL.ca",
    userID: "123"
  },
  OJ7RrU: {
    longURL: "https://www.lighthouselabs.ca",
    userID: "123"
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
   if (!userId) {
     return res.redirect("/login");
   }

    const user = users[userId];
    const urls = urlsForUser(userId, urlDatabase);
    const templateVars = { urls, user };
    return res.render("urls_index", templateVars);
  
 
});

app.get("/", (req,res) => {
  return res.redirect("/urls/new");
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
  if(!userId) {
    return res.send("You are not loggedIn");
  }
  console.log(userId);
  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL]
  if(url.userID !== userId) {
    return res.send("This is not your URL");
  }

const longURL = urlDatabase[shortURL];
  const templateVars = {
    shortURL,
    longURL,
    user: users[userId],
  };
  res.render("urls_show", templateVars);
});


// Handle the login form
app.post("/login", (req,res)=> {
  const { email, password } = req.body;
  const authenticatedUser = authenticateUser(email, password, users);
  if (!authenticatedUser) {
    res.status(403);
    return res.send("Please have a valid credentials!");
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
  console.log(user);
  const shortURL = req.params.shortURL;
  if(!user) {
    res.status(403);
    res.send("Please try logging back again! incorrect credentials.");
  }
  console.log("user");
  console.log(urlDatabase[shortURL]);
  if (urlDatabase[shortURL].userID!== user.id) {
    
    console.log("userId", user);
    res.status(403);
    res.send("Please log in again!Not your URL");
    return;  
  }
  const updatedLongURL = req.body.updateUrl;
  console.log("updatedLongURL ");
  console.log(req.body)
  urlDatabase[shortURL].longURL = updatedLongURL;
  console.log(urlDatabase[shortURL])
  res.redirect("/urls");
});

// Delete URL
app.post("/urls/:shortURL/delete", (req,res) => {
  const deleteURL = req.params.shortURL;
  const userId = req.session["user_id"];
  const user = users[userId]; 
  
  if(!user) {
    return res.send("You don't have permission to delete this URL");
  }
  console.log(user);

  const shortURL = req.params.shortURL;
  console.log(shortURL);
  console.log(urlDatabase[req.params.shortURL].userID);

  const userIdData = urlDatabase[req.params.shortURL].userID;
  if(userId === userIdData){
  delete urlDatabase[req.params.shortURL];
  }
  return res.redirect("/urls")
});

 // Update URL
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